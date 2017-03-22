import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeBranch extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        isExpanded: PropTypes.bool,
        isSelected: PropTypes.bool,
        onExpand: PropTypes.func,
        onSelect: PropTypes.func,
        primaryText: PropTypes.string.isRequired,
        secondaryText: PropTypes.string,
        value: PropTypes.any.isRequired,
    };

    static defaultProps = {
        isExpanded: false,
    }

    constructor(props: any) {
        super(props);

        this.state = {
            isExpanded: props.isExpanded,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.isExpanded !== nextProps.isExpanded) {
            this.setState(state => ({
                ...state,
                isExpanded: nextProps.isExpanded || state.isExpanded,
            }));
        }
    }

    handleExpand(event: any) {
        event.preventDefault();

        const { onExpand } = this.props;
        const { isExpanded } = this.state;

        if (onExpand) {
            onExpand(event, !isExpanded);
        }

        this.setState(state => ({
            ...state,
            isExpanded: !isExpanded,
        }));
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isSelected } = this.props;
        if (isSelected) {
            return;
        }

        const { onSelect } = this.props;
        if (onSelect) {
            onSelect(event);
        }
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
        const { children, className, isSelected, primaryText, secondaryText } = this.props;
        const { isExpanded } = this.state;

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
