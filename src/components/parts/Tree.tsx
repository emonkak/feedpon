import * as React from 'react';

import TreeBranch from 'components/parts/TreeBranch';
import TreeLeaf from 'components/parts/TreeLeaf';
import createChainedFunction from 'utils/createChainedFunction';

export default class Tree extends React.PureComponent<any, any> {
    static propTypes = {
        value: React.PropTypes.string,
        children: React.PropTypes.node.isRequired,
        onSelect: React.PropTypes.func,
    };

    constructor(props: any) {
        super(props);

        this.state = {
            value: props.value,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.value !== nextProps.value) {
            this.setState(state => ({ ...state, value: nextProps.value }));
        }
    }

    handleSelect(event: any, value: React.Key) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(event, value);
        }

        this.setState(state => ({ ...state, value }));
    }

    renderChild(child: React.ReactElement<any>) {
        if (child.type === TreeBranch || child.type === TreeLeaf) {
            const { value } = this.state;

            const shouldExpand = (child: React.ReactElement<any>) => {
                return child.type === TreeLeaf
                    ? child.props.value === value
                    : React.Children.toArray(child.props.children)
                        .some(shouldExpand);
            };

            return React.cloneElement(child, {
                ...child.props,
                expanded: shouldExpand(child),
                selected: child.props.value === value,
                onSelect: createChainedFunction(
                    event => this.handleSelect(event, child.key),
                    child.props.onSelect
                ),
                children: React.Children.map(child.props.children, this.renderChild.bind(this))
            });
        } else {
            return child;
        }
    }

    render() {
        const { children } = this.props;

        return (
            <ul className="tree">
                {React.Children.map(children, this.renderChild.bind(this))}
            </ul>
        );
    }
}
