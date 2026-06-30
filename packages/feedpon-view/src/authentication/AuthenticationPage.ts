import { createComponent, html } from 'barebind';
import { AppStore } from 'feedpon-store';
import * as autoActions from 'feedpon-store/actions/auth';
import { BindActionCreators } from 'store';

export interface AuthenticationPageProps {}

export const AuthenticationPage = createComponent<AuthenticationPageProps>(
  function AuthenticationPage() {
    const { acquireCredential } = this.use(
      BindActionCreators(AppStore, autoActions),
    );

    return html`
      <div class="authentication">
        <div class="container">
          <div class="u-text-center u-margin-bottom-2">
            <a
              href="https://github.com/emonkak/feedpon"
              target="_blank"
              rel="noreferrer"
            >
              <img src="./img/logo.svg" width="244" height="88">
            </a>
          </div>
          <div class="u-text-muted u-text-center u-margin-bottom-2">
            <p class="u-text-4">
              Please choose the backend service and sign in
            </p>
          </div>
          <div class="list-group u-margin-bottom-2">
            <label class="list-group-item">
              <div class="u-flex u-flex-align-items-center">
                <input
                  class="form-check"
                  type="radio"
                  name="backend"
                  value="feedly"
                  checked
                >
                <i class="icon icon-48 icon-feedly u-margin-right-1"></i>
                <span class="u-flex-grow-1 u-text-5">Feedly</span>
              </div>
            </label>
          </div>
          <button
            type="button"
            class="button button-positive button-block button-large"
            @click=${acquireCredential}
          >
            Authenticate...
          </button>
        </div>
      </div>
    `;
  },
);
