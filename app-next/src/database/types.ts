export type StoreMap = Record<string, { new (...args: any[]): any }>;

export type UseStoreMap<
  TStoreMap extends StoreMap,
  TStoreNames extends (keyof TStoreMap)[],
> = {
  [StoreName in UnionTuple<TStoreNames>]: InstanceType<TStoreMap[StoreName]>;
};

type UnionTuple<T> = T extends [infer Head, ...infer Tail]
  ? Head | UnionTuple<Tail>
  : never;

export interface ObjectStoreManager<TStoreMap extends StoreMap> {
  runTransaction<const TStoreNames extends (keyof TStoreMap)[], TReturn>(
    storeNames: TStoreNames,
    callback: (stores: UseStoreMap<TStoreMap, TStoreNames>) => Promise<TReturn>,
    options?: IDBTransactionOptions & { mode?: IDBTransactionMode },
  ): Promise<TReturn>;
}
