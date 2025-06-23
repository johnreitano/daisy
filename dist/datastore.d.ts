export declare class DatastoreClient {
    private datastore;
    constructor();
    listKinds(): Promise<string[]>;
    getEntity(kind: string, key: string, parent?: string): Promise<any>;
    queryEntities(kind: string, limit?: number, offset?: number): Promise<any[]>;
    filterEntities(kind: string, field: string, value: string, limit?: number): Promise<any[]>;
    countEntities(kind: string, field?: string, value?: string): Promise<number>;
    private convertValue;
}
