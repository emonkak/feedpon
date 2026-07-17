import { createComponent, html } from 'barebind';

export interface PopupProps {
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  children: unknown;
  onClose?: (event: Event) => void;
  open: boolean;
}

interface PopupState {
  direction: Direction;
  style: PopupStyle;
}

interface PopupStyle {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  maxHeight?: string;
  maxWidth?: string;
}

type Direction = 'left' | 'right' | 'up' | 'down';

type Directions = [Direction, ...Direction[]];

export const Popup = createComponent<PopupProps>(function Popup({
  ariaDescribedBy,
  ariaLabelledBy,
  children,
  onClose,
  open,
}) {
  const [popupState, setPopupState] = this.useState<PopupState>({
    direction: 'down',
    style: {},
  });
  const dialogRef = this.useRef<HTMLDialogElement | null>(null);

  const handleOpen = (event: ToggleEvent) => {
    const dialog = event.currentTarget! as HTMLDialogElement;
    const bounds = dialog.parentElement!.getBoundingClientRect();
    const direction = adaptDirection(
      bounds,
      window.innerWidth,
      window.innerHeight,
      ['up', 'down'],
    );
    const style = getPopupStyle(bounds, direction);
    setPopupState({ direction, style });
  };

  const handleClose = (event: ToggleEvent) => {
    onClose?.(event);
  };

  const handleToggle = (event: ToggleEvent) => {
    if (event.newState === 'open') {
      handleOpen(event);
    } else {
      handleClose(event);
    }
  };

  this.useEffect(() => {
    const dialog = dialogRef.current!;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return html`
    <dialog
      aria-describedby=${ariaDescribedBy}
      aria-labelledby=${ariaLabelledBy}
      class=${['Popup', 'is-pull-' + popupState.direction]}
      style=${popupState.style}
      closedby="any"
      @toggle=${handleToggle}
      ${dialogRef}
    >
      <div
        class=${['popover popover-default', 'is-pull-' + popupState.direction]}
      >
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <${children}>
        </div>
      </div>
    </dialog>
  `;
});

function adaptDirection(
  targetRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  allowedDirections: Directions,
): Direction {
  const availableSpaces = {
    up: targetRect.top,
    down: viewportHeight - targetRect.bottom,
    left: targetRect.left,
    right: viewportWidth - targetRect.right,
  };
  let adaptedPullDirection = allowedDirections[0];
  let maxSpace = availableSpaces[adaptedPullDirection];

  for (let i = 1, l = allowedDirections.length; i < l; i++) {
    const pullDirection = allowedDirections[i]!;
    const space = availableSpaces[pullDirection];
    if (maxSpace < space) {
      maxSpace = space;
      adaptedPullDirection = pullDirection;
    }
  }

  return adaptedPullDirection;
}

function getPopupStyle(bounds: DOMRect, direction: Direction): PopupStyle {
  const style: PopupStyle = {};

  switch (direction) {
    case 'down':
      style.top = bounds.bottom + 'px';
      style.left = (bounds.left + bounds.right) / 2 + 'px';
      style.maxHeight = `calc(100% - ${bounds.bottom}px)`;
      style.maxWidth = '100%';
      break;

    case 'up':
      style.top = 'auto';
      style.bottom = `calc(100% - ${bounds.top}px)`;
      style.left = (bounds.left + bounds.right) / 2 + 'px';
      style.maxHeight = `calc(100% - (100% - ${bounds.top}px))`;
      style.maxWidth = '100%';
      break;

    case 'right':
      style.top = (bounds.top + bounds.bottom) / 2 + 'px';
      style.left = bounds.right + 'px';
      style.maxHeight = '100%';
      style.maxWidth = `calc(100% - ${bounds.right}px)`;
      break;

    case 'left':
      style.top = (bounds.top + bounds.bottom) / 2 + 'px';
      style.left = 'auto';
      style.right = `calc(100% - ${bounds.left}px)`;
      style.maxWidth = `calc(100% - (100% - ${bounds.left}px))`;
      style.maxHeight = '100%';
      break;
  }

  return style;
}
