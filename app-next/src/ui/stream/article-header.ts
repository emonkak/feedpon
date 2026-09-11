import type { Entry, Link, Origin } from '@feedpon/feedly-client';
import { html, type VElement } from 'barebind';
import { decodeHTMLEntities } from '../../foundation/decode-html-entities.ts';
import { Favicon } from '../primitives/favicon.ts';
import { RelativeTime } from '../primitives/relative-time.ts';

export interface ArticleHeaderProps {
  entry: Entry;
  numberFormat: Intl.NumberFormat;
}

export function ArticleHeader({ entry, numberFormat }: ArticleHeaderProps) {
  return html`
    <div class="ArticleHeader">
      <a class="ArticleHeader-Visual" href=${entry.origin.htmlUrl} target="_blank">
        <${Favicon({
          class: 'ArticleHeader-Visual-icon',
          domain: getDomain(entry.origin.htmlUrl),
          logicalSize: 32,
          phycicalSize: 64,
        })}>
      </a>
      <div class="ArticleHeader-Content">
        <h1 class="ArticleHeader-Title">
          <a class="ArticleHeader-Title-anchor" href=${getSourceURL(entry)} target="_blank">
            ${decodeHTMLEntities(entry.title ?? '')}
          </a>
        </h1>
        <div class="ArticleHeader-Footer">
          <${renderFooterChildren(entry, numberFormat)}>
        </div>
      </div>
    </div>
  `;
}

function getAlternate(entry: Entry, type: string): Link | undefined {
  return entry.alternate?.find((link) => link.type === type);
}

function getDomain(urlString: string): string {
  try {
    return new URL(urlString).hostname;
  } catch {
    return location.hostname;
  }
}

function getOriginTitle(origin: Origin): string {
  return origin.title ?? getDomain(origin.htmlUrl);
}

function getSourceURL(entry: Entry): string {
  return (
    entry.canonicalUrl ??
    getAlternate(entry, 'text/html')?.href ??
    entry.origin.htmlUrl
  );
}

function renderFooterChildren(
  entry: Entry,
  numberFormat: Intl.NumberFormat,
): VElement[] {
  const children: VElement[] = [
    html`<a class="ArticleHeader-Footer-origin" href=${entry.origin.htmlUrl} target="_blank">${getOriginTitle(entry.origin)}</a>`.withKey(
      0,
    ),
  ];
  if (entry.author !== undefined) {
    children.push(
      html`
      <span class="ArticleHeader-Footer-separator">&middot;</span>
      <span class="ArticleHeader-Footer-author">${entry.author}</span>
    `.withKey(1),
    );
  }
  children.push(
    html`
    <span class="ArticleHeader-Footer-separator">&middot;</span>
    <${RelativeTime({ class: 'ArticleHeader-Footer-time', timeMillis: entry.published })}>
  `.withKey(2),
  );
  if (entry.engagement !== undefined) {
    children.push(
      html`
      <span class="ArticleHeader-Footer-separator">&middot;</span>
      <span class="ArticleHeader-Footer-engagement">🔥${numberFormat.format(entry.engagement)}</span>
    `.withKey(3),
    );
  }
  return children;
}
