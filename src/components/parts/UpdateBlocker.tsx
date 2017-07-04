import React, { PureComponent } from 'react';

interface UpdateBlockerProps {
    children: React.ReactElement<any>;
    shouldUpdate: boolean;
}

export default class UpdateBlocker extends PureComponent<UpdateBlockerProps, {}> {
    shouldComponentUpdate(nextProps: UpdateBlockerProps) {
        return nextProps.shouldUpdate;
    }

    render() {
        const { children } = this.props;
        return children;
    }
}
