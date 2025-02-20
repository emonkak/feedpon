import * as CacheMap from 'feedpon-utils/CacheMap.ts';
import type { Histories } from '../types.ts';

const initialState: Histories = {
  recentlyReadStreams: CacheMap.empty<number>(100),
  version: 1,
};

export default initialState;
