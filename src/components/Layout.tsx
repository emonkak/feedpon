import * as React from 'react';
import * as classnames from 'classnames';
import { locationShape, routerShape } from 'react-router/lib/PropTypes';

import AutoHidingHeader from 'components/parts/AutoHidingHeader';
import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';

export default class Layout extends React.PureComponent<any, any> {
    static propTypes = {
        content: React.PropTypes.element.isRequired,
        navbar: React.PropTypes.element.isRequired,
        location: locationShape,
        router: routerShape,
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            sidebarIsOpened: false,
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
        this.setState(state => ({
            ...state,
            sidebarIsOpened: false,
        }));
    }

    handleToggleSidebar() {
        this.setState(state => ({
            ...state,
            sidebarIsOpened: !state.sidebarIsOpened,
        }));
    }

    handleCloseSidebar(event: React.MouseEvent<any>) {
        if (event.target === event.currentTarget){
            this.setState(state => ({
                ...state,
                sidebarIsOpened: false,
            }));
        }
    }

    render() {
        const { content, navbar, location } = this.props;
        const { sidebarIsOpened } = this.state;

        const rootClassName = classnames('l-root', {
            'is-opened': sidebarIsOpened,
        });

        return (
            <div className={rootClassName} onClick={this.handleCloseSidebar.bind(this)}>
                <div className='l-sidebar'>
                    <Sidebar selectedValue={location.pathname} />
                </div>
                <div className="l-main">
                    <AutoHidingHeader className="l-main-header">
                        {React.cloneElement(navbar, { onToggleSidebar: this.handleToggleSidebar.bind(this) })}
                        <Notifications />
                    </AutoHidingHeader>
                    <div className="l-main-content">
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}
