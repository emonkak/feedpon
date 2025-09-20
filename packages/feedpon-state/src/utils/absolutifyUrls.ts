const SRCSET_SEPARATOR_PATTERN = /\s*,\s*/;
const SRCSET_SPACES_PATTERN = /\s+/;

type HTMLElementConstraint<TCondition> = {
  [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends TCondition
    ? HTMLElementTagNameMap[K]
    : never;
}[keyof HTMLElementTagNameMap];

type HTMLElementHavingHref = HTMLElementConstraint<{
  href: string;
  referrerPolicy: string;
}>;
type HTMLElementHavingSrc = HTMLElementConstraint<{ src: string }>;
type HTMLElementHavingSrcset = HTMLElementConstraint<{ srcset: string }>;

interface ImageCandidate {
  url: string;
  descriptor: string | undefined;
}

export function absolutifyUrls(document: Document, baseUrl: string) {
  for (const el of document.querySelectorAll('base')) {
    el.remove();
  }

  for (const el of document.querySelectorAll(
    'a, area, link',
  ) as NodeListOf<HTMLElementHavingHref>) {
    if (el.hasAttribute('href')) {
      el.href = new URL(el.href, baseUrl).href;
    }
    el.target = '_blank';
    el.referrerPolicy = 'no-referrer';
  }

  for (const el of document.querySelectorAll(
    'audio, embed, iframe, input, script, source, track, video',
  ) as NodeListOf<HTMLElementHavingSrc>) {
    if (el.hasAttribute('src')) {
      el.src = new URL(el.src, baseUrl).href;
    }
  }

  for (const el of document.querySelectorAll(
    'img, source',
  ) as NodeListOf<HTMLElementHavingSrcset>) {
    if (el.hasAttribute('src')) {
      el.src = new URL(el.src, baseUrl).href;
    }

    if (el.hasAttribute('srcset')) {
      el.srcset = parseSrcset(el.srcset)
        .map(
          ({ url, descriptor }) =>
            new URL(url, baseUrl).href + ' ' + descriptor,
        )
        .join(',');
    }
  }

  document.head.appendChild(createBaseElement(baseUrl));
}

function createBaseElement(baseUrl: string) {
  const el = document.createElement('base');
  el.href = baseUrl;
  return el;
}

function parseSrcset(input: string): ImageCandidate[] {
  return input
    .trim()
    .split(SRCSET_SEPARATOR_PATTERN)
    .map((component) => {
      const [url, descriptor] = component.split(SRCSET_SPACES_PATTERN, 2);
      return { url, descriptor } as ImageCandidate;
    });
}
