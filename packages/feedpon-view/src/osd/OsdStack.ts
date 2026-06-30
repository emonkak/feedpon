import { createComponent, html } from 'barebind';
import type { Osd } from 'feedpon-store';
import { AppStore } from 'feedpon-store';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';

export interface OsdStackProps {}

export const OsdStack = createComponent<OsdStackProps>(function OsdStack() {
  const { state$ } = this.use(AppStore);
  const osd = this.use(state$.get('osd'));
  const [osdInProgress, setOsdInProgress] = this.useState<Osd | null>(null);
  const { dismissOsd } = this.use(BindActionCreators(AppStore, uiActions));

  this.useEffect(() => {
    setOsdInProgress(osd);
  }, [osd]);

  this.useEffect(() => {
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

  const ariaLabelId = this.useId();

  if (osdInProgress === null) {
    return null;
  }

  return html`
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
