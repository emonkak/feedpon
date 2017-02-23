import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeBranch extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        expanded: PropTypes.bool,
        onExpand: PropTypes.func,
        onSelect: PropTypes.func,
        primaryText: PropTypes.string.isRequired,
        secondaryText: PropTypes.string,
        selected: PropTypes.bool,
        value: PropTypes.any.isRequired,
    };

    static defaultProps = {
        expanded: false,
    }

    constructor(props: any) {
        super(props);

        this.state = {
            expanded: props.expanded,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.expanded !== nextProps.expanded) {
            this.setState(state => ({
                ...state,
                expanded: nextProps.expanded || state.expanded,
            }));
        }
    }

    handleExpand(event: any) {
        event.preventDefault();

        const { onExpand } = this.props;
        const { expanded } = this.state;

        if (onExpand) {
            onExpand(event, !expanded);
        }

        this.setState(state => ({
            ...state,
            expanded: !expanded,
        }));
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

    renderIcon() {
        const { expanded } = this.state;

        if (expanded) {
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
        const { children, className, primaryText, secondaryText, selected } = this.props;
        const { expanded } = this.state;

        return (
            <li>
                <TreeNode className={classnames({ 'is-selected': selected, 'is-expanded': expanded }, className)}
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
