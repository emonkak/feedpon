import { createComponent, html } from 'barebind';

const ATTRIBUTE_HREF = 'href';
const ATTRIBUTE_SRC = 'src';
const ATTRIBUTE_SRCSET = 'srcset';

const LAZY_SRC_ATTRIBUTES = ['data-lazy-src', 'data-src'];
const LAZY_SRCSET_ATTRIBUTES = ['data-lazy-srcset', 'data-srcset'];

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

const SRCSET_SEPARATOR_PATTERN = /\s*,\s*/;
const SRCSET_SPACES_PATTERN = /\s+/;

const STYLE_SHEET = css`
:host {
  contain: content;
  overflow-wrap: anywhere;
  word-break: break-word;
}

:heading {
  font-family: var(--font-display);
  font-size: calc(1rem * var(--heading-scale, 1));
  line-height: round(1rlh * var(--text-scale, 1) - 0.125rlh, 0.25rlh);
  margin-block: 0 0.5rlh;
  text-wrap: balance;
}

h1 {
  --heading-scale: var(--scale-1);
}

h2 {
  --heading-scale: var(--scale-2);
}

h3 {
  --heading-scale: var(--scale-3);
}

h4 {
  --heading-scale: var(--scale-4);
}

h5 {
  --heading-scale: var(--scale-5);
}

h6 {
  --heading-scale: var(--scale-6);
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
  additionalAttributes?: Record<string, string>;
}

export const EmbeddedHTML = createComponent<EmbeddedHTMLProps>(
  function EmbeddedHTML({
    additionalAttributes = {},
    origin,
    html: htmlString,
  }) {
    const containerRef = this.useRef<HTMLDivElement | null>(null);

    this.useEffect(() => {
      const { shadowRoot } = containerRef.current!;
      shadowRoot!.adoptedStyleSheets = [STYLE_SHEET];
    }, []);

    this.useEffect(() => {
      const { shadowRoot } = containerRef.current!;
      const fragment = parseHTML(htmlString);
      preprocessHTML(fragment, origin);
      shadowRoot!.replaceChildren(fragment);
    }, [htmlString, origin]);

    this.useEffect(() => {
      const el = containerRef.current!;
      for (const name of Object.keys(additionalAttributes)) {
        el.setAttribute(name, additionalAttributes[name]!);
      }
      return () => {
        for (const name of Object.keys(additionalAttributes)) {
          el.removeAttribute(name);
        }
      };
    }, [additionalAttributes]);

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

function parseHTML(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.setHTMLUnsafe(html);
  return template.content;
}

function preprocessHTML(root: DocumentFragment, origin: string): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

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
        preprocessMathML(el);
        break;

      case 'svg':
        skipNode(walker);
        el.replaceWith(embedSVG(el));
        break;
    }
  }
}

function preprocessMathML(root: Element): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

  while (walker.nextNode() !== null) {
    const el = walker.currentNode as Element;
    if (el.namespaceURI !== root.namespaceURI) {
      skipNode(walker);
      el.remove();
    } else {
      sanitizeElement(el);
    }
  }
}

function resolveHref(el: Element, origin: string): void {
  if (el.hasAttribute(ATTRIBUTE_HREF)) {
    const url = toAbsoluteUrl(el.getAttribute(ATTRIBUTE_HREF)!, origin);

    if (SAFE_URL_PATTERN.test(url)) {
      el.setAttribute(ATTRIBUTE_HREF, url);
      el.setAttribute('target', '_blank');
    } else {
      el.removeAttribute(ATTRIBUTE_HREF);
    }
  }
}

function resolveSrc(el: Element, origin: string): void {
  for (const name of LAZY_SRC_ATTRIBUTES) {
    if (el.hasAttribute(name)) {
      el.setAttribute(ATTRIBUTE_SRC, el.getAttribute(name)!);
    }
  }

  if (el.hasAttribute(ATTRIBUTE_SRC)) {
    const url = toAbsoluteUrl(el.getAttribute(ATTRIBUTE_SRC)!, origin);

    if (SAFE_URL_PATTERN.test(url)) {
      el.setAttribute(ATTRIBUTE_SRC, url);
    } else {
      el.removeAttribute(ATTRIBUTE_SRCSET);
    }
  }
}

function resolveSrcset(el: Element, origin: string): void {
  for (const name of LAZY_SRCSET_ATTRIBUTES) {
    if (el.hasAttribute(name)) {
      el.setAttribute(ATTRIBUTE_SRCSET, el.getAttribute(name)!);
    }
  }

  if (el.hasAttribute(ATTRIBUTE_SRCSET)) {
    el.setAttribute(
      ATTRIBUTE_SRCSET,
      el
        .getAttribute(ATTRIBUTE_SRCSET)!
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
  for (const name of el.getAttributeNames()) {
    switch (name) {
      case 'style':
        el.removeAttribute('style');
        break;
      default:
        if (name.startsWith('on') && typeof (el as any)[name] === 'function') {
          el.removeAttribute(name);
        }
    }
  }
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
