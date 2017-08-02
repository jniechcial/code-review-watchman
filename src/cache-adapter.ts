export interface ICacheAdapterInterface {
    writeCache(data: any): Promise<any>;
    readCache(): Promise<any>;
}
