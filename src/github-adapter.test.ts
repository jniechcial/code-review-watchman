import GithubAdapter from './github-adapter';
import MemoryCacheAdapter from './memory-cache-adapter';

const fetchMock = require('fetch-mock');

const cacheAdapter = new MemoryCacheAdapter();

const pullRequestOne = { id: 1, url: 'https://api.github.com/netguru/test/issues/1' };
const pullRequestTwo = { id: 2, url: 'https://api.github.com/netguru/test/issues/2' };

const testData = [pullRequestOne, pullRequestTwo];

const githubSearch = fetchMock.sandbox().mock('https://api.github.com/search/issues?per_page=50&q=type:pr org:organization merged:2017-07-21..2017-07-21', {
    body: { items: testData },
    status: 200,
    headers: { 'Link': '' },
}).mock('https://api.github.com/netguru/test/pulls/1', {
    body: pullRequestOne,
    status: 200,
    headers: { 'Link': '' },
}).mock('https://api.github.com/netguru/test/pulls/2', {
    body: pullRequestTwo,
    status: 200,
    headers: { 'Link': '' },
}).mock('https://api.github.com/netguru/test/issues/1/reviews?per_page=50', {
    body: [],
    status: 200,
    headers: { 'Link': '' },
}).mock('https://api.github.com/netguru/test/issues/2/reviews?per_page=50', {
    body: [],
    status: 200,
    headers: { 'Link': '' },
});

describe('GithubAdapter', () => {
    it('fetches data from cache adapter if it\'s present', async () => {
        const cachedData = ['item1', 'item2'];
        const memoryCacheAdapter = new MemoryCacheAdapter();
        memoryCacheAdapter.writeCache(cachedData);

        const githubAdapter = new GithubAdapter('token', 'username', 'organization', memoryCacheAdapter);
        const data = await githubAdapter.fetchData(new Date(2017, 6, 21), new Date(2017, 6, 21));
        expect(data).toEqual(cachedData);
    });

    it('fetches data from Github if cache is empty including pagination and reviews', async () => {
        const memoryCacheAdapter = new MemoryCacheAdapter();

        const githubAdapter = new GithubAdapter('token', 'username', 'organization', memoryCacheAdapter, githubSearch);
        const data = await githubAdapter.fetchData(new Date(2017, 6, 21), new Date(2017, 6, 21));
        expect(data).toEqual([Object.assign({ reviews: [] }, pullRequestOne), Object.assign({ reviews: [] }, pullRequestTwo)]);
    });

    it('writes fetched data to cache', async () => {
        const memoryCacheAdapter = new MemoryCacheAdapter();

        const githubAdapter = new GithubAdapter('token', 'username', 'organization', memoryCacheAdapter, githubSearch);
        await githubAdapter.fetchData(new Date(2017, 6, 21), new Date(2017, 6, 21));
        const data = await memoryCacheAdapter.readCache();
        expect(data).toEqual([Object.assign({ reviews: [] }, pullRequestOne), Object.assign({ reviews: [] }, pullRequestTwo)]);
    });
});
