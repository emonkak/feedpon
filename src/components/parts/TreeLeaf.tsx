import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

interface Props {
    className?: string;
    icon?: React.ReactElement<any>;
    isSelected?: boolean;
    onSelect?: () => void;
    primaryText: string;
    secondaryText?: string;
    value: string | number;
}

export default class TreeLeaf extends PureComponent<Props, {}> {
    static propTypes = {
        className: PropTypes.string,
        icon: PropTypes.element,
        isSelected: PropTypes.bool.isRequired,
        onSelect: PropTypes.func,
        primaryText: PropTypes.string.isRequired,
        secondaryText: PropTypes.string,
        value: PropTypes.any.isRequired,
    };

    static defaultProps = {
        isSelected: false,
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isSelected } = this.props;
        if (isSelected) {
            return;
        }

        const { onSelect } = this.props;
        if (onSelect) {
            onSelect();
        }
    }

    render() {
        const { className, icon, isSelected, primaryText, secondaryText } = this.props;

        return (
            <li>
                <TreeNode className={classnames({ 'is-selected': isSelected }, className)}
                          icon={icon}
                          primaryText={primaryText}
                          secondaryText={secondaryText}
                          onIconClick={this.handleSelect.bind(this)}
                          onTextClick={this.handleSelect.bind(this)} />
            </li>
        );
    }
}
