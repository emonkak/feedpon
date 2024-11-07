import {
  type RenderContext,
  type TemplateResult,
  createRoot,
} from '@emonkak/ebit';
import { component, ref } from '@emonkak/ebit/directives.js';

export interface ConfirmModalProps {
  cancelButton: (
    callback: () => void,
    context: RenderContext,
  ) => TemplateResult;
  confirmButton: (
    callback: () => void,
    context: RenderContext,
  ) => TemplateResult;
  message: string;
  onCancel?: (dialog: HTMLDialogElement) => void;
  onConfirm?: (dialog: HTMLDialogElement) => void;
  open?: boolean;
  title: string;
}

export function ConfirmModal(
  {
    cancelButton,
    confirmButton,
    message,
    onCancel,
    onConfirm,
    open = false,
    title,
  }: ConfirmModalProps,
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
    document.addEventListener('click', dissmissOnClickOutside);
    return () => {
      document.removeEventListener('click', dissmissOnClickOutside);
    };
  }, []);

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

  const handleClose = context.useCallback(async () => {
    const dialog = dialogRef.current!;
    if (dialog.returnValue === 'confirmed') {
      onConfirm?.(dialog);
    } else {
      onCancel?.(dialog);
    }
  }, [onCancel, onConfirm]);

  const titleId = context.useId();
  const messageId = context.useId();

  return context.html`
    <dialog
      aria-labelledby=${titleId}
      aria-describedby=${messageId}
      class="Modal"
      role="alertdialog"
      ref=${ref(dialogRef)}
      @click=${handleClick}
      @close=${handleClose}
    >
      <h1 class="Modal-title" id=${titleId}>${title}</h1>
      <p id=${messageId}>${message}</p>
      <div class="button-toolbar">
        <${confirmButton(handleConfirm, context)}>
        <${cancelButton(handleCancel, context)}>
      </div>
    </dialog>
  `;
}

ConfirmModal.open = async (
  props: Omit<ConfirmModalProps, 'open'>,
  context: RenderContext,
): Promise<boolean> => {
  const { resolve, promise } = Promise.withResolvers<boolean>();
  const value = component(ConfirmModal, {
    ...props,
    open: true,
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
  const root = createRoot(value, document.body, context.host, context.updater);
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
