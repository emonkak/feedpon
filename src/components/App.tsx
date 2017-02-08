import * as React from 'react';

import Sidebar from 'components/Sidebar';

export default class App extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.element.isRequired,
    };

    render() {
        const { children, location } = this.props;

        return (
            <div>
                <div className="l-sidebar">
                    <Sidebar activeKey={location.pathname} />
                </div>
                <div className="l-main">
                    {children}
                </div>
            </div>
        );
    }
}
