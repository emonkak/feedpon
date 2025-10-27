import { createComponent, type RenderContext, Root } from 'barebind';

export interface DialogProps {
  children: unknown;
  modal?: boolean;
  onClose?: (dialog: HTMLDialogElement) => void;
  open: boolean;
  ownProps?: { [key: string]: unknown };
}

export const Dialog = createComponent(function Dialog(
  { ownProps = {}, children, modal = true, onClose, open }: DialogProps,
  $: RenderContext,
): unknown {
  const dialogRef = $.useRef<HTMLDialogElement | null>(null);

  $.useLayoutEffect(() => {
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

  const handleClose = $.useCallback(
    (event: Event) => {
      onClose?.(event.currentTarget as HTMLDialogElement);
    },
    [onClose],
  );

  return $.html`
    <dialog
      :ref=${dialogRef}
      class=${modal ? 'Modal' : null}
      closedby="any"
      @close=${handleClose}
      ${ownProps}
    >
      <${children}>
    </dialog>
  `;
});

export function openDialog(
  props: DialogProps,
  context: RenderContext,
): Promise<void> {
  const { resolve, promise } = Promise.withResolvers<void>();
  const value = Dialog({
    ...props,
    onClose: async (dialog) => {
      props.onClose?.(dialog);
      await waitForTransition(dialog);
      resolve();
    },
  });
  const root = Root.create(value, document.body, context.getSessionContext());
  root.mount();
  try {
    return promise;
  } finally {
    root.unmount();
  }
}

async function waitForTransition(element: HTMLElement): Promise<unknown> {
  return Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );
}
