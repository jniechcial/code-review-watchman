const Redis = require('redis');
import * as ICacheAdapter from './cache-adapter';
import * as Errors from './errors';

export default class RedisCacheAdapter implements ICacheAdapter.ICacheAdapterInterface {
    private dataCache: any;
    private redisInstance: any;
    private cacheKey: string;

    constructor(cacheKey: string, redisModule: any = Redis) {
        this.dataCache = null;
        this.redisInstance = redisModule.createClient();
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
                    return reject(err);
                } else if (response) {
                    console.log('Reading from cache');
                    return resolve(JSON.parse(response));
                } else {
                    return reject(new Errors.CacheEmptyError());
                }
            });
        });
    }
}
