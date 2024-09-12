import type { Usable } from '@emonkak/ebit';
import type { StyleDeclaration } from '@emonkak/ebit/directives.js';

export interface Popup {
  close: () => void;
  open: (target: Element) => void;
  opened: boolean;
  pullDirection: PullDirection;
  style: StyleDeclaration;
}

export type PullDirection = 'left' | 'right' | 'up' | 'down';

export type PullDirections = [PullDirection, ...PullDirection[]];

interface PopupState {
  opened: boolean;
  style: StyleDeclaration;
  pullDirection: PullDirection;
}

export function createPopupHook(
  defaultOpened: boolean,
  pullDirections: PullDirections = ['down', 'up', 'right', 'left'],
): Usable<Popup> {
  return (context) => {
    const [popupState, setPopupState] = context.useState<PopupState>({
      opened: defaultOpened,
      style: {},
      pullDirection: 'down',
    });

    const open = context.useCallback((target: Element) => {
      const targetRect = target.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const pullDirection = getAdaptedPullDirection(
        targetRect,
        viewportWidth,
        viewportHeight,
        pullDirections,
      );
      const style = getPopupStyle(targetRect, pullDirection);

      setPopupState({ opened: true, style, pullDirection });
    }, []);

    const close = context.useCallback(() => {
      setPopupState((popupState) => ({ ...popupState, opened: false }));
    }, []);

    return {
      ...popupState,
      open,
      close,
    } as Popup;
  };
}

function getAdaptedPullDirection(
  targetRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  pullDirections: PullDirections,
): PullDirection {
  const availableSpaces = {
    up: targetRect.top,
    down: viewportHeight - targetRect.bottom,
    left: targetRect.left,
    right: viewportWidth - targetRect.right,
  };
  let adaptedPullDirection = pullDirections[0];
  let maxSpace = availableSpaces[adaptedPullDirection];

  for (let i = 1, l = pullDirections.length; i < l; i++) {
    const pullDirection = pullDirections[i]!;
    const space = availableSpaces[pullDirection];
    if (maxSpace < space) {
      maxSpace = space;
      adaptedPullDirection = pullDirection;
    }
  }

  return adaptedPullDirection;
}

function getPopupStyle(
  targetRect: DOMRect,
  pullDirection: PullDirection,
): StyleDeclaration {
  const style: StyleDeclaration = {};

  switch (pullDirection) {
    case 'down':
      style.top = targetRect.bottom + 'px';
      style.left = (targetRect.left + targetRect.right) / 2 + 'px';
      style.maxHeight = `calc(100% - ${targetRect.bottom}px)`;
      style.maxWidth = '100%';
      break;

    case 'up':
      style.bottom = `calc(100% - ${targetRect.top}px)`;
      style.left = (targetRect.left + targetRect.right) / 2 + 'px';
      style.maxHeight = `calc(100% - (100% - ${targetRect.top}px))`;
      style.maxWidth = '100%';
      break;

    case 'right':
      style.top = (targetRect.top + targetRect.bottom) / 2 + 'px';
      style.left = targetRect.right + 'px';
      style.maxHeight = '100%';
      style.maxWidth = `calc(100% - ${targetRect.right}px)`;
      break;

    case 'left':
      style.top = (targetRect.top + targetRect.bottom) / 2 + 'px';
      style.right = `calc(100% - ${targetRect.left}px)`;
      style.maxWidth = `calc(100% - (100% - ${targetRect.left}px))`;
      style.maxHeight = '100%';
      break;
  }

  return style;
}
