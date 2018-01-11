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
import Swipeable, { SwipableRenderProps, Swipe } from 'components/widgets/Swipeable';
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
    private _unlistenRouter: (() => void) | null = null;

    private _sidebarRef: HTMLElement | null = null;

    private _sidebarWidth: number = 0;

    componentWillMount() {
        const { router } = this.props;

        this._unlistenRouter = router.listen(() => {
            const { onCloseSidebar } = this.props;

            window.scrollTo(0, 0);

            if (window.matchMedia('(max-width: 768px)').matches) {
                onCloseSidebar();
            }
        });
    }

    componentDidMount() {
        const { sidebarIsOpened } = this.props;

        this._updateSidebarStatus(sidebarIsOpened);
    }

    componentDidUpdate(prevProps: SidebarLayoutProps, prevState: {}) {
        const { sidebarIsOpened } = this.props;

        if (sidebarIsOpened !== prevProps.sidebarIsOpened) {
            this._updateSidebarStatus(sidebarIsOpened);
        }
    }

    componentWillUnmount() {
        this._updateSidebarStatus(false);

        if (this._unlistenRouter) {
            this._unlistenRouter();
            this._unlistenRouter = null;
        }
    }

    render() {
        return (
            <Swipeable
                onSwipeStart={this._handleSwipeStart}
                onSwipeEnd={this._handleSwipeEnd}
                render={this._renderSwipableContent.bind(this)} />
        );
    }

    private _renderSwipableContent(props: SwipableRenderProps) {
        const {
            swiping,
            initialX,
            x,
            onTouchStart,
            onTouchMove,
            onTouchEnd,
        } = props;
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

        const sidebarWidth = this._sidebarWidth;
        const translateX = getTranslateX(initialX, x, sidebarWidth, sidebarIsOpened);
        const progress = Math.abs(translateX) / sidebarWidth;

        const leftStyle = swiping ? {
            left: sidebarIsOpened ? translateX : -sidebarWidth + translateX
        } : {};
        const paddingStyle = swiping ? {
            paddingLeft: sidebarIsOpened ? sidebarWidth + translateX : translateX
        } : {};
        const opacityStyle = swiping ? {
            opacity: sidebarIsOpened ? 1 - progress : progress,
            visibility: 'visible'
        } : {};

        return (
            <div className={classnames('l-root', { 'is-swiping': swiping })}>
                <div
                    className={classnames('l-sidebar', { 'is-opened': sidebarIsOpened })}
                    style={leftStyle}
                    ref={this._handleSidebarRef}>
                    <Sidebar router={router} location={location} />
                </div>
                <div className="l-notifications" style={paddingStyle}>
                    <Notifications />
                </div>
                <div className="l-instant-notifications" style={paddingStyle}>
                    <InstantNotifications />
                </div>
                <div className="l-main" style={paddingStyle}>
                    {children}
                    <div
                        className="l-overlay"
                        style={opacityStyle}
                        onClick={onCloseSidebar}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd} />
                    <div
                        className="l-swipeable-edge"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd} />
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
                    onInvokeKeyMapping={this._handleInvokeKeyMapping} />
            </div>
        );
    }

    private _updateSidebarStatus(sidebarIsOpened: boolean) {
        if (sidebarIsOpened) {
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.documentElement.classList.remove('sidebar-is-opened');
        }
    }

    private _updateSwipingStatus(sidebarIsSwping: boolean) {
        if (sidebarIsSwping) {
            document.documentElement.classList.add('sidebar-is-swiping');
        } else {
            document.documentElement.classList.remove('sidebar-is-swiping');
        }
    }

    private _handleInvokeKeyMapping = (keyMapping: KeyMapping) => {
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
    };

    private _handleSwipeStart = (): void => {
        this._updateSwipingStatus(true);

        this._sidebarWidth = this._sidebarRef ? this._sidebarRef.getBoundingClientRect().width : 0;
    };

    private _handleSwipeEnd = ({ initialX, x }: Swipe): void => {
        const { onCloseSidebar, onOpenSidebar, sidebarIsOpened } = this.props;
        const tolerance = this._sidebarWidth / 2;

        if (sidebarIsOpened) {
            if (initialX > x && initialX - x > tolerance) {
                onCloseSidebar();
            }
        } else {
            if (initialX < x && x - initialX > tolerance) {
                onOpenSidebar();
            }
        }

        this._updateSwipingStatus(false);
    };

    private _handleSidebarRef = (ref: HTMLElement | null) => {
        this._sidebarRef = ref;
    }
}

function getTranslateX(initialX: number, x: number, width: number, isOpened: boolean): number {
    if (isOpened) {
        return Math.min(0, Math.max(-width, x - initialX));
    } else {
        return Math.max(0, Math.min(width, x - initialX));
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
