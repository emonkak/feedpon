import { createComponent, html } from 'barebind';
import { authenticate } from '../../state/actions.ts';
import { AppStore } from '../../state/store.ts';

export interface AuthPageProps {}

export const AuthPage = createComponent(function AuthPage(
  _props: AuthPageProps,
) {
  const store = this.inject(AppStore);

  const handleAuthenticate = () => {
    store.dispatch(authenticate());
  };

  return html`
    <button @click=${handleAuthenticate}>
      Authenticate...
    </button>
  `;
});
