import type {
  RefObject,
  RenderContext,
  TemplateResult,
  Usable,
} from '@emonkak/ebit';
import { ref } from '@emonkak/ebit/directives.js';

export interface DialogProps {
  child?: unknown;
  dialogProps?: { [key: string]: unknown };
  modal?: boolean;
  onDismiss?: () => void;
  open: boolean;
}

export function Dialog(
  { child, dialogProps = {}, modal = false, onDismiss, open }: DialogProps,
  context: RenderContext,
): TemplateResult {
  const dialogRef = context.useRef<HTMLDialogElement | null>(null);

  context.use(createClickOutsideHook(dialogRef, onDismiss));

  context.use(createFocusOutsideHook(dialogRef, onDismiss));

  context.useLayoutEffect(() => {
    if (open) {
      if (modal) {
        dialogRef.current!.showModal();
      } else {
        dialogRef.current!.show();
      }
    } else {
      dialogRef.current!.close();
    }
  }, [modal, open]);

  return context.html`
    <dialog ref=${ref(dialogRef)} @close=${onDismiss} ${dialogProps}>
      <${child}>
    </dialog>
  `;
}

function createClickOutsideHook(
  dialogRef: RefObject<HTMLDialogElement | null>,
  onDismiss: (() => void) | undefined,
): Usable<void> {
  return (context) => {
    context.useLayoutEffect(() => {
      const dissmissOnClickOutside = (event: MouseEvent) => {
        const dialog = dialogRef.current!;
        const target = event.target as Element;
        if (
          !event.defaultPrevented &&
          dialog.open &&
          !dialog.contains(target)
        ) {
          onDismiss?.();
        }
      };
      document.addEventListener('click', dissmissOnClickOutside);
      return () => {
        document.removeEventListener('click', dissmissOnClickOutside);
      };
    }, []);
  };
}

function createFocusOutsideHook(
  dialogRef: RefObject<HTMLDialogElement | null>,
  onDismiss: (() => void) | undefined,
): Usable<void> {
  return (context) => {
    context.useLayoutEffect(() => {
      const dissmissOnFocusOutside = (event: FocusEvent) => {
        const dialog = dialogRef.current!;
        const target = event.target as Element;
        if (
          !event.defaultPrevented &&
          dialog.open &&
          !dialog.contains(target)
        ) {
          onDismiss?.();
        }
      };
      document.addEventListener('focusin', dissmissOnFocusOutside);
      return () => {
        document.removeEventListener('focusin', dissmissOnFocusOutside);
      };
    }, []);
  };
}
