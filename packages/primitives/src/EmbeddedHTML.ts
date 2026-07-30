import { createComponent, html } from 'barebind';

// Tag list from https://html.spec.whatwg.org/
const SAFE_ELEMENTS = new Set([
  // 4.3 Sections (excluding "body")
  'article',
  'section',
  'nav',
  'aside',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'header',
  'footer',
  'address',

  // 4.4 Grouping content
  'p',
  'hr',
  'pre',
  'blockquote',
  'ol',
  'ul',
  'menu',
  'li',
  'dl',
  'dt',
  'dd',
  'figure',
  'figcaption',
  'main',
  'search',
  'div',

  // 4.5 Text-level semantics
  'a',
  'em',
  'strong',
  'small',
  's',
  'cite',
  'q',
  'dfn',
  'abbr',
  'ruby',
  'rt',
  'rp',
  'data',
  'time',
  'code',
  'var',
  'samp',
  'kbd',
  'sub',
  'sup',
  'i',
  'b',
  'u',
  'mark',
  'bdi',
  'bdo',
  'span',
  'br',
  'wbr',

  // 4.7 Edits
  'ins',
  'del',

  // 4.8 Embedded content
  'picture',
  'source',
  'img',
  'iframe',
  'embed',
  'object',
  'video',
  'audio',
  'track',
  'map',
  'area',
  'math',
  'svg',

  // 4.9 Tabular data
  'table',
  'caption',
  'colgroup',
  'col',
  'tbody',
  'thead',
  'tfoot',
  'tr',
  'td',
  'th',

  // 4.11 Interactive elements (excluding "dialog")
  'details',
  'summary',
]);

const SAFE_URL_PATTERN = /^(?:data|https?|mailto|sms|tel):/i;

const HREF_ATTRIBUTE = 'href';
const SRC_ATTRIBUTE = 'src';
const SRCSET_ATTRIBUTE = 'srcset';

const LAZY_SRC_ATTRIBUTES = ['data-lazy-src', 'data-src'];
const LAZY_SRCSET_ATTRIBUTES = ['data-lazy-srcset', 'data-srcset'];

const SRCSET_SEPARATOR_PATTERN = /\s*,\s*/;
const SRCSET_SPACES_PATTERN = /\s+/;

const STYLE_SHEET = css`
:host {
  contain: content;
  margin-block: 0 1rlh;
  margin-trim: block-end;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@supports not (margin-trim: block-end) {
  :last-child {
    margin-block-end: 0;
  }
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-size: calc(1rem * var(--scale, 1));
  line-height: round(1rlh * var(--scale, 1) - 0.125rlh, 0.25rlh);
  margin-block: 0 0.5rlh;
  text-wrap: balance;
}

h1 {
  --scale: var(--scale-1);
}

h2 {
  --scale: var(--scale-2);
}

h3 {
  --scale: var(--scale-3);
}

h4 {
  --scale: var(--scale-4);
}

h5 {
  --scale: var(--scale-6);
}

h6 {
  --scale: var(--scale-6);
}

blockquote,
dl,
figure,
ol,
p,
pre,
table,
ul {
  margin-block: 0 1rlh;
}

dd {
  margin-inline-start: 1rlh;
}

figure {
  margin-inline: 0;
}

figcaption {
  font-family: var(--font-display);
  font-style: italic;
  text-align: center;
  text-wrap: balance;
}

ol, ul {
  padding-inline-start: 1rlh;
  margin-block: 0 1rlh;
}

ul[class] {
  list-style: none;
}

p {
  hyphens: auto;
  text-align: justify;
  text-wrap: pretty;
}

a {
  text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}

a:hover {
  text-decoration-color: currentColor;
}

code, kbd, pre, samp {
  font-family: var(--font-code);
}

iframe[width][height] {
  aspect-ratio: auto attr(width type(<number>)) / attr(height type(<number>));
}

:where(iframe, img, video) {
  height: auto;
  max-width: 100%;
  vertical-align: bottom;
}

:has(> a:only-child > img:only-child),
:has(> :where(iframe, img, video):only-child) {
  width: fit-content;
  margin-inline: auto;
}
`;

export interface EmbeddedHTMLProps {
  html: string;
  origin: string;
}

export const EmbeddedHTML = createComponent<EmbeddedHTMLProps>(
  function EmbeddedHTML({ origin, html: htmlString }) {
    const containerRef = this.useRef<HTMLDivElement | null>(null);

    this.useEffect(() => {
      const { shadowRoot } = containerRef.current!;

      shadowRoot!.adoptedStyleSheets = [STYLE_SHEET];
    }, []);

    this.useEffect(() => {
      const { shadowRoot } = containerRef.current!;

      shadowRoot!.replaceChildren(parseHTML(htmlString, origin));
    }, [htmlString, origin]);

    return html`
      <div ${containerRef}>
        <template shadowrootclonable shadowrootmode="open"></template>
      </div>
    `;
  },
);

function copyAttribute(source: Element, dest: Element, name: string): void {
  if (source.hasAttribute(name)) {
    dest.setAttribute(name, source.getAttribute(name)!);
  }
}

function css(
  strings: TemplateStringsArray,
  ...values: unknown[]
): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(String.raw(strings, ...values));
  return sheet;
}

function embedSVG(el: Element): HTMLImageElement {
  const img = document.createElement('img');

  if (!el.hasAttribute('xmlns')) {
    el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  copyAttribute(el, img, 'width');
  copyAttribute(el, img, 'height');

  img.src = URL.createObjectURL(
    new Blob([el.outerHTML], { type: 'image/svg+xml' }),
  );

  return img;
}

function parseHTML(html: string, origin: string): DocumentFragment {
  const template = document.createElement('template');
  const walker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_ELEMENT,
  );

  template.setHTMLUnsafe(html);

  while (walker.nextNode() !== null) {
    const el = walker.currentNode as Element;

    if (!SAFE_ELEMENTS.has(el.localName)) {
      skipNode(walker);
      el.remove();
      continue;
    }

    sanitizeElement(el);

    switch (el.localName) {
      case 'a':
      case 'area':
        resolveHref(el, origin);
        break;

      case 'audio':
      case 'embed':
      case 'track':
      case 'video':
        resolveSrc(el, origin);
        break;

      case 'iframe':
        resolveSrc(el, origin);
        sandboxifyIframe(el);
        break;

      case 'img':
      case 'source':
        resolveSrc(el, origin);
        resolveSrcset(el, origin);
        break;

      case 'math':
        skipNode(walker);
        continue;

      case 'svg':
        skipNode(walker);
        el.replaceWith(embedSVG(el));
        continue;
    }
  }

  return template.content;
}

function resolveHref(el: Element, origin: string): void {
  if (el.hasAttribute(HREF_ATTRIBUTE)) {
    const url = toAbsoluteUrl(el.getAttribute(HREF_ATTRIBUTE)!, origin);

    if (SAFE_URL_PATTERN.test(url)) {
      el.setAttribute(HREF_ATTRIBUTE, url);
      el.setAttribute('target', '_blank');
    } else {
      el.removeAttribute(HREF_ATTRIBUTE);
    }
  }
}

function resolveSrc(el: Element, origin: string): void {
  for (const name of LAZY_SRC_ATTRIBUTES) {
    if (el.hasAttribute(name)) {
      el.setAttribute(SRC_ATTRIBUTE, el.getAttribute(name)!);
    }
  }

  if (el.hasAttribute(SRC_ATTRIBUTE)) {
    const url = toAbsoluteUrl(el.getAttribute(SRC_ATTRIBUTE)!, origin);

    if (SAFE_URL_PATTERN.test(url)) {
      el.setAttribute(SRC_ATTRIBUTE, url);
    } else {
      el.removeAttribute(SRCSET_ATTRIBUTE);
    }
  }
}

function resolveSrcset(el: Element, origin: string): void {
  for (const name of LAZY_SRCSET_ATTRIBUTES) {
    if (el.hasAttribute(name)) {
      el.setAttribute(SRCSET_ATTRIBUTE, el.getAttribute(name)!);
    }
  }

  if (el.hasAttribute(SRCSET_ATTRIBUTE)) {
    el.setAttribute(
      SRCSET_ATTRIBUTE,
      el
        .getAttribute(SRCSET_ATTRIBUTE)!
        .trim()
        .split(SRCSET_SEPARATOR_PATTERN)
        .map((component) => {
          const [url, descriptor] = component.split(SRCSET_SPACES_PATTERN, 2);
          return {
            url: toAbsoluteUrl(url!, origin),
            descriptor,
          };
        })
        .filter(({ url }) => SAFE_URL_PATTERN.test(url))
        .map(
          ({ url, descriptor }) =>
            url + (descriptor !== undefined ? ' ' + descriptor : ''),
        )
        .join(','),
    );
  }
}

function sandboxifyIframe(el: Element): void {
  el.setAttribute(
    'sandbox',
    'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts',
  );
}

function sanitizeElement(el: Element): void {
  el.removeAttribute('style');
}

function skipNode(walker: TreeWalker): Node | null {
  do {
    const nextNode = walker.nextSibling();
    if (nextNode !== null) {
      return nextNode;
    }
  } while (walker.parentNode() !== null);
  return null;
}

function toAbsoluteUrl(url: string, origin: string): string {
  try {
    return new URL(url, origin).href;
  } catch {
    return url;
  }
}
