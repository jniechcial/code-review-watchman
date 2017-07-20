export interface IDataAdapterInterface {
    fetchData(fromDate: Date, endDate: Date): Promise<any>;
}
