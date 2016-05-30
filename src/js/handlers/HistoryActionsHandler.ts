import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { History } from '../constants/actionTypes';
import { Inject, Named } from '../shared/di/annotations';

type HistoryActions = History.Push | History.Replace | History.Go | History.GoBack | History.GoForward;

@Inject
export default class HistoryActionsHandler implements IActionHandler<HistoryActions> {
    constructor(@Named('history') private _history: HistoryModule.History) {
    }

    handle(action: HistoryActions, dispatch: EventDispatcher): Promise<void> {
        switch (action.actionType) {
        case History.Push:
            this._history.push((action as History.Push).path);
            break;
        case History.Replace:
            this._history.replace((action as History.Replace).path);
            break;
        case History.Go:
            this._history.go((action as History.Go).n);
            break;
        case History.GoBack:
            this._history.goBack();
            break;
        case History.GoForward:
            this._history.goForward();
            break;
        }
        return Promise.resolve();
    }
}

