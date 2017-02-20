import * as React from 'react';
import * as classnames from 'classnames';

export default class MenuItem extends React.PureComponent<any, any> {
    static propTypes = {
        active: React.PropTypes.bool,
        children: React.PropTypes.node,
        disabled: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
    };

    handleSelect(event: any) {
        const { disabled, onSelect } = this.props;

        event.preventDefault();

        if (disabled) {
            return;
        }

        if (onSelect) {
            onSelect();
        }
    }

    render() {
        const { children, active, disabled } = this.props;

        return (
            <li className={classnames('menu-item', {
                'is-disabled': disabled,
                'is-active': active,
            })}>
                <a href="#" onClick={this.handleSelect.bind(this)}>{children}</a>
            </li>
        );
    }
}
