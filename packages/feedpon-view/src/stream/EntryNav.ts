import type { RenderContext } from 'barebind';

interface EntryNavProps {
  fullContentsIsLoading: boolean;
  fullContentsIsShown: boolean;
  isPinned: boolean;
  isPinning: boolean;
  onToggleFullContent: (event: Event) => void;
  onTogglePin: (event: Event) => void;
  url: string;
}

export function EntryNav(
  {
    fullContentsIsLoading,
    fullContentsIsShown,
    isPinned,
    isPinning,
    onToggleFullContent,
    onTogglePin,
  }: EntryNavProps,
  context: RenderContext,
): unknown {
  return context.html`
    <nav class="entry-nav">
      <div class="button-toolbar">
        <button
          type="button"
          class=${[
            'button',
            'button-pill',
            isPinned ? 'button-default' : 'button-outline-default',
          ].join(' ')}
          title="Pin"
          @click=${onTogglePin}
          disabled=${isPinning}
        >
          <i
            class=${[
              'icon',
              'icon-20',
              isPinning ? 'icon-spinner animation-rotating' : 'icon-pin-3',
            ].join(' ')}
          ></i>
        </button>
        <button
          type="button"
          class=${[
            'button',
            'button-pill',
            fullContentsIsShown ? 'button-default' : 'button-outline-default',
          ].join(' ')}
          title="Fetch full content"
          @click=${onToggleFullContent}
          disabled=${fullContentsIsLoading}
        >
          <i
            class=${[
              'icon',
              'icon-20',
              fullContentsIsLoading
                ? 'icon-spinner animation-rotating'
                : 'icon-page-overview',
            ].join(' ')}
          ></i>
        </button>
      </div>
    </nav>
  `;
}
