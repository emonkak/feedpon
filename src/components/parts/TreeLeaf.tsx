import * as React from 'react';
import * as classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeLeaf extends React.PureComponent<any, any> {
    static propTypes = {
        className: React.PropTypes.string,
        icon: React.PropTypes.element,
        isSelected: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
        primaryText: React.PropTypes.string.isRequired,
        secondaryText: React.PropTypes.string,
    };

    static defaultProps = {
        isSelected: false,
    }

    constructor(props: any) {
        super(props);

        this.state = {
            isSelected: props.isSelected,
            isExpanded: props.isExpanded,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.isSelected !== nextProps.isSelected) {
            this.setState(state => ({ ...state, isSelected: nextProps.isSelected }));
        }
    }

    handleSelect(event: any) {
        event.preventDefault();

        const { isSelected } = this.state;
        if (isSelected) {
            return;
        }

        const { onSelect } = this.props;
        if (onSelect) {
            onSelect(event);
        }

        this.setState(state => ({ ...state, isSelected: true }));
    }

    render() {
        const { className, icon, primaryText, secondaryText } = this.props;
        const { isSelected } = this.state;

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
