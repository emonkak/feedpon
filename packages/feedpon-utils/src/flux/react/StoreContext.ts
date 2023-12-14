import { createContext } from 'react';

import { Dispatcher } from '../types';

export interface StoreContext {
  storeState: any;
  dispatch: Dispatcher<any>;
}

export const StoreContext = createContext<StoreContext>(null as any);
