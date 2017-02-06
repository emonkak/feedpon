import * as React from 'react';
import * as classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeBranch extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        className: React.PropTypes.string,
        isExpanded: React.PropTypes.bool,
        isSelected: React.PropTypes.bool,
        onExpand: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        primaryText: React.PropTypes.string.isRequired,
        secondaryText: React.PropTypes.string,
    };

    static defaultProps = {
        isSelected: false,
        isExpanded: false,
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

        if (this.props.isExpanded !== nextProps.isExpanded) {
            this.setState(state => ({ ...state, isExpanded: nextProps.isExpanded }));
        }
    }

    handleExpand(event: any) {
        event.preventDefault();

        const { isExpanded } = this.state;
        const { onExpand } = this.props;

        if (onExpand) {
            onExpand(event, !isExpanded);
        }

        this.setState(state => ({ ...state, isExpanded: !isExpanded }));
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

    renderIcon() {
        const { isExpanded } = this.state;

        if (isExpanded) {
            return (
                <i className="icon icon-16 icon-angle-down" />
            );
        } else {
            return (
                <i className="icon icon-16 icon-angle-right" />
            );
        }
    }

    render() {
        const { children, className, primaryText, secondaryText } = this.props;
        const { isExpanded, isSelected } = this.state;

        return (
            <li>
                <TreeNode className={classnames({ 'is-selected': isSelected, 'is-expanded': isExpanded }, className)}
                          icon={this.renderIcon()}
                          primaryText={primaryText}
                          secondaryText={secondaryText}
                          onIconClick={this.handleExpand.bind(this)}
                          onTextClick={this.handleSelect.bind(this)} />
                <ul className="tree">{children}</ul>
            </li>
        );
    }
}
