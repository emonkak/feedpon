import { Credential, Event } from 'messaging/types';

export default function reduceCredential(credential: Credential, event: Event): Credential {
    switch (event.type) {
        case 'TOKEN_RECEIVING':
            return {
                ...credential,
                isLoading: true
            };

        case 'TOKEN_RECEIVING_FAILED':
            return {
                ...credential,
                isLoading: false
            };

        case 'TOKEN_RECEIVED':
            return {
                ...credential,
                authorizedAt: event.authorizedAt,
                isLoading: false,
                token: event.token
            };

        case 'TOKEN_REVOKING':
            return {
                ...credential,
                isLoading: true
            };

        case 'TOKEN_REVOKED':
            return {
                ...credential,
                authorizedAt: 0,
                isLoading: false,
                token: null,
                user: null
            };

        default:
            return credential;
    }
}
