import type { RenderContext } from 'barebind';

interface MainLayoutProps {
  content: unknown;
  footer?: unknown;
  header: unknown;
}

export function MainLayout(
  { content, footer, header }: MainLayoutProps,
  context: RenderContext,
): unknown {
  footer ??= context.html`
    <footer class="u-margin-top-4 u-margin-bottom-4">
      <div class="u-text-center">
        <small>Copyright &copy; 2017 Shota Nozaki</small>
      </div>
      <div class="u-text-center">
        <ul class="list-inline list-inline-slashed">
          <li class="list-inline-item">
            <a
              href="https://github.com/emonkak/feedpon"
              target="_blank"
              rel="noreferrer"
            >
              Source code
            </a>
          </li>
          <li class="list-inline-item">
            <a
              href="https://github.com/emonkak/feedpon/issues"
              target="_blank"
              rel="noreferrer"
            >
              Issues
            </a>
          </li>
        </ul>
      </div>
    </footer>
  `;

  return context.html`
    <div class="l-header"><${header}></div>
    <div class="l-content"><${content}></div>
    <div class="l-footer"><${footer}></div>
  `;
}
