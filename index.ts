require('dotenv').config();

import Watchman from './src/watchman';
import GithubAdapter from './src/github-adapter';
import MemoryCacheAdapter from './src/memory-cache-adapter';
import RedisCacheAdapter from './src/redis-cache-adapter';

const token : string = process.env.GITHUB_TOKEN || '';
const username : string = process.env.GITHUB_USERNAME || '';

const REDIS_DEFAULT_CACHE_KEY = '_watchman';

const memoryCacheAdapter = new MemoryCacheAdapter();
// const redisCacheAdapter = new RedisCacheAdapter(process.env.REDIS_CACHE_KEY || REDIS_DEFAULT_CACHE_KEY);
const githubAdapter = new GithubAdapter(token, username, process.env.GITHUB_ORGANIZATION || 'netguru', memoryCacheAdapter);

const watchman = new Watchman(new Date(2017, 6, 15), new Date(2017, 6, 17), githubAdapter);

watchman.getUsers().then((usersRepository) => {
    const users = usersRepository.getUsers();
    console.log('\t\t\t Submitted \t Reviewed \t Ratio \t\t Approved \t Rejected \t');
    users.forEach((user) => {
        console.log(user.username);
        console.log(`\t\t\t ${user.pullRequestsSubmitted.length} \t\t ${user.pullRequestsReviewed.length} \t\t ${user.getPRRatio().toPrecision(2)} \t\t ${user.getApprovesCount()} \t\t ${user.getRejectsCount()}`);
    })
    return null;
});
