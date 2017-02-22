import * as React from 'react';
import * as classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeLeaf extends React.PureComponent<any, any> {
    static propTypes = {
        className: React.PropTypes.string,
        icon: React.PropTypes.element,
        onSelect: React.PropTypes.func,
        primaryText: React.PropTypes.string.isRequired,
        secondaryText: React.PropTypes.string,
        selected: React.PropTypes.bool,
        value: React.PropTypes.any.isRequired,
    };

    static defaultProps = {
        selected: false,
    }

    handleSelect(event: any) {
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
