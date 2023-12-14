import type { Backend, Event } from '../index';

export default function reduceBackend(backend: Backend, event: Event): Backend {
  switch (event.type) {
    case 'APPLICATION_INITIALIZED':
      return {
        ...backend,
        isLoading: false,
      };

    case 'BACKEND_AUTHENTICATING':
      return {
        ...backend,
        isLoading: true,
      };

    case 'BACKEND_AUTHENTICATING_FAILED':
      return {
        ...backend,
        isLoading: false,
      };

    case 'BACKEND_AUTHENTICATED':
      return {
        ...backend,
        authenticatedAt: event.authenticatedAt,
        exportUrl: event.exportUrl,
        isLoading: false,
        token: event.token,
      };

    case 'TOKEN_REVOKING':
      return {
        ...backend,
        isLoading: true,
      };

    case 'TOKEN_REVOKED':
      return {
        ...backend,
        authenticatedAt: 0,
        isLoading: false,
        token: null,
      };

    default:
      return backend;
  }
}
