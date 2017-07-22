import Review from './review';

export default class PullRequest {
    url: string;
    id: string;
    reviews: Review;

    constructor(id: string, url: string) {
        this.id = id;
        this.url = url;
    }
}
