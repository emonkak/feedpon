import {
  type RenderContext,
  type RootContext,
  type TemplateResult,
  createRoot,
} from '@emonkak/ebit';
import { component, ref } from '@emonkak/ebit/directives.js';

export interface DialogProps {
  children: TemplateResult;
  modal?: boolean;
  onClose?: (dialog: HTMLDialogElement) => void;
  open: boolean;
  ownProps?: { [key: string]: unknown };
}

export function Dialog(
  { ownProps = {}, children, modal = true, onClose, open }: DialogProps,
  context: RenderContext,
): TemplateResult {
  const dialogRef = context.useRef<HTMLDialogElement | null>(null);

  context.useLayoutEffect(() => {
    const dialog = dialogRef.current!;
    if (open) {
      if (modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }
    } else {
      dialog.close();
    }
  }, [open, modal]);

  context.useLayoutEffect(() => {
    const dissmissOnClickOutside = (event: MouseEvent) => {
      const dialog = dialogRef.current!;
      if (
        !event.defaultPrevented &&
        dialog.open &&
        !dialog.contains(event.target as Element)
      ) {
        dialog.close();
      }
    };
    window.addEventListener('click', dissmissOnClickOutside);
    return () => {
      window.removeEventListener('click', dissmissOnClickOutside);
    };
  }, []);

  const handleClick = context.useCallback((event: MouseEvent) => {
    const { top, bottom, left, right } = (
      event.currentTarget as HTMLDialogElement
    ).getBoundingClientRect();
    const isInDialog =
      top <= event.clientY &&
      bottom >= event.clientY &&
      left <= event.clientX &&
      right >= event.clientX;
    if (!isInDialog) {
      dialogRef.current!.close();
    }
  }, []);

  const handleClose = context.useCallback(
    (event: Event) => {
      onClose?.(event.currentTarget as HTMLDialogElement);
    },
    [onClose],
  );

  return context.html`
    <dialog
      class="Modal"
      ref=${ref(dialogRef)}
      @click=${handleClick}
      @close=${handleClose}
      ${ownProps}
    >
      <${children}>
    </dialog>
  `;
}

Dialog.open = async (
  props: DialogProps,
  context: RootContext<RenderContext>,
): Promise<void> => {
  const { resolve, promise } = Promise.withResolvers<void>();
  const value = component(Dialog, {
    ...props,
    onClose: async (dialog) => {
      props.onClose?.(dialog);
      await waitForTransition(dialog);
      resolve();
    },
  });
  const root = createRoot(value, document.body, context);
  root.mount();
  try {
    return await promise;
  } finally {
    root.unmount();
  }
};

async function waitForTransition(element: HTMLElement): Promise<unknown> {
  return Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );
}
