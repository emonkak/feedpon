import React, { Children, PureComponent, cloneElement, isValidElement } from 'react';
import classnames from 'classnames';

import createChainedFunction from 'utils/createChainedFunction';

interface TreeProps {
    children?: React.ReactNode;
    isExpanded?: boolean;
    onSelect?: (value: any) => void;
    selectedValue?: any;
}

export class Tree extends PureComponent<TreeProps, {}> {
    static defaultProps = {
        isExpanded: true
    };

    constructor(props: TreeProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    shouldComponentUpdate(nextProps: TreeProps, nextState: {}) {
        return nextProps.isExpanded! &&
            (this.props.children !== nextProps.children ||
             this.props.isExpanded !== nextProps.isExpanded ||
             this.props.onSelect !== nextProps.onSelect ||
             this.props.selectedValue !== nextProps.selectedValue);
    }

    handleSelect(selectedValue: any) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(selectedValue);
        }
    }

    renderChild(child: React.ReactChild) {
        if (isValidElement<any>(child)) {
            if (child.type === TreeBranch) {
                const { selectedValue } = this.props;
                const shouldExpand = (child: React.ReactElement<any>): boolean => {
                    return (child.type === TreeLeaf && child.props.value === selectedValue)
                            || (child.type === TreeBranch && Children.toArray(child.props.children).some(shouldExpand));
                };

                return cloneElement(child, {
                    ...child.props,
                    isExpanded: child.props.isExpanded || shouldExpand(child),
                    onSelect: createChainedFunction(child.props.onSelect, this.handleSelect),
                    selectedValue
                });
            }

            if (child.type === TreeLeaf) {
                const { selectedValue } = this.props;

                return cloneElement(child, {
                    ...child.props,
                    isSelected: child.props.value === selectedValue,
                    onSelect: createChainedFunction(child.props.onSelect, this.handleSelect)
                });
            }
        }

        return child;
    }

    render() {
        const { children } = this.props;

        return (
            <div className="tree">
                {Children.map(children, this.renderChild.bind(this))}
            </div>
        );
    }
}

interface TreeBranchProps {
    children?: React.ReactNode;
    className?: string;
    isExpanded?: boolean;
    onSelect?: (value: any) => void;
    primaryText: string;
    secondaryText?: string;
    selectedValue?: any;
    title?: string;
    value: any;
}

interface TreeBranchState {
    isExpanded: boolean;
}

export class TreeBranch extends PureComponent<TreeBranchProps, TreeBranchState> {
    static defaultProps = {
        isExpanded: false
    }

    constructor(props: TreeBranchProps, context: any) {
        super(props, context);

        this.state = {
            isExpanded: !!props.isExpanded,
        };

        this.handleExpand = this.handleExpand.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillReceiveProps(nextProps: TreeBranchProps) {
        if (this.props.isExpanded !== nextProps.isExpanded) {
            this.setState(state => ({
                ...state,
                isExpanded: nextProps.isExpanded || state.isExpanded,
            }));
        }
    }

    handleExpand(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isExpanded } = this.state;

        this.setState({
            isExpanded: !isExpanded,
        });
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSelect, selectedValue, value } = this.props;

        if (onSelect && value !== selectedValue) {
            onSelect(value);
        }
    }

    render() {
        const { onSelect, children, className, primaryText, secondaryText, selectedValue, title, value } = this.props;
        const { isExpanded } = this.state;

        return (
            <div className="tree-branch">
                <div className={classnames('tree-node', className, { 'is-selected': value === selectedValue, 'is-expanded': isExpanded } )}>
                    <a className="tree-node-icon" href="#" onClick={this.handleExpand}>
                        {isExpanded ? <i className="icon icon-16 icon-angle-down" /> : <i className="icon icon-16 icon-angle-right" />}
                    </a>
                    <a className="tree-node-label" href="#" title={title} onClick={this.handleSelect}>
                        <span className="tree-node-primary-text">{primaryText}</span>
                        <span className="tree-node-secondary-text">{secondaryText}</span>
                    </a>
                </div>
                <Tree isExpanded={isExpanded}
                      selectedValue={selectedValue}
                      onSelect={onSelect}>{children}</Tree>
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

    constructor(props: TreeLeafProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isSelected, onSelect, value } = this.props;

        if (onSelect && !isSelected) {
            onSelect(value);
        }
    }

    render() {
        const { className, icon, isSelected, primaryText, secondaryText, title } = this.props;

        return (
            <div className="tree-leaf">
                <a className={classnames('tree-node', className, { 'is-selected': isSelected } )}
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
