import {
  type RenderContext,
  type RootContext,
  type TemplateResult,
  createRoot,
} from '@emonkak/ebit';
import { component, ref } from '@emonkak/ebit/directives.js';

export interface AlertDialogProps {
  cancelButton: (
    props: { onCancel: () => void },
    context: RenderContext,
  ) => TemplateResult;
  confirmButton: (
    props: { onConfirm: () => void },
    context: RenderContext,
  ) => TemplateResult;
  description: string;
  onCancel?: (dialog: HTMLDialogElement) => void;
  onConfirm?: (dialog: HTMLDialogElement) => void;
  open?: boolean;
  title: string;
}

export function AlertDialog(
  {
    cancelButton,
    confirmButton,
    description,
    onCancel,
    onConfirm,
    open = false,
    title,
  }: AlertDialogProps,
  context: RenderContext,
): TemplateResult {
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

  const titleId = context.useId();
  const descriptionId = context.useId();

  return context.html`
    <dialog
      aria-describedby=${descriptionId}
      aria-labelledby=${titleId}
      class="Modal"
      role="alertdialog"
      ref=${ref(dialogRef)}
      @click=${handleClick}
      @close=${handleClose}
    >
      <h1 class="Modal-title" id=${titleId}>${title}</h1>
      <p id=${descriptionId}>${description}</p>
      <div class="button-toolbar">
        <${confirmButton({ onConfirm: handleConfirm }, context)}>
        <${cancelButton({ onCancel: handleCancel }, context)}>
      </div>
    </dialog>
  `;
}

AlertDialog.open = async (
  props: AlertDialogProps,
  context: RootContext<RenderContext>,
): Promise<boolean> => {
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
