import * as CSSTransitionGroup from 'react-addons-css-transition-group';
import * as React from 'react';

import Notification from 'components/parts/Notification';
import connect from 'utils/components/connect';
import { dismissNotification } from 'messaging/actions';

@connect()
export default class Notifications extends React.PureComponent<any, any> {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        notifications: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                id: React.PropTypes.number.isRequired,
                message: React.PropTypes.string.isRequired,
                kind: React.PropTypes.oneOf(['default', 'positive', 'negative']),
            })
        ).isRequired,
    };

    handleClose(id: number) {
        const { dispatch } = this.props;

        dispatch(dismissNotification(id));
    }

    render() {
        const { notifications } = this.props;

        return (
            <CSSTransitionGroup
                component="div"
                className="notifications"
                transitionName="notification"
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}>
                {notifications.map(({ id, kind, message }: any) =>
                    <Notification key={id} kind={kind} onClose={this.handleClose.bind(this, id)}>
                        {message}
                    </Notification>
                )}
            </CSSTransitionGroup>
        );
    }
}
