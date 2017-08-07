const Redis = require('redis');
import { ICacheAdapterInterface } from './cache-adapter';
import { CacheEmptyError } from './errors';

export default class RedisCacheAdapter implements ICacheAdapterInterface {
    private dataCache: any;
    private redisInstance: any;
    private cacheKey: string;

    constructor(cacheKey: string, redisModule: any = Redis) {
        this.dataCache = null;
        this.redisInstance = redisModule.createClient();
        this.cacheKey = cacheKey;
    }

    async writeCache(data: any) : Promise<any> {
        return await new Promise((resolve, reject) => {
            this.redisInstance.set(this.cacheKey, JSON.stringify(data), function(err: any, response: any) {
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    async readCache() : Promise<any>{
        return await new Promise((resolve, reject) => {
            this.redisInstance.get(this.cacheKey, function(err: any, response: any) {
                if (err) {
                    return reject(err);
                } else if (response) {
                    console.log('Reading from cache');
                    return resolve(JSON.parse(response));
                } else {
                    return reject(new CacheEmptyError());
                }
            });
        });
    }
}
