import React, { PureComponent } from 'react';

import Dropdown from 'components/widgets/Dropdown';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/widgets/Navbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { MenuLink } from 'components/widgets/Menu';
import { VERSION } from 'messaging/constants';
import { toggleSidebar } from 'messaging/ui/actions';

interface AboutPageProps {
    onToggleSidebar: typeof toggleSidebar;
    version: string;
}

class AboutPage extends PureComponent<AboutPageProps, {}> {
    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">About</h1>
                <Dropdown
                    toggleButton={
                        <button className="navbar-action">
                            <i className="icon icon-24 icon-menu-2" />
                        </button>
                    }>
                    <MenuLink
                        to="/kitchensink/"
                        primaryText="Go to kitchensink..." />
                </Dropdown>
            </Navbar>
        );
    }

    renderContent() {
        return (
            <div>
                <section className="section u-text-center">
                    <div className="container">
                        <a href="https://github.com/emonkak/feedpon" target="_blank">
                            <img src="./img/logo.svg" width="278" height="100" />
                        </a>
                        <div className="u-text-large"><em>The feed reader for me</em></div>
                        <div>Version <strong>{VERSION}</strong></div>
                    </div>
                </section>
                <section className="section">
                    <div className="container">
                        <h1 className="display-1">Licenses</h1>
                        <ul>
                            <li>
                                <a href="https://github.com/JedWatson/classnames/blob/master/LICENSE" target="_blank">classnames</a>
                            </li>
                            <li>
                                <a href="https://github.com/andyearnshaw/Intl.js/blob/master/LICENSE.txt" target="_blank">FastClick</a>
                            </li>
                            <li>
                                <a href="https://github.com/andyearnshaw/Intl.js/blob/master/LICENSE.txt" target="_blank">Intl.js</a>
                            </li>
                            <li>
                                <a href="https://github.com/yahoo/intl-relativeformat/blob/master/LICENSE" target="_blank">Intl RelativeFormat</a>
                            </li>
                            <li>
                                <a href="https://github.com/lodash/lodash/blob/master/LICENSE" target="_blank">lodash.debounce</a>
                            </li>
                            <li>
                                <a href="https://github.com/lodash/lodash/blob/master/LICENSE" target="_blank">lodash.throttle</a>
                            </li>
                            <li>
                                <a href="https://github.com/es-shims/Object.values" target="_blank">object.values</a>
                            </li>
                            <li>
                                <a href="https://github.com/facebook/react/blob/master/LICENSE" target="_blank">React</a>
                            </li>
                            <li>
                                <a href="https://github.com/ReactTraining/react-router/blob/master/LICENSE.md" target="_blank">React Router</a>
                            </li>
                            <li>
                                <a href="https://github.com/evgenyrodionov/redux-logger/blob/master/LICENSE" target="_blank">Logger for Redux</a>
                            </li>
                            <li>
                                <a href="https://github.com/reactjs/reselect/blob/master/LICENSE" target="_blank">Reselect</a>
                            </li>
                            <li>
                                <a href="https://github.com/inexorabletash/text-encoding/blob/master/LICENSE.md" target="_blank">text-encoding</a>
                            </li>
                            <li>
                                <a href="https://github.com/Microsoft/tslib/blob/master/LICENSE.txt" target="_blank">tslib</a>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
    }
}

export default connect({
    mapDispatchToProps: bindActions({
        onToggleSidebar: toggleSidebar
    })
})(AboutPage);
