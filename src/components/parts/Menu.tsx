import React, { Children, PropTypes, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import createChainedFunction from 'supports/createChainedFunction';

interface Props {
    children?: React.ReactNode;
    onSelect?: (value: string | number) => void;
    pullRight?: boolean;
}

export default class Menu extends PureComponent<Props, {}> {
    static propTypes = {
        children: PropTypes.node,
        onSelect: PropTypes.func,
        pullRight: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        pullRight: false
    };

    renderChild(child: React.ReactElement<any>) {
        const { onSelect } = this.props;
        const childKey = child.key;

        return cloneElement(child, {
            ...child.props,
            onSelect: createChainedFunction(
                child.props.onSelect,
                () => onSelect(childKey)
            ),
        });
    }

    render() {
        const { children, pullRight } = this.props;

        return (
            <div className={classnames('menu', {
                'menu-pull-right': pullRight,
            })}>
                {Children.map(children, this.renderChild.bind(this))}
            </div>
        );
    }
}
