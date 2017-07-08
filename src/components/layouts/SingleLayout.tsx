import React, { PureComponent } from 'react';

import InstantNotifications from 'components/InstantNotifications';
import Notifications from 'components/Notifications';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface SingleLayoutProps {
    isLoading: boolean;
}

class SingleLayout extends PureComponent<SingleLayoutProps, {}> {
    render() {
        const { children, isLoading } = this.props;

        return (
            <div>
                <div className="l-notifications">
                    <Notifications />
                </div>
                <div className="l-instant-notifications">
                    <InstantNotifications />
                </div>
                <div className="l-backdrop">
                    {isLoading ? <i className="icon icon-48 icon-spinner icon-rotating" /> : null}
                </div>
                <div className="l-content">
                    {children}
                </div>
            </div>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        isLoading: state.backend.isLoading
    })
})(SingleLayout);
