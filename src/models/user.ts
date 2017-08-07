import PullRequest from './pull-request';

export default class User {
    pullRequestsReviewed: Array<PullRequest>;
    pullRequestsSubmitted: Array<PullRequest>;
    username : string;

    constructor(username: string) {
        this.username = username;
        this.pullRequestsReviewed = [];
        this.pullRequestsSubmitted = [];
    }

    getPRRatio() : number {
        return this.pullRequestsReviewed.length / (this.pullRequestsSubmitted.length || 1);
    }

    getRejectsCount() : number {
        return this.pullRequestsReviewed.reduce((count : number, pullRequest : PullRequest) : number => {
            const reviews = pullRequest.getReviewsByUsername(this.username);

            return count + reviews.filter(review => review.state === 'CHANGES_REQUESTED').length;
        }, 0);
    }

    getApprovesCount() : number {
        return this.pullRequestsReviewed.reduce((count : number, pullRequest : PullRequest) : number => {
            const reviews = pullRequest.getReviewsByUsername(this.username);

            return count + reviews.filter(review => review.state === 'APPROVED').length;
        }, 0);
    }
}
