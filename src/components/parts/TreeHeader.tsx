import React, { PropTypes, PureComponent } from 'react';

interface Props {
    children?: React.ReactNode
}

export default class TreeHeader extends PureComponent<Props, {}> {
    static propTypes = {
        children: PropTypes.node
    };

    render() {
        const { children } = this.props;

        return (
            <li>
                <div className="tree-header">
                    {children}
                </div>
            </li>
        );
    }
}
