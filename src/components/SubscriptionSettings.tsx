import React, { PureComponent } from 'react';

import connect from 'utils/react/connect';
import { State } from 'messaging/types';

class SubscriptionSettings extends PureComponent<any, any> {
    render() {
        return (
            <div>
                <h1 className="display-1">Subscription</h1>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({}),
    (dispatch) => ({})
)(SubscriptionSettings);


