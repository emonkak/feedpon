import React, { PureComponent, PropTypes } from 'react';
import { History } from 'react-router/lib/History';

type Props = {
    history: History,
};

export default class App extends PureComponent<Props, {}> {
    static propsTypes = {
        history: PropTypes.object.isRequired,
    }

    render() {
        return (
            <div>'Hello world!'</div>
        );
    }
}
