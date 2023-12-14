import type { User } from '../index';

const user: User = {
    isLoaded: false,
    isLoading: false,
    profile: {
        userName: '<unknown>',
        source: '<unknown>',
        picture: ''
    },
    version: 1
};

export default user;
