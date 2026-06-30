import {
  createComponent,
  DOMAdapter,
  DOMRoot,
  html,
  type RenderContext,
  Runtime,
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

export const AlertDialog = createComponent<AlertDialogProps>(
  function AlertDialog({
    cancelButton,
    confirmButton,
    message,
    onCancel,
    onConfirm,
    open = false,
    title,
  }) {
    const dialogRef = this.useRef<HTMLDialogElement | null>(null);

    this.useEffect(() => {
      const dialog = dialogRef.current!;
      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [open]);

    const handleConfirm = this.useCallback(() => {
      dialogRef.current!.close('confirmed');
    }, []);

    const handleCancel = this.useCallback(() => {
      dialogRef.current!.close();
    }, []);

    const handleClose = this.useCallback(
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

    const ariaDescriptionId = this.useId();
    const ariaLabelId = this.useId();

    return html`
      <dialog
        aria-describedby=${ariaDescriptionId}
        aria-labelledby=${ariaLabelId}
        class="Modal"
        closedby="any"
        role="alertdialog"
        @close=${handleClose}
        ${dialogRef}
      >
        <h1 class="Modal-title" id=${ariaLabelId}>${title}</h1>
        <p id=${ariaDescriptionId}>${message}</p>
        <div class="button-toolbar">
          <${confirmButton({ onConfirm: handleConfirm }, this)}>
          <${cancelButton({ onCancel: handleCancel }, this)}>
        </div>
      </dialog>
    `;
  },
);

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
  const runtime = new Runtime(new DOMAdapter());
  const root = new DOMRoot(document.body, runtime);
  root.render(value);
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
