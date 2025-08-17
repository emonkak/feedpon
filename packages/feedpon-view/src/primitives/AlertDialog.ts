import {
  AsyncRoot,
  BrowserBackend,
  createComponent,
  type RenderContext,
} from 'barebind';

export interface AlertDialogProps {
  cancelButton: (
    props: { onCancel: () => void },
    context: RenderContext,
  ) => unknown;
  confirmButton: (
    props: { onConfirm: () => void },
    context: RenderContext,
  ) => unknown;
  message: string;
  onCancel?: (dialog: HTMLDialogElement) => void;
  onConfirm?: (dialog: HTMLDialogElement) => void;
  open?: boolean;
  title: string;
}

export const AlertDialog = createComponent(function AlertDialog(
  {
    cancelButton,
    confirmButton,
    message,
    onCancel,
    onConfirm,
    open = false,
    title,
  }: AlertDialogProps,
  $: RenderContext,
): unknown {
  const dialogRef = $.useRef<HTMLDialogElement | null>(null);

  $.useLayoutEffect(() => {
    const dialog = dialogRef.current!;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleConfirm = $.useCallback(() => {
    dialogRef.current!.close('confirmed');
  }, []);

  const handleCancel = $.useCallback(() => {
    dialogRef.current!.close();
  }, []);

  const handleClick = $.useCallback((event: MouseEvent) => {
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

  const handleClose = $.useCallback(
    async (event: Event) => {
      const dialog = event.currentTarget as HTMLDialogElement;
      if (dialog.returnValue === 'confirmed') {
        onConfirm?.(dialog);
      } else {
        onCancel?.(dialog);
      }
    },
    [onCancel, onConfirm],
  );

  const ariaDescriptionId = $.useId();
  const ariaLabelId = $.useId();

  return $.html`
    <dialog
      :ref=${dialogRef}
      aria-describedby=${ariaDescriptionId}
      aria-labelledby=${ariaLabelId}
      class="Modal"
      role="alertdialog"
      @click=${handleClick}
      @close=${handleClose}
    >
      <h1 class="Modal-title" id=${ariaLabelId}>${title}</h1>
      <p id=${ariaDescriptionId}>${message}</p>
      <div class="button-toolbar">
        <${confirmButton({ onConfirm: handleConfirm }, $)}>
        <${cancelButton({ onCancel: handleCancel }, $)}>
      </div>
    </dialog>
  `;
});

export async function openAlertDialog(
  props: AlertDialogProps,
): Promise<boolean> {
  const { resolve, promise } = Promise.withResolvers<boolean>();
  const value = AlertDialog({
    ...props,
    open: props.open ?? true,
    onCancel: async (dialog) => {
      props.onCancel?.(dialog);
      await waitForTransition(dialog);
      resolve(false);
    },
    onConfirm: async (dialog) => {
      props.onConfirm?.(dialog);
      await waitForTransition(dialog);
      resolve(true);
    },
  });
  const root = AsyncRoot.create(value, document.body, new BrowserBackend());
  root.mount();
  try {
    return await promise;
  } finally {
    root.unmount();
  }
}

async function waitForTransition(element: HTMLElement): Promise<unknown> {
  return Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );
}
