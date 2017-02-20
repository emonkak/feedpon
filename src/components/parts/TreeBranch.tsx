import * as React from 'react';
import * as classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeBranch extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        className: React.PropTypes.string,
        expanded: React.PropTypes.bool,
        onExpand: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        primaryText: React.PropTypes.string.isRequired,
        secondaryText: React.PropTypes.string,
        selected: React.PropTypes.bool,
    };

    static defaultProps = {
        selected: false,
        expanded: false,
    }

    constructor(props: any) {
        super(props);

        this.state = {
            selected: props.selected,
            expanded: props.expanded,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.selected !== nextProps.selected) {
            this.setState(state => ({ ...state, selected: nextProps.selected }));
        }

        if (this.props.expanded !== nextProps.expanded) {
            this.setState(state => ({ ...state, expanded: nextProps.expanded }));
        }
    }

    handleExpand(event: any) {
        event.preventDefault();

        const { expanded } = this.state;
        const { onExpand } = this.props;

        if (onExpand) {
            onExpand(event, !expanded);
        }

        this.setState(state => ({ ...state, expanded: !expanded }));
    }

    handleSelect(event: any) {
        event.preventDefault();

        const { selected } = this.state;
        if (selected) {
            return;
        }

        const { onSelect } = this.props;
        if (onSelect) {
            onSelect(event);
        }

        this.setState(state => ({ ...state, selected: true }));
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
        const { children, className, primaryText, secondaryText } = this.props;
        const { expanded, selected } = this.state;

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
