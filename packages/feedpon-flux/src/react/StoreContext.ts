import { createContext } from 'react';

import { Dispatcher } from '../index';

export interface StoreContext {
  storeState: any;
  dispatch: Dispatcher<any>;
}

export const StoreContext = createContext<StoreContext>(null as any);
