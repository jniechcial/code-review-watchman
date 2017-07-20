export class CacheEmptyError extends Error {};

export interface ICacheAdapterInterface {
    writeCache(data: any): Promise<any>;
    readCache(): Promise<any>;
}
