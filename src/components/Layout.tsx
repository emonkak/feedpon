import * as React from 'react';
import * as classnames from 'classnames';
import { locationShape, routerShape } from 'react-router/lib/PropTypes';

import AutoHidingHeader from 'components/parts/AutoHidingHeader';
import FeedNavbar from 'components/FeedNavbar';
import Sidebar from 'components/Sidebar';

export default class Layout extends React.PureComponent<any, any> {
    static propTypes = {
        main: React.PropTypes.node.isRequired,
        navbar: React.PropTypes.node,
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
        const { main, location } = this.props;
        const { sidebarIsOpened } = this.state;

        const containerClassName = classnames('l-container', {
            'is-opened': sidebarIsOpened,
        });

        return (
            <div className={containerClassName} onClick={this.handleCloseSidebar.bind(this)} ref="">
                <div className='l-sidebar'>
                    <Sidebar activeKey={location.pathname} />
                </div>
                <div className="l-main">
                    <AutoHidingHeader className="l-header">
                        <FeedNavbar onToggleSidebar={this.handleToggleSidebar.bind(this)} />
                    </AutoHidingHeader>
                    {main}
                </div>
            </div>
        );
    }
}
