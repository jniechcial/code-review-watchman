import * as ICacheAdapter from './cache-adapter';
import MemoryCacheAdapter from './memory-cache-adapter';


describe('MemoryCacheAdapter', () => {
  it('raises exception when read empty cache', async () => {
    const memoryCacheAdapter = new MemoryCacheAdapter();

    memoryCacheAdapter.readCache().catch((error) => {
        expect(error).toBeInstanceOf(ICacheAdapter.CacheEmptyError);
    });
  });

  it('returns cached data when read cache and present', async () => {
    const memoryCacheAdapter = new MemoryCacheAdapter();
    const testData = 'Test data';

    memoryCacheAdapter.writeCache(testData).then(() => {
        return memoryCacheAdapter.readCache();
    }).then((data) => {
        expect(data).toEqual(testData);
    });
  });
});
