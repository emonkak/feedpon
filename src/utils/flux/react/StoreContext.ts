import { createContext } from 'react';

import { Dispatcher } from '../types';

export interface StoreContextValue {
    storeState: any;
    dispatch: Dispatcher<any>;
}

export const StoreContext = createContext<StoreContextValue>(null as any);
