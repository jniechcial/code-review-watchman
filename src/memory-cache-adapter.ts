import { ICacheAdapterInterface } from './cache-adapter';
import { CacheEmptyError } from './errors';

export default class MemoryCacheAdapter implements ICacheAdapterInterface {
    private dataCache: any;

    constructor() {
        this.dataCache = null;
    }

    async writeCache(data: any) : Promise<void> {
        console.log('Writing to cache');
        this.dataCache = data;
    }

    async readCache() : Promise<void> {
        if (!this.dataCache) {
            console.log('Throwing error');
            throw new CacheEmptyError();
        }
        console.log('Reading from cache');
        return this.dataCache;
    }
}
