import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
import { authenticate } from 'feedpon-messaging/backend';

export interface AuthenticationPageProps {}

export function AuthenticationPage(
  _props: AuthenticationPageProps,
  context: RenderContext,
): TemplateResult {
  const { onAuthenticate } = context.use(
    getStoreHook({
      mapDispatchToProps: bindActions({
        onAuthenticate: authenticate,
      }),
    }),
  );

  return context.html`
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
          @click=${onAuthenticate}
        >
          Authenticate...
        </button>
      </div>
    </div>
  `;
}
