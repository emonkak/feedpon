import { User, Event } from 'messaging/types';

export default function reduceUser(user: User, event: Event): User {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...user,
                isLoading: false
            };

        case 'USER_FETCHING':
            return {
                ...user,
                isLoading: true
            };

        case 'USER_FETCHING_FAILED':
            return {
                ...user,
                isLoading: false
            };

        case 'USER_FETCHED':
            return {
                ...user,
                profile: event.profile,
                isLoading: false,
                isLoaded: true
            };

        case 'TOKEN_REVOKED':
            return {
                ...user,
                isLoading: false,
                isLoaded: false
            };

        default:
            return user;
    }
}
