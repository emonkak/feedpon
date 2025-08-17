import { createComponent, type RenderContext } from 'barebind';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { OSDMessage, State } from 'feedpon-messaging';
import { closeOSD } from 'feedpon-messaging/osd';

export interface OSDProps {}

export const OSD = createComponent(function OSD(
  {}: OSDProps,
  $: RenderContext,
): unknown {
  const { message, onCloseOSD } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        message: state.osd.message,
      }),
      mapDispatchToProps: bindActions({
        onCloseOSD: closeOSD,
      }),
    }),
  );

  const messageInProgress = $.useRef<OSDMessage | null>(null);

  if (message !== null) {
    messageInProgress.current = message;
  }

  const handlePopMessage = $.useCallback(() => {
    messageInProgress.current = message;
    $.forceUpdate();
  }, [message]);

  $.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (message !== null && message.closeAfter >= 0) {
      timer = setTimeout(() => {
        onCloseOSD();
        timer = null;
      }, message.closeAfter);
    }
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }, [onCloseOSD, message]);

  const ariaLabelId = $.useId();

  if (messageInProgress.current === null) {
    return $.html``;
  }

  return $.html`
    <div
      aria-labelledby=${ariaLabelId}
      class="OSD"
      hidden=${message === null}
      role="status"
      @transitioncancel=${handlePopMessage}
      @transitionend=${handlePopMessage}
    >
      <div class="OSD-message" id=${ariaLabelId}>
        ${messageInProgress.current.body}
      </div>
    </div>
  `;
});
