import { Datastore } from '@google-cloud/datastore';

export class DatastoreClient {
  private datastore: Datastore;

  constructor() {
    this.datastore = new Datastore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async listKinds(): Promise<string[]> {
    try {
      const query = this.datastore.createQuery('__kind__').select('__key__');
      const [entities] = await this.datastore.runQuery(query);
      
      return entities.map(entity => entity[this.datastore.KEY].name).filter(Boolean);
    } catch (error) {
      throw new Error(`Failed to list kinds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEntity(kind: string, key: string, parent?: string): Promise<any> {
    try {
      let entityKey;
      
      const keyValue = isNaN(Number(key)) ? key : parseInt(key);
      if (parent) {
        const parentKeyValue = isNaN(Number(parent)) ? parent : parseInt(parent);
        entityKey = this.datastore.key([kind, parentKeyValue, kind, keyValue]);
      } else {
        entityKey = this.datastore.key([kind, keyValue]);
      }

      const [entity] = await this.datastore.get(entityKey);
      
      if (!entity) {
        return null;
      }

      return {
        key: entity[this.datastore.KEY],
        ...entity,
      };
    } catch (error) {
      throw new Error(`Failed to get entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async queryEntities(kind: string, limit = 100, offset = 0): Promise<any[]> {
    try {
      const query = this.datastore.createQuery(kind)
        .limit(limit)
        .offset(offset);

      const [entities] = await this.datastore.runQuery(query);
      
      return entities.map(entity => ({
        key: entity[this.datastore.KEY],
        ...entity,
      }));
    } catch (error) {
      throw new Error(`Failed to query entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async filterEntities(kind: string, field: string, value: string, limit = 100): Promise<any[]> {
    try {
      let query = this.datastore.createQuery(kind);

      if (field === '__key__' || field === 'key') {
        const keyValue = isNaN(Number(value)) ? value : parseInt(value);
        const entityKey = this.datastore.key([kind, keyValue]);
        query = query.filter('__key__', '=', entityKey);
      } else {
        const convertedValue = this.convertValue(value);
        query = query.filter(field, '=', convertedValue);
      }

      query = query.limit(limit);

      const [entities] = await this.datastore.runQuery(query);
      
      return entities.map(entity => ({
        key: entity[this.datastore.KEY],
        ...entity,
      }));
    } catch (error) {
      throw new Error(`Failed to filter entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async countEntities(kind: string, field?: string, value?: string): Promise<number> {
    try {
      let query = this.datastore.createQuery(kind).select('__key__');

      if (field && value !== undefined) {
        if (field === '__key__' || field === 'key') {
          const keyValue = isNaN(Number(value)) ? value : parseInt(value);
          const entityKey = this.datastore.key([kind, keyValue]);
          query = query.filter('__key__', '=', entityKey);
        } else {
          const convertedValue = this.convertValue(value);
          query = query.filter(field, '=', convertedValue);
        }
      }

      const [entities] = await this.datastore.runQuery(query);
      return entities.length;
    } catch (error) {
      throw new Error(`Failed to count entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertValue(value: string): any {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    if (value.toLowerCase() === 'null') return null;
    
    const numValue = Number(value);
    if (!isNaN(numValue)) return numValue;
    
    return value;
  }
}