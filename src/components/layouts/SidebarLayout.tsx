import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';

import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';
import connect from 'utils/flux/react/connect';
import smoothScroll from 'utils/dom/smoothScroll';
import { State } from 'messaging/types';

interface SidebarLayoutProps {
    children: React.ReactElement<any>;
    isLoading: boolean;
    location: Location;
    router: History;
}

interface SidebarLayoutState {
    isScrolling: boolean;
    sidebarIsOpened: boolean;
}

class SidebarLayout extends PureComponent<SidebarLayoutProps, SidebarLayoutState> {
    private unsubscribe: () => void | null;

    constructor(props: SidebarLayoutProps, context: any) {
        super(props, context);

        this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
        this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
        this.handleChangeLocation = this.handleChangeLocation.bind(this);

        this.state = {
            isScrolling: false,
            sidebarIsOpened: false
        };
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

    handleChangeLocation() {
        window.scrollTo(0, 0);

        this.refreshSidebar(false);
    }

    handleToggleSidebar() {
        this.refreshSidebar(!this.state.sidebarIsOpened);
    }

    handleCloseSidebar(event: React.SyntheticEvent<any>) {
        const { sidebarIsOpened } = this.state;

        if (sidebarIsOpened && event.target === event.currentTarget){
            this.refreshSidebar(false);
        }
    }

    refreshSidebar(isOpened: boolean) {
        if (isOpened) {
            document.body.classList.add('sidebar-is-opened');
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.body.classList.remove('sidebar-is-opened');
            document.documentElement.classList.remove('sidebar-is-opened');
        }

        this.setState(state => ({
            ...state,
            sidebarIsOpened: isOpened
        }));
    }

    scrollTo(x: number, y: number): Promise<void> {
        this.setState(state => ({
            ...state,
            isScrolling: true
        }));

        return smoothScroll(document.body, x, y).then(() => {
            this.setState(state => ({
                ...state,
                isScrolling: false
            }));
        });
    }

    render() {
        const { children, isLoading, location, router } = this.props;
        const { isScrolling, sidebarIsOpened } = this.state;

        return (
            <div
                className={classnames('l-root', {
                    'is-opened': sidebarIsOpened
                })}
                onClick={this.handleCloseSidebar}>
                <div className='l-sidebar'>
                    <Sidebar router={router} location={location} />
                </div>
                <div className="l-notifications">
                    <Notifications />
                </div>
                {cloneElement(children, {
                    isScrolling,
                    onToggleSidebar: this.handleToggleSidebar,
                    scrollTo: this.scrollTo.bind(this)
                })}
                <div className="l-backdrop">
                    {isLoading ? <i className="icon icon-48 icon-spinner icon-rotating" /> : null}
                </div>
            </div>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        isLoading: state.credential.isLoading
    })
})(SidebarLayout);
