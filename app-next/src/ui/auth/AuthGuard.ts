import { createComponent } from 'barebind';
import type { AppStore } from '../../state/store.ts';
import { AuthPage } from './AuthPage.ts';

export interface AuthGuardProps {
  children: unknown;
  store: AppStore;
}

export const AuthGuard = createComponent(function AuthGuard({
  children,
  store,
}: AuthGuardProps) {
  const isAuthenticated = this.use(
    store.state$.get('credential').map((credential) => credential !== null),
  );
  return isAuthenticated ? children : AuthPage({});
});
