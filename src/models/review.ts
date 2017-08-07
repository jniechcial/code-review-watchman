import { IGithubDataReview } from '../github-data-interfaces/github-data';

export default class PullRequestReview {
    username : string;
    state : string;

    constructor(data : IGithubDataReview) {
        this.username = data.user.login;
        this.state = data.state;
    }
}
