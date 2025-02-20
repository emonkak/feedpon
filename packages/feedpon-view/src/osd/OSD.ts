import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit.ts';
import type { OSDMessage, State } from 'feedpon-messaging';
import { closeOSD } from 'feedpon-messaging/osd';

export interface OSDProps {}

export function OSD({}: OSDProps, context: RenderContext): TemplateResult {
  const { message, onCloseOSD } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        message: state.osd.message,
      }),
      mapDispatchToProps: bindActions({
        onCloseOSD: closeOSD,
      }),
    }),
  );

  const messageInProgress = context.useRef<OSDMessage | null>(null);

  if (message !== null) {
    messageInProgress.current = message;
  }

  const handlePopMessage = context.useCallback(() => {
    messageInProgress.current = message;
    context.forceUpdate();
  }, [message]);

  context.useEffect(() => {
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

  const ariaLabelId = context.useId();

  if (messageInProgress.current === null) {
    return context.html``;
  }

  return context.html`
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
}
