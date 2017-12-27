import React, { Children, PureComponent, isValidElement } from 'react';
import classnames from 'classnames';

import UpdateBlocker from 'components/widgets/UpdateBlocker';

interface TreeProps {
}

export class Tree extends PureComponent<TreeProps, {}> {
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
    onSelect?: (value?: any) => void;
    onExpand?: () => void;
    onClose?: () => void;
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
    };

    constructor(props: TreeBranchProps, context: any) {
        super(props, context);

        this.state = {
            isExpanded: Children.toArray(props.children).some(this.shouldExpand, this)
        };

        this.handleExpand = this.handleExpand.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleUpdateChild = this.handleUpdateChild.bind(this);
    }

    componentWillReceiveProps(nextProps: TreeBranchProps) {
        if (Children.toArray(nextProps.children).some(this.shouldExpand, this)) {
            this.setState({
                isExpanded: true
            });
        }
    }

    handleExpand(event: React.MouseEvent<any>) {
        event.preventDefault();

        this.setState((state) => ({
            isExpanded: !state.isExpanded
        }));
    }

    handleSelect(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isSelected, onSelect, value } = this.props;

        if (!isSelected && onSelect) {
            onSelect(value);
        }
    }

    handleUpdateChild(value: any, isSelected: boolean) {
        if (isSelected) {
            this.setState({
                isExpanded: true
            });
        }

        this.context.tree.onUpdateChild(value, isSelected);
    }

    shouldExpand(child: React.ReactChild): boolean {
        if (isValidElement(child)) {
            const type = child.type as any;
            if (type === TreeLeaf) {
                return (child.props as TreeLeafProps).isSelected!;
            }
            if (type === TreeBranch) {
                return Children.toArray((child.props as TreeBranchProps).children).some(this.shouldExpand, this);
            }
        }
        return false;
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
                <UpdateBlocker shouldUpdate={isExpanded}>
                    <div className="tree">
                        {children}
                    </div>
                </UpdateBlocker>
            </div>
        );
    }
}

interface TreeLeafProps {
    className?: string;
    icon?: React.ReactElement<any>;
    isSelected?: boolean;
    onSelect?: (value?: any) => void;
    primaryText: string;
    secondaryText?: string;
    title?: string;
    value: any;
}

export class TreeLeaf extends PureComponent<TreeLeafProps, {}> {
    static defaultProps = {
        isSelected: false
    };

    constructor(props: TreeLeafProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isSelected, value, onSelect } = this.props;

        if (!isSelected && onSelect) {
            onSelect(value);
        }
    }

    render() {
        const { className, icon, isSelected, primaryText, secondaryText, title } = this.props;

        return (
            <div className="tree-leaf">
                <a
                    className={classnames('tree-node', className, {
                        'is-selected': isSelected
                    })}
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
