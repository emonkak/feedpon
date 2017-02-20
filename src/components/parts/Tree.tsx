import * as React from 'react';

import TreeBranch from 'components/parts/TreeBranch';
import TreeLeaf from 'components/parts/TreeLeaf';
import createChainedFunction from 'utils/createChainedFunction';

export default class Tree extends React.PureComponent<any, any> {
    static propTypes = {
        activeKey: React.PropTypes.string,
        children: React.PropTypes.node.isRequired,
        onSelect: React.PropTypes.func,
    };

    constructor(props: any) {
        super(props);

        this.state = {
            activeKey: props.activeKey,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.activeKey !== nextProps.activeKey) {
            this.setState(state => ({ ...state, activeKey: nextProps.activeKey }));
        }
    }

    handleSelect(event: any, activeKey: React.Key) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(event, activeKey);
        }

        this.setState(state => ({ ...state, activeKey }));
    }

    renderChild(child: React.ReactElement<any>) {
        const childType = child.type;

        if (childType === TreeBranch || childType === TreeLeaf) {
            const { activeKey } = this.state;
            const childKey = child.key;

            return React.cloneElement(child, {
                ...child.props,
                selected: childKey === activeKey,
                onSelect: createChainedFunction(
                    event => this.handleSelect(event, childKey),
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
