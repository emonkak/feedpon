import * as React from 'react';
import * as RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import * as classnames from 'classnames';

import createChainedFunction from 'utils/createChainedFunction';

export default class Menu extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        isOpened: React.PropTypes.bool,
        onClose: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        pullRight: React.PropTypes.bool,
    };

    static defaultProps = {
        isOpened: false,
    };

    renderChild(child: React.ReactElement<any>) {
        const { onSelect } = this.props;
        const childKey = child.key;

        const props = {
            ...child.props,
            onSelect: createChainedFunction(
                child.props.onSelect,
                (event) => onSelect(event, childKey)
            ),
        };

        return React.cloneElement(child, props);
    }

    render() {
        const { children, isOpened, onClose, pullRight } = this.props;

        return (
            <RootCloseWrapper disabled={!isOpened} onRootClose={onClose}>
                <ul className={classnames('dropdown-menu', {
                    'dropdown-menu-right': pullRight,
                })}>
                    {React.Children.map(children, this.renderChild.bind(this))}
                </ul>
            </RootCloseWrapper>
        );
    }
}
