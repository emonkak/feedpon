import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { History } from 'history';
import { Router } from 'react-router';

import Routes from './Routes';
import StoreContext from 'feedpon-flux/react/StoreContext';
import { Store } from 'feedpon-flux';

interface BootstrapProps {
  preparingStore: Promise<Store<unknown, unknown>>;
  history: History;
}

export default function Bootstrap({ preparingStore, history }: BootstrapProps) {
  const [store, setStore] = useState<Store<unknown, unknown> | null>(null);
  const [error, setError] = useState<NonNullable<unknown> | null>(null);

  useEffect(() => {
    preparingStore.then(
      (store) => {
        setStore(store);
      },
      (error) => {
        console.error(error);
        setError(error);
      },
    );
  }, []);

  if (store !== null) {
    return (
      <StoreContext.Provider value={store}>
        <Router history={history}>
          <Routes history={history} />
        </Router>
      </StoreContext.Provider>
    );
  } else {
    return (
      <div className="l-boot">
        <img
          className={classnames('u-margin-bottom-1', {
            'animation-blinking': !error,
          })}
          src="./img/logo.svg"
          width="244"
          height="88"
        />
        {error !== null && (
          <div className="u-text-negative u-text-center">
            <p className="u-text-4">{error.toString()}</p>
          </div>
        )}
      </div>
    );
  }
}
