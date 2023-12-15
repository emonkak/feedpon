import * as CacheMap from 'feedpon-utils/CacheMap';
import type { Histories } from '../index';

const initialState: Histories = {
  recentlyReadStreams: CacheMap.empty<number>(100),
  version: 1,
};

export default initialState;
