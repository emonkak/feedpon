import { Credential, Event } from 'messaging/types';

export default function reduceCredential(credential: Credential, event: Event): Credential {
    switch (event.type) {
        case 'AUTHENTICATED':
            return {
                authorizedAt: event.authorizedAt,
                token: event.token,
                version: credential.version
            };

        default:
            return credential;
    }
}
