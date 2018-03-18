import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History } from 'history';
import { Router } from 'react-router';

import StoreProvider from 'utils/flux/react/StoreProvider';
import routes from 'components/routes';
import { Store } from 'utils/flux/types';

interface BootstrapProps {
    preparingStore: Promise<Store<any, any>>;
    router: History;
}

interface BootstrapState {
    store: Store<any, any> | null;
    error: string | null;
}

export default class Bootstrap extends PureComponent<BootstrapProps, BootstrapState> {
    constructor(props: BootstrapProps, context: any) {
        super(props, context);

        this.state = {
            store: null,
            error: null
        };
    }

    componentDidMount() {
        const { preparingStore } = this.props;

        preparingStore.then(
            (store) => {
                this.setState({ store });
            },
            (error) => {
                console.error(error);

                this.setState({ error: String(error) });
            }
        );
    }

    render() {
        const { router } = this.props;
        const { store, error } = this.state;

        if (store) {
            return (
                <StoreProvider store={store}>
                    <Router history={router}>
                        {routes}
                    </Router>
                </StoreProvider>
            );
        } else {
            return (
                <div className="l-boot">
                    <img className={classnames('u-margin-bottom-1', {
                        'animation-blinking': !error
                    })} src="./img/logo.svg" width="244" height="88" />
                    {error &&
                        <div className="u-text-negative u-text-center">
                            <p className="u-text-x-large">{error}</p>
                        </div>}
                </div>
            );
        }
    }
}
