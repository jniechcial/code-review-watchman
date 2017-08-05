export interface IGithubDataIssue {
    url: string;
}

export interface IGithubDataPullRequest {
    id: string;
    url: string;
    reviews: Array<IGithubDataReview>;
    user: {
        login: string;
    }
}

export interface IGithubDataReview {
    user: {
        login: string;
    }
    state: string;
}
