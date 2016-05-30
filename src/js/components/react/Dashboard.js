import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

export default class Dashboard extends React.Component {
    render() {
        return (
            <div>
                <h1>Dashboard</h1>
            </div>
        );
    }
}

Object.assign(Dashboard.prototype, PureRenderMixin);
