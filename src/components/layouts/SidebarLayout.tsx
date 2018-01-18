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
import toSwipeable, { SwipeableProps } from 'components/hoc/toSwipeable';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Command, KeyMapping, State, Store } from 'messaging/types';
import { closeHelp, closeSidebar, openHelp, openSidebar } from 'messaging/ui/actions';
import { sendInstantNotification } from 'messaging/instantNotifications/actions';

interface SidebarLayoutProps extends SwipeableProps {
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

            if (this._isMobileLayout()) {
                onCloseSidebar();
            }
        });
    }

    componentDidMount() {
        const { sidebarIsOpened } = this.props;

        this._updateSidebarStatus(sidebarIsOpened);
    }

    componentWillUpdate(nextProps: SidebarLayoutProps, nextState: {}) {
        const { isSwiping, sidebarIsOpened } = this.props;

        if (isSwiping !== nextProps.isSwiping) {
            if (nextProps.isSwiping) {
                this._notifySwipeStart();
            } else {
                this._notifySwipeEnd(nextProps.initialX, nextProps.destX);
            }
        }

        if (sidebarIsOpened !== nextProps.sidebarIsOpened) {
            if (nextProps.sidebarIsOpened || !this._isMobileLayout()) {
                this._updateSidebarStatus(nextProps.sidebarIsOpened);
            }
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
        const {
            children,
            helpIsOpened,
            isLoading,
            keyMappings,
            location,
            onCloseHelp,
            onCloseSidebar,
            router,
            sidebarIsOpened,
            isSwiping,
            initialX,
            destX,
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd
        } = this.props;

        const sidebarWidth = this._sidebarWidth;
        const translateX = getTranslateX(initialX, destX, sidebarWidth, sidebarIsOpened);
        const progress = Math.abs(translateX) / sidebarWidth;

        const leftStyle = isSwiping ? {
            left: sidebarIsOpened ? translateX : -sidebarWidth + translateX
        } : {};
        const paddingStyle = isSwiping ? {
            paddingLeft: sidebarIsOpened ? sidebarWidth + translateX : translateX
        } : {};
        const opacityStyle = isSwiping ? {
            opacity: sidebarIsOpened ? 1 - progress : progress,
            visibility: 'visible'
        } : {};

        return (
            <div className={classnames('l-root', { 'is-swiping': isSwiping })}>
                <div
                    className={classnames('l-sidebar', { 'is-opened': sidebarIsOpened })}
                    style={leftStyle}
                    ref={this._handleSidebarRef}
                    onTransitionEnd={this._handleTransitionEnd}>
                    <Sidebar router={router} location={location} />
                </div>
                <div className="l-main" style={paddingStyle}>
                    <div className="l-notifications">
                        <Notifications />
                    </div>
                    <div className="l-instant-notifications">
                        <InstantNotifications />
                    </div>
                    {children}
                    <div
                        className="l-overlay"
                        style={opacityStyle}
                        onClick={onCloseSidebar}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd} />
                    <div
                        className="l-swipeable-edge"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd} />
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

    private _isMobileLayout() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    private _notifySwipeStart(): void {
        this._updateSwipingStatus(true);
        this._updateSidebarWidth();
    }

    private _notifySwipeEnd(initialX: number, destX: number): void {
        const { onCloseSidebar, onOpenSidebar, sidebarIsOpened } = this.props;
        const tolerance = this._sidebarWidth / 2;

        if (sidebarIsOpened) {
            if (initialX > destX && initialX - destX > tolerance) {
                onCloseSidebar();
            }
        } else {
            if (initialX < destX && destX - initialX > tolerance) {
                onOpenSidebar();
            }
        }

        this._updateSwipingStatus(false);
    }

    private _updateSidebarStatus(sidebarIsOpened: boolean): void {
        if (sidebarIsOpened) {
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.documentElement.classList.remove('sidebar-is-opened');
        }
    }

    private _updateSwipingStatus(isSwiping: boolean): void {
        if (isSwiping) {
            document.documentElement.classList.add('sidebar-is-swiping');
        } else {
            document.documentElement.classList.remove('sidebar-is-swiping');
        }
    }

    private _updateSidebarWidth(): void {
        if (this._sidebarRef) {
            this._sidebarWidth = this._sidebarRef.getBoundingClientRect().width;
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
    }

    private _handleSidebarRef = (ref: HTMLElement | null) => {
        this._sidebarRef = ref;
    }

    private _handleTransitionEnd = (): void => {
        if (!this.props.sidebarIsOpened) {
            this._updateSidebarStatus(false);
        }
    }
}

function getTranslateX(initialX: number, destX: number, width: number, isOpened: boolean): number {
    if (isOpened) {
        return Math.min(0, Math.max(-width, destX - initialX));
    } else {
        return Math.max(0, Math.min(width, destX - initialX));
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
}))(toSwipeable(SidebarLayout));
