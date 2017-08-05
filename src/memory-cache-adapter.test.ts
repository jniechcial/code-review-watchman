import { CacheEmptyError } from './errors';
import MemoryCacheAdapter from './memory-cache-adapter';

describe('MemoryCacheAdapter', () => {
  it('raises exception when read empty cache', async () => {
    const memoryCacheAdapter = new MemoryCacheAdapter();

    try {
        await memoryCacheAdapter.readCache();
    } catch(error) {
        expect(error).toBeInstanceOf(CacheEmptyError);
    }
  });

  it('returns cached data when read cache and present', async () => {
    const memoryCacheAdapter = new MemoryCacheAdapter();
    const testData = 'Test data';

    await memoryCacheAdapter.writeCache(testData)
    const data = await memoryCacheAdapter.readCache();
    expect(data).toEqual(testData);
  });
});
