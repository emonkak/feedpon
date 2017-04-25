import React, { Children, PureComponent, cloneElement } from 'react';

import TreeBranch from 'components/parts/TreeBranch';
import TreeLeaf from 'components/parts/TreeLeaf';
import createChainedFunction from 'utils/createChainedFunction';

interface TreeProps {
    children?: React.ReactNode;
    onSelect?: (value: string | number) => void;
    value?: string | number;
};

interface TreeState {
    value: string | number | undefined;
};

export default class Tree extends PureComponent<TreeProps, TreeState> {
    constructor(props: TreeProps, context: any) {
        super(props, context);

        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps: TreeProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({
                value: nextProps.value
            });
        }
    }

    handleSelect(value: React.Key) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this.setState({
            value
        });
    }

    renderChild(child: React.ReactElement<any>) {
        if (child != null && (child.type === TreeBranch || child.type === TreeLeaf)) {
            const { value } = this.state;

            const shouldExpand = (child: React.ReactElement<any>): boolean => {
                return child.type === TreeLeaf
                    ? child.props.value === value
                    : Children.toArray(child.props.children).some(shouldExpand);
            };

            return cloneElement(child, {
                ...child.props,
                isExpanded: shouldExpand(child),
                isSelected: child.props.value === value,
                onSelect: createChainedFunction(
                    this.handleSelect.bind(this, child.key),
                    child.props.onSelect
                ),
                children: Children.map(child.props.children, this.renderChild.bind(this))
            });
        }

        return child;
    }

    render() {
        const { children } = this.props;

        return (
            <ul className="tree">
                {Children.map(children, this.renderChild.bind(this))}
            </ul>
        );
    }
}
