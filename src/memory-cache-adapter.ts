import * as ICacheAdapter from './cache-adapter';
import * as Errors from './errors';

export default class MemoryCacheAdapter implements ICacheAdapter.ICacheAdapterInterface {
    private dataCache: any;

    constructor() {
        this.dataCache = null;
    }

    writeCache(data: any) {
        console.log('Writing to cache');
        this.dataCache = data;
        return Promise.resolve();
    }

    readCache() {
        if (this.dataCache === null) {
            console.log('Throwing error');
            return Promise.reject(new Errors.CacheEmptyError());
        }
        console.log('Reading from cache');
        return Promise.resolve(this.dataCache);
    }
}
