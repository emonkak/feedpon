import { createContext } from 'react';

import { Store } from '../index';

export default createContext<Store<unknown, unknown> | null>(null);
