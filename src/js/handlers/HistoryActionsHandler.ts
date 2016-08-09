import Inject from '../shared/di/annotations/Inject';
import Named from '../shared/di/annotations/Named';
import { IEventDispatcher, IActionHandler } from '../shared/interfaces';
import { History } from '../constants/actionTypes';

type HistoryActions = History.Push | History.Replace | History.Go | History.GoBack | History.GoForward;

@Inject
export default class HistoryActionsHandler implements IActionHandler<HistoryActions> {
    static subscribedActionTypes = [History.Push, History.Replace, History.Go, History.GoBack, History.GoForward];

    constructor(@Named('history') private _history: HistoryModule.History) {
    }

    handle(action: HistoryActions, dispatch: IEventDispatcher): Promise<void> {
        switch (action.actionType) {
        case History.Push:
            this._history.push(action.path);
            break;
        case History.Replace:
            this._history.replace(action.path);
            break;
        case History.Go:
            this._history.go(action.n);
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

