import type { Subscription } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';

export interface IndexPageProps {
  subscriptions: Subscription[];
}

export const IndexPage = createComponent(function IndexPage({
  subscriptions,
}: IndexPageProps) {
  const items = subscriptions.map(
    (subscription) => html`
      <li>
        <a href=${`#/streams/${encodeURIComponent(subscription.id)}`}>${subscription.title}</a>
      </li>
    `,
  );
  return html`
    <ul>
      <${items}>
    </ul>
  `;
});
