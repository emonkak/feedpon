import {
  AsyncRoot,
  BrowserBackend,
  component,
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

export function AlertDialog(
  {
    cancelButton,
    confirmButton,
    message,
    onCancel,
    onConfirm,
    open = false,
    title,
  }: AlertDialogProps,
  context: RenderContext,
): unknown {
  const dialogRef = context.useRef<HTMLDialogElement | null>(null);

  context.useLayoutEffect(() => {
    const dialog = dialogRef.current!;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleConfirm = context.useCallback(() => {
    dialogRef.current!.close('confirmed');
  }, []);

  const handleCancel = context.useCallback(() => {
    dialogRef.current!.close();
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

  const ariaDescriptionId = context.useId();
  const ariaLabelId = context.useId();

  return context.html`
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
        <${confirmButton({ onConfirm: handleConfirm }, context)}>
        <${cancelButton({ onCancel: handleCancel }, context)}>
      </div>
    </dialog>
  `;
}

AlertDialog.open = async (props: AlertDialogProps): Promise<boolean> => {
  const { resolve, promise } = Promise.withResolvers<boolean>();
  const value = component(AlertDialog, {
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
};

async function waitForTransition(element: HTMLElement): Promise<unknown> {
  return Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );
}
