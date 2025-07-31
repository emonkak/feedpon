import {
  AsyncRoot,
  BrowserBackend,
  component,
  type RenderContext,
} from 'barebind';

export interface DialogProps {
  children: unknown;
  modal?: boolean;
  onClose?: (dialog: HTMLDialogElement) => void;
  open: boolean;
  ownProps?: { [key: string]: unknown };
}

export function Dialog(
  { ownProps = {}, children, modal = true, onClose, open }: DialogProps,
  context: RenderContext,
): unknown {
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
      :ref=${dialogRef}
      class=${modal ? 'Modal' : null}
      @click=${handleClick}
      @close=${handleClose}
      ${ownProps}
    >
      <${children}>
    </dialog>
  `;
}

Dialog.open = async (props: DialogProps): Promise<void> => {
  const { resolve, promise } = Promise.withResolvers<void>();
  const value = component(Dialog, {
    ...props,
    onClose: async (dialog) => {
      props.onClose?.(dialog);
      await waitForTransition(dialog);
      resolve();
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
