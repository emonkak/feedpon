import * as React from 'react';
import * as classnames from 'classnames';

export default class DropdownMenuItem extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node,
        isActive: React.PropTypes.bool,
        isDisabled: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
    };

    handleSelect(event: any) {
        const { isDisabled, onSelect } = this.props;

        event.preventDefault();

        if (isDisabled) {
            return;
        }

        if (onSelect) {
            onSelect();
        }
    }

    render() {
        const { children, isActive, isDisabled } = this.props;

        return (
            <li className={classnames('dropdown-menu-item', {
                'is-disabled': isDisabled,
                'is-active': isActive,
            })}>
                <a href="#" onClick={this.handleSelect.bind(this)}>{children}</a>
            </li>
        );
    }
}
