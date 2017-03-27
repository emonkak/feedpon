import React, { PropTypes, PureComponent } from 'react';

export default class TreeHeader extends PureComponent<any, any> {
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
