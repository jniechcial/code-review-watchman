import PullRequest from './pull-request';

export default class User {
    pullRequestsReviewed: { [id: string] : PullRequest } = {};
    pullRequestsSubmitted: { [id: string] : PullRequest } = {};
    username : string;

    constructor(username: string) {
        this.username = username;
    }
}
