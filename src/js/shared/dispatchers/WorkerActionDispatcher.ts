import { AnyAction, AnyEvent, IActionDispatcher, Event } from '../interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export default class WorkerActionDispatcher implements IActionDispatcher {
    constructor(private worker: Worker) {
    }

    dispatch<T extends AnyAction>(action: T): Observable<AnyEvent> {
        return Observable.create((observer: Subscriber<AnyEvent>) => {
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
