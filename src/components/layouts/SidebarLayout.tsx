import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';

import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import smoothScroll from 'utils/dom/smoothScroll';
import { State } from 'messaging/types';
import { closeSidebar, endScroll, openSidebar, startScroll } from 'messaging/ui/actions';

interface SidebarLayoutProps {
    children: React.ReactElement<any>;
    isAuthenticating: boolean;
    location: Location;
    onCloseSidebar: typeof closeSidebar;
    onEndScroll: typeof endScroll;
    onOpenSidebar: typeof openSidebar;
    onStartScroll: typeof startScroll;
    router: History;
    sidebarIsOpened: boolean;
}

class SidebarLayout extends PureComponent<SidebarLayoutProps, {}> {
    private unsubscribe: () => void | null;

    constructor(props: SidebarLayoutProps, context: any) {
        super(props, context);

        this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
        this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
        this.handleChangeLocation = this.handleChangeLocation.bind(this);
    }

    componentWillMount() {
        const { router } = this.props;

        this.unsubscribe = router.listen(this.handleChangeLocation);
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    componentDidMount() {
        this.refreshBodyStyles();
    }

    componentDidUpdate() {
        this.refreshBodyStyles();
    }

    handleChangeLocation() {
        const { onCloseSidebar } = this.props;

        window.scrollTo(0, 0);

        if (window.matchMedia('(max-width: 768px)').matches) {
            onCloseSidebar();
        }
    }

    handleCloseSidebar(event: React.SyntheticEvent<any>) {
        const { onCloseSidebar, sidebarIsOpened } = this.props;

        if (sidebarIsOpened && event.target === event.currentTarget) {
            onCloseSidebar();
        }
    }

    handleToggleSidebar() {
        const { onCloseSidebar, onOpenSidebar, sidebarIsOpened } = this.props;

        if (sidebarIsOpened) {
            onCloseSidebar();
        } else {
            onOpenSidebar();
        }
    }

    refreshBodyStyles() {
        const { sidebarIsOpened } = this.props;

        if (sidebarIsOpened) {
            document.body.classList.add('sidebar-is-opened');
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.body.classList.remove('sidebar-is-opened');
            document.documentElement.classList.remove('sidebar-is-opened');
        }
    }

    scrollTo(x: number, y: number): Promise<void> {
        this.props.onStartScroll();

        return smoothScroll(document.body, x, y).then(() => {
            this.props.onEndScroll();
        });
    }

    render() {
        const { children, isAuthenticating, location, router, sidebarIsOpened } = this.props;

        return (
            <div
                className={classnames('l-root', {
                    'is-opened': sidebarIsOpened
                })}
                onClick={this.handleCloseSidebar}>
                <div className={classnames('l-sidebar', { 'is-pinned': sidebarIsOpened })}>
                    <Sidebar router={router} location={location} />
                </div>
                <div className="l-notifications">
                    <Notifications />
                </div>
                {cloneElement(children, {
                    onToggleSidebar: this.handleToggleSidebar,
                    scrollTo: this.scrollTo.bind(this)
                })}
                <div className="l-backdrop">
                    {isAuthenticating ? <i className="icon icon-48 icon-spinner icon-rotating" /> : null}
                </div>
            </div>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        isAuthenticating: state.credential.isLoading,
        sidebarIsOpened: state.ui.sidebarIsOpened
    }),
    mapDispatchToProps: bindActions({
        onOpenSidebar: openSidebar,
        onCloseSidebar: closeSidebar,
        onStartScroll: startScroll,
        onEndScroll: endScroll
    })
})(SidebarLayout);
