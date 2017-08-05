import Review from './review';
import { IGithubDataReview } from '../github-data-interfaces/github-data';

export default class PullRequest {
    url: string;
    id: string;
    reviews: Array<Review>;

    constructor(id: string, url: string, reviews: Array<IGithubDataReview>) {
        this.id = id;
        this.url = url;
        this.reviews = reviews.map(_review => new Review(_review));
    }

    rejectedReviews() : Array<Review> {
        return this.reviews.filter(review => review.state === 'CHANGES_REQUESTED');
    }

    approvedReviews() : Array<Review> {
        return this.reviews.filter(review => review.state === 'APPROVED');
    }

    getReviewsByUsername(username : string) : Array<Review> {
        return this.reviews.filter(review => review.username === username);
    }
}
