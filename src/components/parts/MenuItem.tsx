import * as React from 'react';
import * as classnames from 'classnames';

export default class MenuItem extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node,
        isActive: React.PropTypes.bool,
        isDisabled: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

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
                <a href="#" onClick={this.handleSelect}>{children}</a>
            </li>
        );
    }
}
