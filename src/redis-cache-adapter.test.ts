import RedisCacheAdapter from './redis-cache-adapter';
import { CacheEmptyError } from './errors';

const MockedRedis = {
    createClient() {
        let _data : any = undefined;

        return {
            set(cacheKey : string, data : any, callback : () => any) {
                _data = data;
                callback();
            },
            get(cacheKey : string, callback : (err : any, response : any) => any) {
                callback(null, _data);
            }
        };
    }
};

const CACHE_KEY = 'cache_key';

describe('RedisCacheAdapter', () => {
  it('raises exception when read empty cache', async () => {
    const redisCacheAdapter = new RedisCacheAdapter(CACHE_KEY, MockedRedis);

    try {
        await redisCacheAdapter.readCache();
    } catch(error) {
        expect(error).toBeInstanceOf(CacheEmptyError);
    }
  });

  it('returns cached data when read cache and present', async () => {
    const redisCacheAdapter = new RedisCacheAdapter(CACHE_KEY, MockedRedis);
    const testData = 'Test data';

    await redisCacheAdapter.writeCache(testData)
    const data = await redisCacheAdapter.readCache();
    expect(data).toEqual(testData);
  });
});
