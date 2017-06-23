import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classnames from 'classnames';

const treeContext = {
    tree: PropTypes.shape({
        onSelect: PropTypes.func.isRequired
    }).isRequired
};

interface TreeContext {
    tree: {
        onSelect: (value: any) => void
    }
}

interface TreeProps {
    children?: React.ReactNode;
    onSelect?: (value: any) => void;
}

export class Tree extends PureComponent<TreeProps, {}> {
    static defaultProps = {
        onSelect: () => ({})
    };

    static childContextTypes = treeContext;

    getChildContext(): TreeContext {
        const { onSelect } = this.props;

        return {
            tree: { onSelect: onSelect! }
        };
    }

    render() {
        return (
            <div className="tree">
                {this.props.children}
            </div>
        );
    }
}

interface TreeBranchProps {
    children?: React.ReactNode;
    className?: string;
    isExpanded?: boolean;
    isSelected?: boolean;
    onSelect?: (value: any) => void;
    primaryText: string;
    secondaryText?: string;
    title?: string;
    value: any;
}

interface TreeBranchState {
    isExpanded: boolean;
}

export class TreeBranch extends PureComponent<TreeBranchProps, TreeBranchState> {
    static defaultProps = {
        isExpanded: false,
        isSelected: false
    }

    static contextTypes = treeContext;

    context: TreeContext;

    constructor(props: TreeBranchProps, context: any) {
        super(props, context);

        this.state = {
            isExpanded: props.isExpanded!
        };

        this.handleExpand = this.handleExpand.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleExpand(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isExpanded } = this.state;

        this.setState({
            isExpanded: !isExpanded
        });
    }

    handleSelect(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isSelected, onSelect, value } = this.props;

        if (!isSelected) {
            if (onSelect) {
                onSelect(value);
            }

            this.context.tree.onSelect(value);
        }
    }

    render() {
        const { children, className, isSelected, primaryText, secondaryText, title } = this.props;
        const { isExpanded } = this.state;

        return (
            <div className={classnames('tree-branch', { 'is-expanded': isExpanded })}>
                <div className={classnames('tree-node', className, {
                    'is-selected': isSelected,
                })}>
                    <a className="tree-node-icon" href="#" onClick={this.handleExpand}>
                        {isExpanded ? <i className="icon icon-16 icon-angle-down" /> : <i className="icon icon-16 icon-angle-right" />}
                    </a>
                    <a className="tree-node-label" href="#" title={title} onClick={this.handleSelect}>
                        <span className="tree-node-primary-text">{primaryText}</span>
                        <span className="tree-node-secondary-text">{secondaryText}</span>
                    </a>
                </div>
                <TreeChildren isExpanded={isExpanded}>
                    {children}
                </TreeChildren>
            </div>
        );
    }
}

interface TreeLeafProps {
    className?: string;
    icon?: React.ReactElement<any>;
    isSelected?: boolean;
    onSelect?: (value: any) => void;
    primaryText: string;
    secondaryText?: string;
    title?: string;
    value: any;
}

export class TreeLeaf extends PureComponent<TreeLeafProps, {}> {
    static defaultProps = {
        isSelected: false
    }

    static contextTypes = treeContext;

    context: TreeContext;

    constructor(props: TreeLeafProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isSelected, onSelect, value } = this.props;

        if (!isSelected) {
            this.context.tree.onSelect(value);

            if (onSelect) {
                onSelect(value);
            }
        }
    }

    render() {
        const { className, icon, isSelected, primaryText, secondaryText, title } = this.props;

        return (
            <div className="tree-leaf">
                <a
                    className={classnames('tree-node', className, {
                        'is-selected': isSelected
                    } )}
                    href="#"
                    title={title}
                    onClick={this.handleSelect}>
                    {icon ? <span className="tree-node-icon">{icon}</span> : null}
                    <span className="tree-node-label">
                        <span className="tree-node-primary-text">{primaryText}</span>
                        <span className="tree-node-secondary-text">{secondaryText}</span>
                    </span>
                </a>
            </div>
        );
    }
}

interface TreeChildrenProps {
    children?: React.ReactNode;
    isExpanded: boolean;
}

class TreeChildren extends PureComponent<TreeChildrenProps, {}> {
    shouldComponentUpdate(nextProps: TreeChildrenProps, nextState: {}) {
        return nextProps.isExpanded!
               && (this.props.isExpanded !== nextProps.isExpanded
                   || this.props.children !== nextProps.children);
    }

    render() {
        return (
            <div className="tree">
                {this.props.children}
            </div>
        );
    }
}
