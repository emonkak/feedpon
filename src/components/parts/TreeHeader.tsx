import React, { PureComponent } from 'react';

interface TreeHeaderProps {
    children?: React.ReactNode
}

export default class TreeHeader extends PureComponent<TreeHeaderProps, {}> {
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
