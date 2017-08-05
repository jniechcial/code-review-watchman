const moment = require('moment');

import fetch from 'node-fetch';
import { IDataAdapterInterface } from './data-adapter';
import { ICacheAdapterInterface } from './cache-adapter';
import { IGithubDataIssue, IGithubDataPullRequest, IGithubDataReview } from './github-data-interfaces/github-data';
import { CacheEmptyError } from './errors';
import sequence from './utils/promise-sequence';

interface IGithubPaginationRels {
    [key: string]: string;
}

interface IResponseWrapper {
    rels: IGithubPaginationRels;
    response: any;
}

export default class GithubAdapter implements IDataAdapterInterface {
    private token: string;
    private username: string;
    private organizationName: string;
    private cacheAdapter: ICacheAdapterInterface;
    private fetch: any;

    constructor(token: string, username: string, organizationName: string, cacheAdapter: ICacheAdapterInterface, _fetch: any = fetch) {
        this.token = token;
        this.username = username;
        this.organizationName = organizationName;
        this.cacheAdapter = cacheAdapter;
        this.fetch = _fetch;
    }

    async fetchData(fromDate: Date, endDate: Date): Promise<any> {
        try {
            return await this.cacheAdapter.readCache();
        } catch(err) {
            if (!(err instanceof CacheEmptyError)) throw err;

            const githubIssues : Array<IGithubDataIssue> = [];

            const parsedFromDate : string = moment(fromDate).format('YYYY-MM-DD');
            const parsedEndDate : string = moment(endDate).format('YYYY-MM-DD');

            const firstHref = `https://api.github.com/search/issues?per_page=50&q=type:pr org:${this.organizationName} merged:${parsedFromDate}..${parsedEndDate}`;

            await this.fetchAllNextPages(firstHref, githubIssues)

            console.log('Fetched ' + githubIssues.length + ' items');

            const uniqueItems = this.extractUniqueItems(githubIssues);
            const pullRequests : Array<() => Promise<IGithubDataPullRequest>> = uniqueItems.map(item => this.fetchPullRequest(item));

            const githubPullRequests : Array<IGithubDataPullRequest> = await this.fetchDataInSequenceToPreventGithubAbuse(pullRequests, []);

            const pullRequestsWithReviews : Array<() => Promise<IGithubDataPullRequest>> = githubPullRequests.map(item => this.addReviewsToPullRequests(item));
            const githubPullRequestsWithReviews = await this.fetchDataInSequenceToPreventGithubAbuse(pullRequestsWithReviews, []);

            this.cacheAdapter.writeCache(githubPullRequestsWithReviews);

            return Promise.resolve(githubPullRequestsWithReviews);
        }
    }

    private fetchDataInSequenceToPreventGithubAbuse(tasks : Array<any>, results : Array<any>) : Promise<any> {
        return sequence(tasks, results);
    }

    private fetchPullRequest(pullRequest : IGithubDataIssue) : () => Promise<IGithubDataPullRequest> {
        return () => {
            return this.fetchHrefFromGithub(pullRequest.url.replace('/issues/', '/pulls/'));
        };
    }

    private addReviewsToPullRequests(pullRequest : IGithubDataPullRequest) : () => Promise<IGithubDataPullRequest> {
        return async () => {
            const reviews = await this.fetchHrefFromGithub(pullRequest.url + '/reviews?per_page=50')
            pullRequest.reviews = reviews;
            return pullRequest;
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

    private async fetchAllNextPages(href : string, data : any) : Promise<any> {
        console.log('Fetching URL: ' + href);
        const res : any = await this.fetch(href, {
            headers: {
                'Authorization': this.generateAuthHeader(),
            },
        });

        const rels : IGithubPaginationRels = this.getRelsFromResponse(res);
        const response : IResponseWrapper = await this.createResponse(rels, res);

        data.push(...response.response.items);

        if (response.rels.next.length > 0) {
            return this.fetchAllNextPages(response.rels.next, data);
        }
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

    private async createResponse(rels: IGithubPaginationRels, response: any) : Promise<IResponseWrapper> {
        const res : any = await response.json();
        const responseInstance : IResponseWrapper = { rels, response: res };
        return Promise.resolve(responseInstance);
    }

    private extractUniqueItems(items : Array<any>) : Array<any> {
        const uniqueItems : any = {};
        items.forEach((item) => {
            uniqueItems[item.id] = item;
        });
        return Object.keys(uniqueItems).map((key) => uniqueItems[key]);
    }
}
