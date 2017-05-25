import React, { PureComponent } from 'react';

import Notifications from 'components/Notifications';

interface SingleLayoutProps {
}

export default class SingleLayout extends PureComponent<SingleLayoutProps, {}> {
    render() {
        const { children } = this.props;

        return (
            <div>
                <div className="l-notifications">
                    <Notifications />
                </div>
                {children}
            </div>
        );
    }
}
