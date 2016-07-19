import { AnyAction, AnyEvent, IActionDispatcher } from '../interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export default class WorkerActionDispatcher implements IActionDispatcher {
    constructor(private worker: Worker) {
    }

    dispatch(action: AnyAction): Observable<AnyEvent> {
        return new Observable((observer: Subscriber<AnyEvent>) => {
            const chan = new MessageChannel();

            chan.port2.onmessage = ({ data }) => {
                if (data && data.hasOwnProperty('error' )) {
                    observer.error(data.error);
                } else {
                    observer.complete();
                }
            };

            this.worker.postMessage(action, [chan.port1]);
        });
    }
}
