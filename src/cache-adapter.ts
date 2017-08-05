export interface ICacheAdapterInterface {
    writeCache(data: any): Promise<void>;
    readCache(): Promise<void>;
}
