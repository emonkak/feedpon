import React, { Children, Component, PureComponent, isValidElement } from 'react';
import classnames from 'classnames';

interface TreeProps {
    isExpanded?: boolean;
}

interface TreeState {
}

interface TreeBranchProps {
    children?: React.ReactNode;
    isExpanded?: boolean;
    isImportant?: boolean;
    isSelected?: boolean;
    onClose?: () => void;
    onExpand?: () => void;
    onSelect?: (value: any) => void;
    primaryText: string;
    secondaryText?: string;
    title?: string;
    value: any;
}

interface TreeBranchState {
    isExpanded: boolean;
}

interface TreeLeafProps {
    icon?: React.ReactElement<any>;
    isImportant?: boolean;
    isSelected?: boolean;
    onSelect?: (value: any) => void;
    primaryText: string;
    secondaryText?: string;
    title?: string;
    value: any;
}

interface TreeLeafState {
}

export class Tree extends Component<TreeProps, TreeState> {
    static defaultProps = {
        isExpanded: true
    };

    shouldComponentUpdate(nextProps: TreeProps, nextState: TreeState): boolean {
        return this.props.isExpanded !== nextProps.isExpanded || nextProps.isExpanded!;
    }

    render() {
        const { isExpanded } = this.props;

        return (
            <ol className={classnames('tree', { 'is-expanded': isExpanded! })}>
                {this.props.children}
            </ol>
        );
    }
}

export class TreeBranch extends PureComponent<TreeBranchProps, TreeBranchState> {
    static defaultProps = {
        isExpanded: false,
        isImportant: false,
        isSelected: false
    };

    constructor(props: TreeBranchProps, context: any) {
        super(props, context);

        this.state = {
            isExpanded: Children.toArray(props.children).some(this._shouldExpand, this)
        };
    }

    componentWillReceiveProps(nextProps: TreeBranchProps) {
        if (Children.toArray(nextProps.children).some(this._shouldExpand, this)) {
            this.setState({
                isExpanded: true
            });
        }
    }

    render() {
        const { children, isImportant, isSelected, primaryText, secondaryText, title } = this.props;
        const { isExpanded } = this.state;

        return (
            <li>
                <div className={classnames('tree-node', {
                    'is-important': isImportant,
                    'is-selected': isSelected
                })}>
                    <a className="tree-node-icon" href="#" onClick={this._handleExpand}>
                        {isExpanded ? <i className="icon icon-16 icon-angle-down" /> : <i className="icon icon-16 icon-angle-right" />}
                    </a>
                    <a className="tree-node-label" href="#" title={title} onClick={this._handleSelect}>
                        <span className="tree-node-primary-text">{primaryText}</span>
                        <span className="tree-node-secondary-text">{secondaryText}</span>
                    </a>
                </div>
                <Tree isExpanded={isExpanded}>
                    {children}
                </Tree>
            </li>
        );
    }

    private _shouldExpand(child: React.ReactChild): boolean {
        if (isValidElement(child)) {
            const type = child.type as any;
            if (type === TreeLeaf) {
                return (child.props as TreeLeafProps).isSelected!;
            }
            if (type === TreeBranch) {
                return Children.toArray((child.props as TreeBranchProps).children).some(this._shouldExpand, this);
            }
        }
        return false;
    }

    private _handleExpand = (event: React.MouseEvent<any>) => {
        event.preventDefault();

        this.setState((state) => ({
            isExpanded: !state.isExpanded
        }));
    }

    private _handleSelect = (event: React.MouseEvent<any>) => {
        event.preventDefault();

        const { isSelected, onSelect, value } = this.props;

        if (!isSelected && onSelect) {
            onSelect(value);
        }
    }
}

export class TreeLeaf extends PureComponent<TreeLeafProps, TreeLeafState> {
    static defaultProps = {
        isImportant: false,
        isSelected: false
    };

    render() {
        const { icon, isSelected, isImportant, primaryText, secondaryText, title } = this.props;

        return (
            <li>
                <a
                    className={classnames('tree-node', {
                        'is-important': isImportant,
                        'is-selected': isSelected
                    })}
                    href="#"
                    title={title}
                    onClick={this._handleSelect}>
                    {icon ? <span className="tree-node-icon">{icon}</span> : null}
                    <span className="tree-node-label">
                        <span className="tree-node-primary-text">{primaryText}</span>
                        <span className="tree-node-secondary-text">{secondaryText}</span>
                    </span>
                </a>
            </li>
        );
    }

    private _handleSelect = (event: React.MouseEvent<any>) => {
        event.preventDefault();

        const { isSelected, value, onSelect } = this.props;

        if (!isSelected && onSelect) {
            onSelect(value);
        }
    }
}
