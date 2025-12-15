/**
 * IndexedDB mock for testing
 */

class IDBRequest {
  result: any = null;
  error: any = null;
  onsuccess: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null = null;

  constructor(public source: any, public transaction: IDBTransaction | null) {}

  dispatchEvent(event: Event): boolean {
    if (event.type === 'success' && this.onsuccess) {
      this.onsuccess(event);
    } else if (event.type === 'error' && this.onerror) {
      this.onerror(event);
    }
    return true;
  }
}

class IDBOpenDBRequest extends IDBRequest {
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null = null;

  dispatchUpgradeNeeded(event: IDBVersionChangeEvent): void {
    if (this.onupgradeneeded) {
      this.onupgradeneeded(event);
    }
  }
}

class IDBTransaction {
  objectStoreNames: DOMStringList;
  mode: IDBTransactionMode = 'readonly';
  oncomplete: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  stores?: Map<string, IDBObjectStore>;

  constructor(public storeNames: string[], mode: IDBTransactionMode) {
    this.mode = mode;
    this.objectStoreNames = {
      contains: (name: string) => this.storeNames.includes(name),
      length: this.storeNames.length,
      item: (index: number) => this.storeNames[index] || null,
    } as DOMStringList;
  }

  objectStore(name: string): IDBObjectStore {
    if (this.stores && this.stores.has(name)) {
      const store = this.stores.get(name)!;
      (store as any).transaction = this;
      return store;
    }
    return new IDBObjectStore(name, this);
  }

  abort(): void {}
}

class IDBObjectStore {
  keyPath: string | string[] = 'guid';
  indexNames: DOMStringList;
  private data = new Map<string, any>();
  private indexes = new Map<string, Map<any, Set<string>>>();

  constructor(public name: string, public transaction: IDBTransaction) {
    this.indexNames = {
      contains: (name: string) => this.indexes.has(name),
      length: this.indexes.size,
      item: (index: number) => Array.from(this.indexes.keys())[index] || null,
    } as DOMStringList;
  }

  createIndex(name: string, keyPath: string, options?: IDBIndexParameters): IDBIndex {
    if (!this.indexes.has(name)) {
      this.indexes.set(name, new Map());
    }
    return {
      name,
      keyPath,
      unique: options?.unique || false,
      multiEntry: false,
      objectStore: this as any,
    } as IDBIndex;
  }

  index(name: string): IDBIndex {
    const indexMap = this.indexes.get(name);
    if (!indexMap) {
      throw new Error(`Index ${name} not found`);
    }
    return {
      name,
      keyPath: '',
      unique: false,
      multiEntry: false,
      objectStore: this as any,
      getAll: (query?: IDBValidKey) => {
        const request = new IDBRequest(this, this.transaction);
        if (query === undefined) {
          request.result = Array.from(this.data.values());
        } else {
          request.result = Array.from(this.data.values()).filter((item: any) => {
            return item[name] === query;
          });
        }
        setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
        return request as any;
      },
    } as IDBIndex;
  }

  put(value: any): IDBRequest {
    const request = new IDBRequest(this, this.transaction);
    const key = value[this.keyPath as string];
    this.data.set(key, value);
    
    // Update indexes
    for (const [indexName, indexMap] of this.indexes.entries()) {
      const indexValue = value[indexName];
      if (!indexMap.has(indexValue)) {
        indexMap.set(indexValue, new Set());
      }
      indexMap.get(indexValue)!.add(key);
    }

    request.result = value;
    setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
    return request;
  }

  get(key: IDBValidKey): IDBRequest {
    const request = new IDBRequest(this, this.transaction);
    const value = this.data.get(key);
    request.result = value !== undefined ? value : null;
    setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
    return request;
  }

  delete(key: IDBValidKey): IDBRequest {
    const request = new IDBRequest(this, this.transaction);
    const value = this.data.get(key);
    if (value) {
      this.data.delete(key);
      
      // Update indexes
      for (const [indexName, indexMap] of this.indexes.entries()) {
        const indexValue = value[indexName];
        const keySet = indexMap.get(indexValue);
        if (keySet) {
          keySet.delete(key as string);
          if (keySet.size === 0) {
            indexMap.delete(indexValue);
          }
        }
      }
    }
    setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
    return request;
  }

  clear(): IDBRequest {
    const request = new IDBRequest(this, this.transaction);
    this.data.clear();
    for (const indexMap of this.indexes.values()) {
      indexMap.clear();
    }
    setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
    return request;
  }

  getAll(query?: IDBValidKey): IDBRequest {
    const request = new IDBRequest(this, this.transaction);
    if (query === undefined) {
      request.result = Array.from(this.data.values());
    } else {
      request.result = Array.from(this.data.values());
    }
    setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
    return request;
  }
}

class IDBDatabase {
  name: string;
  version: number;
  objectStoreNames: DOMStringList;
  private stores = new Map<string, IDBObjectStore>();

  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;
    this.objectStoreNames = {
      contains: (name: string) => this.stores.has(name),
      length: this.stores.size,
      item: (index: number) => Array.from(this.stores.keys())[index] || null,
    } as DOMStringList;
  }

  createObjectStore(name: string, options?: IDBObjectStoreParameters): IDBObjectStore {
    const store = new IDBObjectStore(name, null as any);
    if (options?.keyPath) {
      store.keyPath = options.keyPath;
    }
    this.stores.set(name, store);
    return store;
  }

  transaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    const transaction = new IDBTransaction(names, mode || 'readonly');
    
    // Attach stores to transaction
    (transaction as any).stores = new Map();
    for (const name of names) {
      if (this.stores.has(name)) {
        (transaction as any).stores.set(name, this.stores.get(name));
      }
    }
    
    // Override objectStore to return the actual store
    const originalObjectStore = transaction.objectStore.bind(transaction);
    transaction.objectStore = (name: string) => {
      if (this.stores.has(name)) {
        const store = this.stores.get(name)!;
        (store as any).transaction = transaction;
        return store;
      }
      return originalObjectStore(name);
    };
    
    return transaction;
  }

  close(): void {}
}

const databases = new Map<string, IDBDatabase>();

export function setupIndexedDBMock(): void {
  (global as any).indexedDB = {
    open: (name: string, version?: number): IDBOpenDBRequest => {
      const request = new IDBOpenDBRequest(null, null);
      const dbVersion = version || 1;
      
      setTimeout(() => {
        const existingDb = databases.get(name);
        const needsUpgrade = !existingDb || existingDb.version < dbVersion;
        
        if (needsUpgrade) {
          const db = new IDBDatabase(name, dbVersion);
          databases.set(name, db);
          
          // Set result before upgrade event
          (request as any).result = db;
          
          // Trigger upgrade needed
          const event = {
            target: request,
            oldVersion: existingDb?.version || 0,
            newVersion: dbVersion,
            type: 'upgradeneeded',
          } as IDBVersionChangeEvent;
          request.dispatchUpgradeNeeded(event);
        }
        
        const db = databases.get(name)!;
        (request as any).result = db;
        request.dispatchEvent({ type: 'success' } as Event);
      }, 0);
      
      return request as any;
    },
    deleteDatabase: (name: string): IDBRequest => {
      const request = new IDBRequest(null, null);
      databases.delete(name);
      setTimeout(() => request.dispatchEvent({ type: 'success' } as Event), 0);
      return request as any;
    },
  };
}
