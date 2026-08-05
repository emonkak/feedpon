import type { Subscription } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';

export interface SidebarProps {
  subscriptions: Subscription[];
}

export const Sidebar = createComponent(function Sidebar({
  subscriptions,
}: SidebarProps) {
  const items = subscriptions.map(
    (subscription) => html`
      <li class="Sidebar-item">
        <a href=${`#/streams/${encodeURIComponent(subscription.id)}`}>${subscription.title}</a>
      </li>
    `,
  );
  return html`
    <nav class="Sidebar">
      <ul class="Sidebar-group">
        <${items}>
      </ul>
    </nav>
  `;
});
