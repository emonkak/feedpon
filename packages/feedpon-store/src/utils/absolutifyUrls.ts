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
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    el.remove();
  }

  for (const el of document.querySelectorAll(
    'a, area, link',
  ) as NodeListOf<HTMLElementHavingHref>) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    if (el.hasAttribute('href')) {
      el.href = toAbsoluteUrl(el.href, baseUrl);
    }
    el.target = '_blank';
    el.referrerPolicy = 'no-referrer';
  }

  for (const el of document.querySelectorAll(
    'audio, embed, iframe, input, script, source, track, video',
  ) as NodeListOf<HTMLElementHavingSrc>) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    if (el.hasAttribute('src')) {
      el.src = toAbsoluteUrl(el.src, baseUrl);
    }
  }

  for (const el of document.querySelectorAll(
    'img, source',
  ) as NodeListOf<HTMLElementHavingSrcset>) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    if (el.hasAttribute('src')) {
      el.src = toAbsoluteUrl(el.src, baseUrl);
    }
    if (el.hasAttribute('srcset')) {
      el.srcset = parseSrcset(el.srcset)
        .map(
          ({ url, descriptor }) =>
            toAbsoluteUrl(url, baseUrl) + ' ' + descriptor,
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

function toAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
