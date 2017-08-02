import Review from './review';

const stubbedData = {
    user: { login: 'test1' },
    state: 'CHANGES_REQUESTED',
};

describe('Review', () => {
    it('creates review properly', async () => {
        const pullRequest = new Review(stubbedData);
        expect(pullRequest.username).toEqual('test1');
    });
});
