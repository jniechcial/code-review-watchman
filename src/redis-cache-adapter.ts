const Redis = require('redis');
import * as ICacheAdapter from './cache-adapter';

export default class RedisCacheAdapter implements ICacheAdapter.ICacheAdapterInterface {
    private dataCache: any;
    private redisInstance: any;
    private cacheKey: string;

    constructor(cacheKey: string) {
        this.dataCache = null;
        this.redisInstance = Redis.createClient();
        this.cacheKey = cacheKey;
    }

    writeCache(data: any) {
        return new Promise((resolve, reject) => {
            this.redisInstance.set(this.cacheKey, JSON.stringify(data), function(err: any, response: any) {
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    readCache() {
        return new Promise((resolve, reject) => {
            this.redisInstance.get(this.cacheKey, function(err: any, response: any) {
                if (err) {
                    reject(err);
                } else if (response) {
                    console.log('Reading from cache');
                    resolve(JSON.parse(response));
                } else {
                    reject(new ICacheAdapter.CacheEmptyError());
                }
            });
        });
    }
}
