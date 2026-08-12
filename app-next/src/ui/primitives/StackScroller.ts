import {
  type Component,
  createComponent,
  html,
  type RenderContext,
  type VComponent,
} from 'barebind';

export interface StackScrollerProps<T> {
  elementSelector: (element: T, index: number) => unknown;
  initialIndex?: number;
  keySelector: (element: T, index: number) => unknown;
  source: ArrayLike<T>;
}

export interface StackScroller extends Component<StackScrollerProps<any>> {
  <T>(props: StackScrollerProps<T>): VComponent<StackScrollerProps<T>>;
}

export const StackScroller: StackScroller = createComponent(
  function StackScroller<T>(
    this: RenderContext,
    {
      elementSelector,
      initialIndex = 0,
      keySelector,
      source,
    }: StackScrollerProps<T>,
  ) {
    const [index, setIndex] = this.useState(initialIndex);
    const intersectionObserver = this.useMemo(
      () =>
        new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (
                entry.isIntersecting &&
                entry.target.isConnected &&
                entry.target.hasAttribute('data-index')
              ) {
                const index = Number(
                  (entry.target as HTMLElement).dataset['index'],
                );
                setIndex(index);
              }
            }
          },
          { threshold: 1, rootMargin: '1px' },
        ),
      [],
    );
    const ref = this.useCallback((target: Element) => {
      intersectionObserver.observe(target);
      return () => {
        intersectionObserver.unobserve(target);
      };
    }, []);
    const renderItem = (kind: 'prev' | 'current' | 'next', index: number) => {
      if (index < 0 || index >= source.length) {
        return undefined;
      }
      const element = elementSelector(source[index]!, index);
      const key = keySelector(source[index]!, index);
      return html`
        <li
          aria-posinset=${index + 1}
          aria-setsize=${source.length}
          class=${['StackScroller-Item', kind]}
        >
          <${element}>
        </li>
      `.withKey(key);
    };

    this.useEffect(() => {
      window.scrollTo(0, index > 0 ? window.innerHeight : 0);
    }, [index]);

    const prev = renderItem('prev', index - 1);
    const current = renderItem('current', index);
    const next = renderItem('next', index + 1);

    return html`
      <div class="StackScroller">
        <div
          class="StackScroller-Top"
          data-index=${prev !== undefined ? index - 1 : undefined}
          ${ref}
        ></div>
        <ul class="StackScroller-List">
          <${[prev, current, next]}>
        </ul>
        <div
          class="StackScroller-Bottom"
          data-index=${next !== undefined ? index + 1 : undefined}
          ${ref}
        ></div>
      </div>
    `;
  },
);
