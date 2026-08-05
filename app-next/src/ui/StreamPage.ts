import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';

export interface StreamPageProps {
  stream: Stream;
}

export const StreamPage = createComponent<StreamPageProps>(function StreamPage({
  stream,
}) {
  const items = stream.items.map(
    (item) => html`
      <li>
        <article>
          <details>
            <summary>
              <h1>${item.title}</h1>
            </summary>
            <div .innerHTML=${item.content?.content ?? item.summary?.content}></div>
          </details>
        </article>
      </li>
    `,
  );
  return html`
    <h1>${stream.title}</h1>
    <ol>
      <${items}>
    </ol>
  `;
});
