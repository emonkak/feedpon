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
import toSwipeable, { SwipeableProps } from 'components/hoc/toSwipeable';
import { Command, Event, KeyMapping, State } from 'messaging/types';
import { Dispatcher } from 'utils/flux/types';
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
    dispatch: Dispatcher<Event>;
}

class SidebarLayout extends PureComponent<SidebarLayoutProps> {
    private _sidebarRef: HTMLElement | null = null;

    private _sidebarWidth: number = 0;

    componentDidMount() {
        const { sidebarIsOpened } = this.props;

        this._updateSidebarStatus(sidebarIsOpened);
    }

    componentDidUpdate(prevProps: SidebarLayoutProps, prevState: {}) {
        const { isSwiping, location, sidebarIsOpened } = this.props;

        if (location !== prevProps.location) {
            if (location.pathname.indexOf('/streams/') !== 0) {
                window.scrollTo(0, 0);
            }

            if (sidebarIsOpened && this._isMobileLayout()) {
                const { onCloseSidebar } = this.props;

                onCloseSidebar();
            }
        }

        if (isSwiping !== prevProps.isSwiping) {
            if (isSwiping) {
                this._notifySwipeStart();
            } else {
                const { initialX, destX } = this.props;

                this._notifySwipeEnd(initialX, destX);
            }
        }

        if (sidebarIsOpened !== prevProps.sidebarIsOpened) {
            if (sidebarIsOpened || !this._isMobileLayout()) {
                this._updateSidebarStatus(sidebarIsOpened);
            }
        }
    }

    componentWillUnmount() {
        this._updateSidebarStatus(false);
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
            visibility: 'visible' as 'visible'
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
                    {isLoading ? <i className="icon icon-48 icon-spinner animation-rotating" /> : null}
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
            const { dispatch } = this.props;

            if (!keyMapping.preventNotification) {
                dispatch(sendInstantNotification(command.name));
            }

            const params = { ...command.defaultParams, ...keyMapping.params };
            const event = command.action(params);

            dispatch(event as any);
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

export default connect(() => ({
    mapStateToProps: (state: State) => ({
        helpIsOpened: state.ui.helpIsOpened,
        isLoading: state.backend.isLoading || state.subscriptions.isImporting,
        keyMappings: state.keyMappings.items,
        sidebarIsOpened: state.ui.sidebarIsOpened
    }),
    mapDispatchToProps: (dispatch) => ({
        ...bindActions({
            onCloseHelp: closeHelp,
            onCloseSidebar: closeSidebar,
            onOpenHelp: openHelp,
            onOpenSidebar: openSidebar
        })(dispatch),
        dispatch
    })
}))(toSwipeable(SidebarLayout));
