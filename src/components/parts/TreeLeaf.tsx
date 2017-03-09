import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeLeaf extends PureComponent<any, any> {
    static propTypes = {
        className: PropTypes.string,
        icon: PropTypes.element,
        onSelect: PropTypes.func,
        primaryText: PropTypes.string.isRequired,
        secondaryText: PropTypes.string,
        selected: PropTypes.bool,
        value: PropTypes.any.isRequired,
    };

    static defaultProps = {
        selected: false,
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { selected } = this.props;
        if (selected) {
            return;
        }

        const { onSelect } = this.props;
        if (onSelect) {
            onSelect(event);
        }
    }

    render() {
        const { className, icon, primaryText, secondaryText, selected } = this.props;

        return (
            <li>
                <TreeNode className={classnames({ 'is-selected': selected }, className)}
                          icon={icon}
                          primaryText={primaryText}
                          secondaryText={secondaryText}
                          onIconClick={this.handleSelect.bind(this)}
                          onTextClick={this.handleSelect.bind(this)} />
            </li>
        );
    }
}
