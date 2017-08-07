import PullRequest from './pull-request';
import User from './user';

const pullRequest1 = new PullRequest('1', 'testURL/1', [
    { user: { login: 'test1' }, state: 'CHANGES_REQUESTED' },
    { user: { login: 'test2' }, state: 'APPROVED' },
]);

const pullRequest2 = new PullRequest('2', 'testURL/1', [
    { user: { login: 'test2' }, state: 'CHANGES_REQUESTED' },
    { user: { login: 'test1' }, state: 'APPROVED' },
]);

const pullRequest3 = new PullRequest('3', 'testURL/1', [
    { user: { login: 'test2' }, state: 'CHANGES_REQUESTED' },
    { user: { login: 'test1' }, state: 'APPROVED' },
]);

describe('User', () => {
    it('creates user with no pull requests', async () => {
        const user = new User('test1');
        expect(user).toMatchSnapshot();
    });

    it('#getRejectsCount returns count of rejected reviews by user', async () => {
        const user = new User('test1');
        user.pullRequestsReviewed.push(pullRequest1);
        user.pullRequestsReviewed.push(pullRequest2);
        expect(user.getRejectsCount()).toEqual(1);
    });

    it('#getApprovesCount returns count of approved reviews by user', async () => {
        const user = new User('test1');
        user.pullRequestsReviewed.push(pullRequest1);
        user.pullRequestsReviewed.push(pullRequest2);
        user.pullRequestsReviewed.push(pullRequest3);
        expect(user.getApprovesCount()).toEqual(2);
    });

    it('#getPRRatio returns ratio of submitted PRs to reviewed PRs', async () => {
        const user = new User('test1');
        user.pullRequestsReviewed.push(pullRequest1);
        user.pullRequestsReviewed.push(pullRequest2);
        user.pullRequestsSubmitted.push(pullRequest3);
        expect(user.getPRRatio()).toEqual(2);
    });

    it('#getPRRatio works when there are no submitted PRs', async () => {
        const user = new User('test1');
        user.pullRequestsReviewed.push(pullRequest1);
        expect(user.getPRRatio()).toEqual(1);
    });
});
