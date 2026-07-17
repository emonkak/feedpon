import { createComponent, DOMAdapter, DOMRoot, html, Runtime } from 'barebind';

export interface ModalProps {
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  children: unknown;
  onClose?: (dialog: HTMLDialogElement) => void;
  open: boolean;
}

export const Modal = createComponent<ModalProps>(function Modal({
  ariaDescribedBy,
  ariaLabelledBy,
  children,
  onClose,
  open,
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

  const handleClose = this.useCallback(
    (event: Event) => {
      onClose?.(event.currentTarget as HTMLDialogElement);
    },
    [onClose],
  );

  return html`
    <dialog
      aria-describedby=${ariaDescribedBy}
      aria-labelledby=${ariaLabelledBy}
      class="Modal"
      closedby="any"
      @close=${handleClose}
      ${dialogRef}
    >
      <${children}>
    </dialog>
  `;
});

export async function openModal(props: ModalProps): Promise<void> {
  const { resolve, promise } = Promise.withResolvers<void>();
  const element = Modal({
    ...props,
    onClose: async (dialog) => {
      props.onClose?.(dialog);
      await waitForTransition(dialog);
      resolve();
    },
  });
  const runtime = new Runtime(new DOMAdapter());
  const root = new DOMRoot(document.body, runtime);
  await root.render(element).finished;
  try {
    return await promise;
  } finally {
    await root.unmount().finished;
  }
}

async function waitForTransition(element: HTMLElement): Promise<unknown> {
  return Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );
}
