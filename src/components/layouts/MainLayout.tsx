import React, { PureComponent } from 'react';

interface MainLayoutProps {
    navbar: React.ReactNode;
}

export default class MainLayout extends PureComponent<MainLayoutProps, {}> {
    render() {
        const { navbar, children } = this.props;

        return (
            <div className="l-main">
                <div className="l-main-header">
                    {navbar}
                </div>
                <div className="l-main-content">
                    {children}
                </div>
                <div className="l-main-footer">
                    <div className="u-text-center">
                        <small>Copyright &copy; 2017 Shota Nozaki</small>
                    </div>
                    <div className="u-text-center">
                        <ul className="list-inline list-inline-slashed">
                            <li className="list-inline-item"><a href="https://github.com/emonkak/feedpon" target="_blank">Source code</a></li>
                            <li className="list-inline-item"><a href="https://github.com/emonkak/feedpon/issues" target="_blank">Issues</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
