import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';

import * as commands from 'messaging/commands';
import InstantNotifications from 'components/InstantNotifications';
import KeyMapper from 'components/parts/KeyMapper';
import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, Store } from 'messaging/types';
import { Trie } from 'utils/containers/Trie';
import { closeSidebar, endScroll, openSidebar, startScroll } from 'messaging/ui/actions';
import { sendInstantNotification } from 'messaging/instantNotifications/actions';
import { smoothScrollTo } from 'utils/dom/smoothScroll';

const SCROLL_ANIMATION_TIME = 1000 / 60 * 10;

interface SidebarLayoutProps {
    store: Store;
    children: React.ReactElement<any>;
    isAuthenticating: boolean;
    keyMappings: Trie<string>;
    location: Location;
    onCloseSidebar: typeof closeSidebar;
    onEndScroll: typeof endScroll;
    onOpenSidebar: typeof openSidebar;
    onStartScroll: typeof startScroll;
    router: History;
    sidebarIsOpened: boolean;
}

class SidebarLayout extends PureComponent<SidebarLayoutProps, {}> {
    private routerSubscription: (() => void) | null = null;

    constructor(props: SidebarLayoutProps, context: any) {
        super(props, context);

        this.handleChangeLocation = this.handleChangeLocation.bind(this);
        this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
        this.handleInvokeCommand = this.handleInvokeCommand.bind(this);
        this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
    }

    componentWillMount() {
        const { router } = this.props;

        this.routerSubscription = router.listen(this.handleChangeLocation);
    }

    componentDidMount() {
        const { sidebarIsOpened } = this.props;

        this.updateSidebarStatus(sidebarIsOpened);
    }

    componentDidUpdate(prevProps: SidebarLayoutProps, prevState: {}) {
        const { sidebarIsOpened } = this.props;

        if (sidebarIsOpened !== prevProps.sidebarIsOpened) {
            this.updateSidebarStatus(sidebarIsOpened);
        }
    }

    componentWillUnmount() {
        this.updateSidebarStatus(false);

        if (this.routerSubscription) {
            this.routerSubscription();
            this.routerSubscription = null;
        }
    }

    handleChangeLocation() {
        const { onCloseSidebar } = this.props;

        window.scrollTo(0, 0);

        if (window.matchMedia('(max-width: 768px)').matches) {
            onCloseSidebar();
        }
    }

    handleCloseSidebar(event: React.MouseEvent<any>) {
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

    handleInvokeCommand(commandId: keyof typeof commands) {
        const command = commands[commandId];

        if (command) {
            const { store } = this.props;

            if (!command.skipNotification) {
                store.dispatch(sendInstantNotification(command.title));
            }

            store.dispatch(command.thunk);
        }
    }

    updateSidebarStatus(sidebarIsOpened: boolean) {
        if (sidebarIsOpened) {
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.documentElement.classList.remove('sidebar-is-opened');
        }
    }

    scrollTo(x: number, y: number, callback?: () => void): void {
        const { onEndScroll, onStartScroll } = this.props;

        onStartScroll();

        smoothScrollTo(document.body, x, y, SCROLL_ANIMATION_TIME).then(() => {
            onEndScroll();

            if (callback) {
                callback();
            }
        });
    }

    render() {
        const { 
            children,
            isAuthenticating,
            keyMappings,
            location,
            router,
            sidebarIsOpened
        } = this.props;

        return (
            <KeyMapper
                mappings={keyMappings}
                onInvokeCommand={this.handleInvokeCommand}>
                <div
                    className={classnames('l-root', {
                        'is-opened': sidebarIsOpened
                    })}
                    onClick={this.handleCloseSidebar}>
                    <div className={'l-sidebar'}>
                        <Sidebar router={router} location={location} />
                    </div>
                    <div className="l-notifications">
                        <Notifications />
                    </div>
                    <div className="l-instant-notifications">
                        <InstantNotifications />
                    </div>
                    {cloneElement(children, {
                        onToggleSidebar: this.handleToggleSidebar,
                        scrollTo: this.scrollTo.bind(this)
                    })}
                    <div className="l-backdrop">
                        {isAuthenticating ? <i className="icon icon-48 icon-spinner icon-rotating" /> : null}
                    </div>
                </div>
            </KeyMapper>
        );
    }
}

export default connect((store) => ({
    mapStateToProps: (state: State) => ({
        isAuthenticating: state.credential.isLoading,
        keyMappings: state.keyMappings.items,
        sidebarIsOpened: state.ui.sidebarIsOpened,
        store
    }),
    mapDispatchToProps: bindActions({
        onOpenSidebar: openSidebar,
        onCloseSidebar: closeSidebar,
        onStartScroll: startScroll,
        onEndScroll: endScroll
    })
}))(SidebarLayout);
