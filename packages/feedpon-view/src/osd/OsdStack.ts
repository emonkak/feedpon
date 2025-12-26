import { createComponent, type RenderContext } from 'barebind';
import type { Osd } from 'feedpon-store';
import { AppStore } from 'feedpon-store';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';

export interface OsdStackProps {}

export const OsdStack = createComponent(function OsdStack(
  {}: OsdStackProps,
  $: RenderContext,
): unknown {
  const { state$ } = $.use(AppStore);
  const osd = $.use(state$.get('osd'));
  const [osdInProgress, setOsdInProgress] = $.useState<Osd | null>(null);
  const { dismissOsd } = $.use(BindActionCreators(AppStore, uiActions));

  $.useLayoutEffect(() => {
    setOsdInProgress(osd);
  }, [osd]);

  $.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (osdInProgress !== null) {
      timer = setTimeout(() => {
        dismissOsd();
        timer = null;
      }, osdInProgress.timeout);
    }
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }, [dismissOsd, osdInProgress]);

  const handleTransitionFinish = () => {
    if (osd === null) {
      setOsdInProgress(null);
    }
  };

  const ariaLabelId = $.useId();

  if (osdInProgress === null) {
    return null;
  }

  return $.html`
    <div
      aria-labelledby=${ariaLabelId}
      class="OSD"
      hidden=${osdInProgress === null}
      role="status"
      @transitioncancel=${handleTransitionFinish}
      @transitionend=${handleTransitionFinish}
    >
      <div class="OSD-message" id=${ariaLabelId}>
        ${osdInProgress.message}
      </div>
    </div>
  `;
});
