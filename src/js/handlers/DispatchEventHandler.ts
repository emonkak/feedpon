import Inject from '../shared/di/annotation/Inject';
import { DispatchEvent } from '../constants/actionTypes';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';

@Inject
export default class DispatchEventHandler implements IActionHandler<DispatchEvent> {
    handle(action: DispatchEvent, dispatch: EventDispatcher): Promise<void> {
        dispatch(action.event);
        return Promise.resolve();
    }
}
