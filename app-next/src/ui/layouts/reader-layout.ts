import { html, type VElement } from 'barebind';
import type { AsyncResource } from '../hooks/async-resource.ts';

export interface ReaderLayoutProps {
  page: AsyncResource<VElement | undefined>;
  isPending: boolean;
  sidenav: VElement;
  sidetoc: VElement;
}

export function ReaderLayout({
  isPending,
  page,
  sidenav,
  sidetoc,
}: ReaderLayoutProps) {
  return html`
    <div class="ReaderLayout">
      <main
        class="ReaderLayout-Main"
        inert=${page.state === 'pending' || isPending}
      >
        <${page.value}>
      </main>
      <nav class="ReaderLayout-Sidenav">
        <${sidenav}>
      </nav>
      <aside class="ReaderLayout-Sidetoc">
        <${sidetoc}>
      </aside>
    </div>
  `;
}
