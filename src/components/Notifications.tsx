import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import Notification from 'components/parts/Notification';
import connect from 'utils/components/connect';
import { dismissNotification } from 'messaging/actions';

@connect()
export default class Notifications extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        isReversed: PropTypes.bool.isRequired,
        notifications: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                message: PropTypes.string.isRequired,
                kind: PropTypes.oneOf(['default', 'positive', 'negative']),
            })
        ).isRequired
    };

    static defaultProps = {
        isReversed: false
    };

    handleClose(id: number) {
        const { dispatch } = this.props;

        dispatch(dismissNotification(id));
    }

    render() {
        const { isReversed, notifications } = this.props;

        return (
            <CSSTransitionGroup
                component="div"
                className={classnames('notifications', {
                    'notifications-reversed': isReversed
                })}
                transitionName="notification"
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}>
                {notifications.map(({ id, kind, message }: any) =>
                    <Notification
                        isReversed={isReversed}
                        key={id}
                        kind={kind}
                        onClose={this.handleClose.bind(this, id)}>
                        {message}
                    </Notification>
                )}
            </CSSTransitionGroup>
        );
    }
}
