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
  onIndexChange?: (index: number) => void;
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
      onIndexChange,
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
                const index = parseInt(
                  (entry.target as HTMLElement).dataset['index']!,
                  10,
                );
                setIndex(index);
                onIndexChange?.(index);
              }
            }
          },
          { threshold: 1, rootMargin: '1px' },
        ),
      [],
    );
    const rootRef = this.useRef<HTMLElement | null>(null);
    const sentinelRef = this.useCallback((target: HTMLElement) => {
      intersectionObserver.observe(target);
      return () => {
        intersectionObserver.unobserve(target);
      };
    }, []);
    const renderItem = (variant: string, index: number) => {
      if (index < 0 || index >= source.length) {
        return undefined;
      }
      const element = elementSelector(source[index]!, index);
      const key = keySelector(source[index]!, index);
      return html`
        <li
          aria-posinset=${index + 1}
          aria-setsize=${source.length}
          class=${['StackScroller-Item', variant]}
        >
          <${element}>
        </li>
      `.withKey(key);
    };

    this.useEffect(() => {
      const y = index > 0 ? window.innerHeight - rootRef.current!.offsetTop : 0;
      window.scrollTo(0, y);
    }, [index]);

    const previous = renderItem('previous', index - 1);
    const current = renderItem('current', index);
    const next = renderItem('next', index + 1);

    return html`
      <div class="StackScroller" ${rootRef}>
        <div
          class="StackScroller-Top"
          data-index=${previous !== undefined ? index - 1 : undefined}
          ${sentinelRef}
        ></div>
        <ul class="StackScroller-List">
          <${[previous, current, next]}>
        </ul>
        <div
          class="StackScroller-Bottom"
          data-index=${next !== undefined ? index + 1 : undefined}
          ${sentinelRef}
        ></div>
      </div>
    `;
  },
);
