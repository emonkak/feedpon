import { Thunk } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';

export function changeScrollAmount(scrollAmount: number): Thunk {
    return ({ dispatch }) => {
        dispatch({
            type: 'SCROLL_AMOUNT_CHANGED',
            scrollAmount
        });

        dispatch(sendNotification(
            'Scroll amount changed',
            'positive'
        ));
    };
}
