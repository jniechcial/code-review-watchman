import PullRequest from './pull-request';
import Review from './review';

const stubbedData = {
    id: '123',
    url: 'testURL',
    reviews: [
        { user: { login: 'test1' }, state: 'CHANGES_REQUESTED' },
        { user: { login: 'test1' }, state: 'APPROVED' },
        { user: { login: 'test2' }, state: 'CHANGES_REQUESTED' },
        { user: { login: 'test2' }, state: 'SOME_OTHER_STATE' },
    ],
};

describe('PullRequest', () => {
    it('creates pull request instance with reviews', async () => {
        const pullRequest = new PullRequest(stubbedData.id, stubbedData.url, stubbedData.reviews);
        expect(pullRequest.reviews.length).toEqual(stubbedData.reviews.length);
        expect(pullRequest.reviews[0]).toBeInstanceOf(Review);
    });

    it('#rejectedReviews returns all rejected reviews', async () => {
        const pullRequest = new PullRequest(stubbedData.id, stubbedData.url, stubbedData.reviews);
        expect(pullRequest.rejectedReviews().length).toEqual(2);
    });

    it('#approvedReviews returns all approved reviews', async () => {
        const pullRequest = new PullRequest(stubbedData.id, stubbedData.url, stubbedData.reviews);
        expect(pullRequest.approvedReviews().length).toEqual(1);
    });

    it('#getReviewsByUsername returns all reviews of particular user', async () => {
        const pullRequest = new PullRequest(stubbedData.id, stubbedData.url, stubbedData.reviews);
        expect(pullRequest.getReviewsByUsername('test1').length).toEqual(2);
    });
});
