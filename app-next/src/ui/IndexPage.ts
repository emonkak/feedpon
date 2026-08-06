import { createComponent, html } from 'barebind';

export interface IndexPageProps {}

export const IndexPage = createComponent(function IndexPage(
  _props: IndexPageProps,
) {
  return html`
    <div>Hello, Feedpon!</div>
  `;
});
