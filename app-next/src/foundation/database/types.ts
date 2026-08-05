export type StoreMap = Record<string, { new (...args: any[]): any }>;

export type UseStoreMap<
  TStoreMap extends StoreMap,
  TStoreNames extends (keyof TStoreMap)[],
> = {
  [StoreName in Union<TStoreNames>]: InstanceType<TStoreMap[StoreName]>;
};

export interface ObjectStoreManager<TStoreMap extends StoreMap> {
  runTransaction<const TStoreNames extends (keyof TStoreMap)[], TReturn>(
    storeNames: TStoreNames,
    callback: (stores: UseStoreMap<TStoreMap, TStoreNames>) => Promise<TReturn>,
    options?: IDBTransactionOptions & { mode?: IDBTransactionMode },
  ): Promise<TReturn>;
}

type Union<T> = T extends [infer Head, ...infer Tail]
  ? Head | Union<Tail>
  : never;
