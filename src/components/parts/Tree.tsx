import * as React from 'react';

import TreeBranch from 'components/parts/TreeBranch';
import TreeLeaf from 'components/parts/TreeLeaf';
import createChainedFunction from 'utils/createChainedFunction';

export default class Tree extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        onSelect: React.PropTypes.func,
    };

    constructor(props: any) {
        super(props);

        this.state = {
            activeKey: null,
            activeType: null,
        };
    }

    handleSelect(event: any, activeKey: React.Key, activeType: React.ReactType) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(event, activeKey, activeType);
        }

        this.setState(state => ({ ...state, activeKey, activeType }));
    }

    renderChild(child: React.ReactElement<any>) {
        const childType = child.type;

        if (childType === TreeBranch || childType === TreeLeaf) {
            const { activeKey, activeType } = this.state;
            const childKey = child.key;

            const props = {
                ...child.props,
                isSelected: childType === activeType && childKey === activeKey,
                onSelect: createChainedFunction(
                    (event) => this.handleSelect(event, childKey, childType),
                    child.props.onSelect
                ),
                children: React.Children.map(child.props.children, this.renderChild.bind(this))
            };

            return React.cloneElement(child, props);
        } else {
            return child;
        }
    }

    render() {
        const { children } = this.props;

        return (
            <ul className="tree">{React.Children.map(children, this.renderChild.bind(this))}</ul>
        );
    }
}
