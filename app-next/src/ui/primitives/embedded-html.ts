import { createComponent, html } from 'barebind';
import styleSheetContent from '../global-styles/reset.css' with {
  type: 'text',
};

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

const SAFE_URL_SCHEMA_PATTERN = /^(?:data|https?|mailto|sms|tel):/i;

const URL_PATTERN = String.raw`\S+`;
const WIDTH_DESCRIPTOR_PATTERN = String.raw`\d+w`;
const PIXEL_DENSOTY_DESCRIPTOR_PATTERN = String.raw`-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?x`;
const SRCSET_PATTERN = new RegExp(
  String.raw`(?<url>${URL_PATTERN})(?:\s+(?<descriptor>${WIDTH_DESCRIPTOR_PATTERN}|${PIXEL_DENSOTY_DESCRIPTOR_PATTERN}))?\s*,?`,
  'g',
);

const STYLE_SHEET = createStyleSheet(styleSheetContent);

export interface EmbeddedHTMLProps {
  html: string;
  origin: string;
}

export const EmbeddedHTML = createComponent(function EmbeddedHTML({
  origin,
  html: htmlString,
}: EmbeddedHTMLProps) {
  const containerRef = this.useRef<HTMLDivElement | null>(null);

  this.useEffect(() => {
    const shadowRoot = containerRef.current!.attachShadow({ mode: 'open' });
    shadowRoot!.adoptedStyleSheets = [STYLE_SHEET];
  }, []);

  this.useEffect(() => {
    const fragment = parseHTML(htmlString);
    preprocessHTML(fragment, origin);
    containerRef.current!.shadowRoot!.replaceChildren(fragment);
  }, [htmlString, origin]);

  return html`
    <div class="EmbeddedHTML" ${containerRef}></div>
  `;
});

function copyAttribute(source: Element, dest: Element, name: string): void {
  if (source.hasAttribute(name)) {
    dest.setAttribute(name, source.getAttribute(name)!);
  }
}

function createStyleSheet(content: string): CSSStyleSheet {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(content);
  return styleSheet;
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

function parseImageCandidates(
  srcset: string,
): { url: string; descriptor: string | undefined }[] {
  return srcset
    .matchAll(SRCSET_PATTERN)
    .map((matches) => ({
      url: matches.groups!['url']!,
      descriptor: matches.groups!['descriptor'],
    }))
    .toArray();
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

    if (SAFE_URL_SCHEMA_PATTERN.test(url)) {
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

    if (SAFE_URL_SCHEMA_PATTERN.test(url)) {
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
      parseImageCandidates(el.getAttribute(ATTRIBUTE_SRCSET)!)
        .map(
          ({ url, descriptor }) =>
            toAbsoluteUrl(url, origin) +
            (descriptor !== undefined ? ' ' + descriptor : ''),
        )
        .filter((candidate) => SAFE_URL_SCHEMA_PATTERN.test(candidate))
        .join(','),
    );
  }
}

function sandboxifyIframe(el: Element): void {
  el.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
}

function sanitizeElement(el: Element): void {
  for (const name of el.getAttributeNames()) {
    switch (name) {
      case 'command':
      case 'commandfor':
      case 'popover':
      case 'popovertarget':
      case 'style':
        el.removeAttribute(name);
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
