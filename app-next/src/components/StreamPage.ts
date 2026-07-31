import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';

export interface StreamPageProps {
  stream: Stream;
}

export const StreamPage = createComponent<StreamPageProps>(
  function StreamPage() {
    return html`
      <div>Hello, Feedpon!</div>
    `;
  },
);
