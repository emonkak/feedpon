import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';

import * as Trie from 'utils/containers/Trie';
import * as commandTable from 'messaging/keyMappings/commandTable';
import InstantNotifications from 'components/InstantNotifications';
import KeyMapper from 'components/widgets/KeyMapper';
import KeyMappingsTable from 'components/parts/KeyMappingsTable';
import Modal from 'components/widgets/Modal';
import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Command, KeyMapping, State, Store } from 'messaging/types';
import { closeHelp, closeSidebar, openHelp, openSidebar } from 'messaging/ui/actions';
import { sendInstantNotification } from 'messaging/instantNotifications/actions';

interface SidebarLayoutProps {
    children: React.ReactElement<any>;
    helpIsOpened: boolean;
    isLoading: boolean;
    keyMappings: Trie.Trie<KeyMapping>;
    location: Location;
    onCloseHelp: typeof closeHelp;
    onCloseSidebar: typeof closeSidebar;
    onOpenHelp: typeof openHelp;
    onOpenSidebar: typeof openSidebar;
    router: History;
    sidebarIsOpened: boolean;
    store: Store;
}

class SidebarLayout extends PureComponent<SidebarLayoutProps, {}> {
    private routerSubscription: (() => void) | null = null;

    constructor(props: SidebarLayoutProps, context: any) {
        super(props, context);

        this.handleChangeLocation = this.handleChangeLocation.bind(this);
        this.handleInvokeKeyMapping = this.handleInvokeKeyMapping.bind(this);
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

    handleInvokeKeyMapping(keyMapping: KeyMapping) {
        const command = (commandTable as { [key: string]: Command<any> })[keyMapping.commandId];

        if (command) {
            const { store } = this.props;

            if (!keyMapping.preventNotification) {
                store.dispatch(sendInstantNotification(command.name));
            }

            const params = { ...command.defaultParams, ...keyMapping.params };
            const event = command.action(params);

            store.dispatch(event as any);
        }
    }

    updateSidebarStatus(sidebarIsOpened: boolean) {
        if (sidebarIsOpened) {
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.documentElement.classList.remove('sidebar-is-opened');
        }
    }

    render() {
        const {
            children,
            helpIsOpened,
            isLoading,
            keyMappings,
            location,
            onCloseHelp,
            onCloseSidebar,
            router,
            sidebarIsOpened
        } = this.props;

        return (
            <>
                <div className={classnames('l-sidebar', { 'is-opened': sidebarIsOpened })}>
                    <Sidebar router={router} location={location} />
                </div>
                <div className="l-main">
                    <div className="l-notifications">
                        <Notifications />
                    </div>
                    <div className="l-instant-notifications">
                        <InstantNotifications />
                    </div>
                    {children}
                    <div className="l-overlay" onClick={onCloseSidebar} />
                </div>
                <div className="l-backdrop">
                    {isLoading ? <i className="icon icon-48 icon-spinner a-rotating" /> : null}
                </div>
                <Modal
                    onClose={onCloseHelp}
                    isOpened={helpIsOpened}>
                    <KeyMappingsTable
                        commandTable={commandTable as any}
                        keyMappings={keyMappings} />
                </Modal>
                <KeyMapper
                    keyMappings={keyMappings}
                    onInvokeKeyMapping={this.handleInvokeKeyMapping} />
            </>
        );
    }
}

export default connect((store) => ({
    mapStateToProps: (state: State) => ({
        helpIsOpened: state.ui.helpIsOpened,
        isLoading: state.backend.isLoading || state.subscriptions.isImporting,
        keyMappings: state.keyMappings.items,
        sidebarIsOpened: state.ui.sidebarIsOpened,
        store
    }),
    mapDispatchToProps: bindActions({
        onCloseHelp: closeHelp,
        onCloseSidebar: closeSidebar,
        onOpenHelp: openHelp,
        onOpenSidebar: openSidebar
    })
}))(SidebarLayout);
