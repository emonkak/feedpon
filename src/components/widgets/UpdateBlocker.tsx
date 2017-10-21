import React, { Component } from 'react';

interface UpdateBlockerProps {
    children: React.ReactElement<any>;
    shouldUpdate: boolean;
}

export default class UpdateBlocker extends Component<UpdateBlockerProps, {}> {
    shouldComponentUpdate(nextProps: UpdateBlockerProps) {
        return nextProps.shouldUpdate;
    }

    render() {
        const { children } = this.props;
        return children;
    }
}
