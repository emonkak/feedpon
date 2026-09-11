import { createComponent, html } from 'barebind';

export interface FaviconProps {
  class?: string;
  domain: string;
  logicalSize: number;
  phycicalSize: number;
}

export type FaviconState =
  | { status: FaviconStatus.INITIAL }
  | { status: FaviconStatus.LOADED; url: string }
  | { status: FaviconStatus.ERROR };

const enum FaviconStatus {
  INITIAL,
  LOADED,
  ERROR,
}

export const Favicon = createComponent(function Favicon({
  class: className,
  phycicalSize,
  domain,
  logicalSize,
}: FaviconProps) {
  const [state, setState] = this.useState<FaviconState>({
    status: FaviconStatus.INITIAL,
  });

  this.useEffect(() => {
    const controller = new AbortController();
    fetchFavicon(getFaviconURL(domain, phycicalSize), controller.signal).then(
      (blob) => {
        setState(
          blob !== null
            ? { status: FaviconStatus.LOADED, url: URL.createObjectURL(blob) }
            : { status: FaviconStatus.ERROR },
        );
      },
    );
    return () => {
      controller.abort();
    };
  }, [domain, phycicalSize]);

  this.useEffect(() => {
    return () => {
      if (state.status === FaviconStatus.LOADED) {
        URL.revokeObjectURL(state.url);
      }
    };
  }, [state]);

  return state.status === FaviconStatus.LOADED
    ? html`
      <img
        alt=${domain}
        height=${logicalSize}
        src=${state.url}
        width=${logicalSize}
      >
    `
    : html`
      <div
        aria-title=${domain}
        data-size=${logicalSize}
        class=${['EmojiIcon', className]}
      >
        <div class="EmojiIcon-glyph">
          ${state.status === FaviconStatus.INITIAL ? '' : '🌏︎'}
        </div>
      </div>
    `;
});

async function fetchFavicon(
  url: URL,
  signal: AbortSignal,
): Promise<Blob | null> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    return null;
  }
  const blob = await response.blob();
  return blob;
}

function getFaviconURL(domain: string, size: number): URL {
  const url = new URL('https://www.google.com/s2/favicons');
  url.searchParams.set('domain', domain);
  url.searchParams.set('sz', size.toString());
  return url;
}
