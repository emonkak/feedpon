import React, { PropTypes, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { locationShape, routerShape } from 'react-router/lib/PropTypes';

import AutoHidingHeader from 'components/parts/AutoHidingHeader';
import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';
import smoothScroll from 'utils/dom/smoothScroll';

export default class Layout extends PureComponent<any, any> {
    static propTypes = {
        content: PropTypes.element.isRequired,
        navbar: PropTypes.element.isRequired,
        location: locationShape,
        router: routerShape,
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isScrolling: false,
            sidebarIsOpened: false
        };

        this.handleChangeLocation = this.handleChangeLocation.bind(this);
    }

    componentWillMount() {
        const { router } = this.props;

        router.listen(this.handleChangeLocation);
    }

    componentWillUnmount() {
        const { router } = this.props;

        router.unregisterTransitionHook(this.handleChangeLocation);
    }

    handleChangeLocation() {
        window.scrollTo(0, 0);

        this.refreshSidebar(false);
    }

    handleToggleSidebar() {
        this.refreshSidebar(!this.state.sidebarIsOpened);
    }

    handleCloseSidebar(event: React.SyntheticEvent<any>) {
        if (event.target === event.currentTarget){
            this.refreshSidebar(false);
        }
    }

    refreshSidebar(isOpened: boolean) {
        if (isOpened) {
            document.body.classList.add('sidebar-is-opened');
        } else {
            document.body.classList.remove('sidebar-is-opened');
        }

        this.setState(state => ({
            ...state,
            sidebarIsOpened: isOpened
        }));
    }

    scrollTo(x, y) {
        this.setState(state => ({
            ...state,
            isScrolling: true
        }));

        smoothScroll(document.body, x, y).then(() => {
            this.setState(state => ({
                ...state,
                isScrolling: false
            }));
        });
    }

    render() {
        const { content, navbar, location } = this.props;
        const { isScrolling, sidebarIsOpened } = this.state;

        const rootClassName = classnames('l-root', {
            'is-opened': sidebarIsOpened,
        });

        return (
            <div className={rootClassName} onClick={this.handleCloseSidebar.bind(this)}>
                <div className='l-sidebar'>
                    <Sidebar selectedValue={location.pathname} />
                </div>
                <div className="l-main">
                    <AutoHidingHeader
                        pinned={!isScrolling}
                        className="l-main-header">
                        {cloneElement(navbar, { onToggleSidebar: this.handleToggleSidebar.bind(this) })}
                        <Notifications />
                    </AutoHidingHeader>
                    <div className="l-main-content">
                        {cloneElement(content, { isScrolling, scrollTo: this.scrollTo.bind(this) })}
                    </div>
                </div>
            </div>
        );
    }
}
