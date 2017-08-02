const moment = require('moment');

import fetch from 'node-fetch';
import * as IDataAdapter from './data-adapter';
import * as ICacheAdapter from './cache-adapter';
import * as Errors from './errors';
import sequence from './utils/promise-sequence';

interface IGithubPaginationRels {
    [key: string]: string;
}

interface IResponseWrapper {
    rels: IGithubPaginationRels;
    response: any;
}

export default class GithubAdapter implements IDataAdapter.IDataAdapterInterface {
    private token: string;
    private username: string;
    private organizationName: string;
    private cacheAdapter: ICacheAdapter.ICacheAdapterInterface;
    private fetch: any;

    constructor(token: string, username: string, organizationName: string, cacheAdapter: ICacheAdapter.ICacheAdapterInterface, _fetch: any = fetch) {
        this.token = token;
        this.username = username;
        this.organizationName = organizationName;
        this.cacheAdapter = cacheAdapter;
        this.fetch = _fetch;
    }

    fetchData(fromDate: Date, endDate: Date): Promise<any> {
        return this.cacheAdapter.readCache().catch((err) => {
            if (!(err instanceof Errors.CacheEmptyError)) throw err;

            const items : Array<any> = [];

            const parsedFromDate : string = moment(fromDate).format('YYYY-MM-DD');
            const parsedEndDate : string = moment(endDate).format('YYYY-MM-DD');

            const firstHref = `https://api.github.com/search/issues?per_page=50&q=type:pr org:${this.organizationName} merged:${parsedFromDate}..${parsedEndDate}`;

            return this.fetchOnePage(firstHref, items).then(() => {
                console.log('Fetched ' + items.length + ' items');
                const uniqueItems = this.extractUniqueItems(items);
                const pullRequests : Array<Promise<any>> = uniqueItems.map(item => this.fetchPullRequest(item));
                const results : any = [];
                return this.fetchDataInSequenceToPreventGithubAbuse(pullRequests, results);
            }).then((items : Array<any>) => {
                const pullRequestsWithReviews : Array<Promise<any>> = items.map(item => this.addReviewsToPullRequests(item));
                const results : any = [];
                return this.fetchDataInSequenceToPreventGithubAbuse(pullRequestsWithReviews, results);
            }).then((items) => {
                this.cacheAdapter.writeCache(items);
                return Promise.resolve(items);
            });
        });
    }

    private fetchDataInSequenceToPreventGithubAbuse(tasks : Array<any>, results : Array<any>) : Promise<any> {
        return sequence(tasks, results);
    }

    private fetchPullRequest(pullRequest : any) : any {
        return () => {
            return this.fetchHrefFromGithub(pullRequest.url.replace('/issues/', '/pulls/'));
        };
    }

    private addReviewsToPullRequests(pullRequest : any) : any {
        return () => {
            return this.fetchHrefFromGithub(pullRequest.url + '/reviews?per_page=50')
                .then((reviews) => {
                    pullRequest.reviews = reviews;
                    return Promise.resolve(pullRequest);
                });
        };
    }

    private getNameFromRel(rel: string): string {
        return (rel.match(new RegExp("\"(.*?)\"")) || ['"_notFound"'])[0].slice(1, -1);
    }

    private getValueFromRel(rel: string): string {
        return (rel.match(new RegExp("<(.*?)>")) || [''])[0].slice(1, -1);
    }

    private fetchHrefFromGithub(href: string) : Promise<any> {
        console.log('Fetching URL: ' + href);
        return this.fetch(href, {
            headers: {
                'Authorization': this.generateAuthHeader(),
            },
        })
        .then((response: any) => response.json());
    }

    private fetchOnePage(href : string, data : any) : Promise<any> {
        console.log('Fetching URL: ' + href);
        return this.fetch(href, {
            headers: {
                'Authorization': this.generateAuthHeader(),
            },
        }).then((res: any) => {
            const rels : IGithubPaginationRels = this.getRelsFromResponse(res);
            return this.createResponse(rels, res);
        }).then((response: IResponseWrapper) => {
            data.push(...response.response.items);
            if (response.rels.next.length > 0) {
                return this.fetchOnePage(response.rels.next, data);
            } else {
                return Promise.resolve();
            }
        });
    }

    private generateAuthHeader() : string {
        return 'Basic ' + new Buffer(`${this.username}:${this.token}`).toString('base64');
    }

    private getRelsFromResponse(response : any) : IGithubPaginationRels {
        const paginationRels : IGithubPaginationRels = { next: '', first: '', last: '', prev: '' };
        const parsedRels = response.headers.get('Link').split(', ');
        parsedRels.forEach((rel : any) => {
            paginationRels[this.getNameFromRel(rel)] = this.getValueFromRel(rel);
        });

        return paginationRels;
    }

    private createResponse(rels: IGithubPaginationRels, response: any) : Promise<IResponseWrapper> {
        return response.json().then((res : any) => {
            const responseInstance : IResponseWrapper = { rels, response: res };
            return Promise.resolve(responseInstance);
        });
    }

    private extractUniqueItems(items : Array<any>) : Array<any> {
        const uniqueItems : any = {};
        items.forEach((item) => {
            uniqueItems[item.id] = item;
        });
        return Object.keys(uniqueItems).map((key) => uniqueItems[key]);
    }
}
