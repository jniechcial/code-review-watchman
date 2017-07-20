import RedisCacheAdapter from './redis-cache-adapter';
import * as ICacheAdapter from './cache-adapter';

const MockedRedis = {
    createClient() {
        let _data : any = undefined;

        return {
            set(data : any) {
                _data = data;
                return Promise.resolve();
            },
            get() {
                if (_data) {
                    return Promise.reject(new ICacheAdapter.CacheEmptyError())
                } else {
                    return Promise.resolve(_data);
                }
            }
        };
    }
};

const CACHE_KEY = 'cache_key';

describe('RedisCacheAdapter', () => {
  it('raises exception when read empty cache', async () => {
    const redisCacheAdapter = new RedisCacheAdapter(CACHE_KEY, MockedRedis);

    redisCacheAdapter.readCache().catch((error) => {
        expect(error).toBeInstanceOf(ICacheAdapter.CacheEmptyError);
    });
  });

  it('returns cached data when read cache and present', async () => {
    const memoryCacheAdapter = new RedisCacheAdapter(CACHE_KEY, MockedRedis);
    const testData = 'Test data';

    memoryCacheAdapter.writeCache(testData).then(() => {
        return memoryCacheAdapter.readCache();
    }).then((data) => {
        expect(data).toEqual(testData);
    });
  });
});
