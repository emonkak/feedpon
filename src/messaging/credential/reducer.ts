import { Credential, Event } from 'messaging/types';

export default function reduceCredential(credential: Credential | null, event: Event): Credential | null {
    switch (event.type) {
        case 'AUTHENTICATED':
            return event.credential;

        default:
            return credential;
    }
}
