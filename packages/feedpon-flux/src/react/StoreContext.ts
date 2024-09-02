import { createContext } from 'react';

import type { Store } from '../index';

export default createContext<Store<unknown, unknown> | null>(null);
