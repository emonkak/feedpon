import * as React from 'react';

import AutoHidingHeader from 'components/parts/AutoHidingHeader';
import Sidebar from 'components/Sidebar';

export default class App extends React.PureComponent<any, any> {
    static propTypes = {
        main: React.PropTypes.node.isRequired,
        navbar: React.PropTypes.node,
    };

    render() {
        const { main, navbar, location } = this.props;

        const header = navbar
            ? (<AutoHidingHeader className="l-header">{navbar}</AutoHidingHeader>)
            : null;

        return (
            <div>
                <div className="l-sidebar">
                    <Sidebar activeKey={location.pathname} />
                </div>
                {header}
                <div className="l-main">
                    {main}
                </div>
            </div>
        );
    }
}
