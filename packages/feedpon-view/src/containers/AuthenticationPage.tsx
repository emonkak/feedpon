import React from 'react';

import connect from 'feedpon-flux/react/connect';
import useEvent from '../hooks/useEvent';
import { authenticate } from 'feedpon-messaging/backend';
import { bindActions } from 'feedpon-flux';

interface AuthenticationPageProps {
  onAuthenticate: typeof authenticate;
}

function AuthenticationPage({ onAuthenticate }: AuthenticationPageProps) {
  const handleAuthenticate = useEvent(() => {
    onAuthenticate();
  });

  return (
    <div className="authentication">
      <div className="container">
        <div className="u-text-center u-margin-bottom-2">
          <a href="https://github.com/emonkak/feedpon" target="_blank">
            <img src="./img/logo.svg" width="244" height="88" />
          </a>
        </div>
        <div className="u-text-muted u-text-center u-margin-bottom-2">
          <p className="u-text-4">
            Please choose the backend service and sign in
          </p>
        </div>
        <div className="list-group u-margin-bottom-2">
          <label className="list-group-item">
            <div className="u-flex u-flex-align-items-center">
              <input
                className="form-check"
                type="radio"
                name="backend"
                value="feedly"
                defaultChecked
              />
              <i className="icon icon-48 icon-feedly u-margin-right-1" />
              <span className="u-flex-grow-1 u-text-5">Feedly</span>
            </div>
          </label>
        </div>
        <button
          className="button button-positive button-block button-large"
          onClick={handleAuthenticate}
        >
          Authenticate...
        </button>
      </div>
    </div>
  );
}

export default connect({
  mapDispatchToProps: bindActions({
    onAuthenticate: authenticate,
  }),
})(AuthenticationPage);
