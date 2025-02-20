import type { User } from '../types.ts';

const user: User = {
  isLoaded: false,
  isLoading: false,
  profile: {
    userName: '<unknown>',
    source: '<unknown>',
    picture: '',
  },
  version: 1,
};

export default user;
