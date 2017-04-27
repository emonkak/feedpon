import { Credential, SyncEvent } from 'messaging/types';

export default function reduceCredential(credential: Credential | null, event: SyncEvent): Credential | null {
    switch (event.type) {
        case 'AUTHENTICATED':
            return event.credential;

        default:
            return credential;
    }
}
