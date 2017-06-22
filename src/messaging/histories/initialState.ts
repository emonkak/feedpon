import * as CacheMap from 'utils/containers/CacheMap';
import { Histories } from 'messaging/types';

const initialState: Histories = {
    recentlyReadStreams: CacheMap.empty<number>(20),
    version: 1
};

export default initialState;
