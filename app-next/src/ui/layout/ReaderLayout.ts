import { html, type VElement } from 'barebind';
import type { AsyncResource } from '../hooks/AsyncResource.ts';

export interface ReaderLayoutProps {
  page: AsyncResource<VElement | undefined>;
  sidebar: VElement;
}

export function ReaderLayout({ page, sidebar }: ReaderLayoutProps) {
  return html`
    <div class="ReaderLayout">
      <aside class="ReaderLayout-Sidebar">
        <${sidebar}>
      </aside>
      <main
        class="ReaderLayout-Page"
        inert=${page.state === 'pending'}
      >
        <${page.value}>
      </main>
    </div>
  `;
}
