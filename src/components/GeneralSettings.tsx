import React, { PureComponent } from 'react';

import connect from 'utils/react/connect';
import { State } from 'messaging/types';

class GeneralSettings extends PureComponent<any, any> {
    render() {
        return (
            <div>
                <h1>General</h1>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({}),
    (dispatch) => ({})
)(GeneralSettings);
