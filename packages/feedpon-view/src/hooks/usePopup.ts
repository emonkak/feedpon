import React, { useState } from 'react';

export interface PopupProps {
  closePopup: () => void;
  isOpened: boolean;
  openPopup: (ref: React.RefObject<Element>) => void;
  popupStyle: React.CSSProperties;
  pullDirection: PullDirection;
}

export type PullDirection = 'left' | 'right' | 'up' | 'down';

export default function usePopup(
  defaultIsOpened: boolean,
  pullDirections: PullDirection[] = ['down', 'up', 'right', 'left'],
): PopupProps {
  const [isOpened, setIsOpened] = useState(defaultIsOpened);
  const [popupStyle, setPopupStyle] = useState({});
  const [pullDirection, setPullDirection] = useState<PullDirection>('down');

  const openPopup = (containerRef: React.RefObject<Element>) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const pullDirection = getFittedPullDirection(
      containerRect,
      viewportWidth,
      viewportHeight,
      pullDirections,
    );
    if (pullDirection === null) {
      return;
    }

    const popupStyle = getPopupStyle(containerRect, pullDirection);

    setIsOpened(true);
    setPopupStyle(popupStyle);
    setPullDirection(pullDirection);
  };

  const closePopup = () => {
    setIsOpened(false);
  };

  return {
    closePopup,
    isOpened,
    openPopup,
    popupStyle,
    pullDirection,
  };
}

function getFittedPullDirection(
  containerRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  pullDirections: PullDirection[],
): PullDirection | null {
  const spaces: Record<PullDirection, number> = {
    up: containerRect.top,
    down: viewportHeight - containerRect.bottom,
    left: containerRect.left,
    right: viewportWidth - containerRect.right,
  };

  let maximumSpace = 0;
  let fittedPullDirection: PullDirection | null = null;

  for (const pullDirection of pullDirections) {
    const space = spaces[pullDirection];
    if (maximumSpace < space) {
      maximumSpace = space;
      fittedPullDirection = pullDirection;
    }
  }

  return fittedPullDirection;
}

function getPopupStyle(
  containerRect: DOMRect,
  pullDirection: PullDirection,
): React.CSSProperties {
  const style: React.CSSProperties = {};

  switch (pullDirection) {
    case 'down':
      style.top = containerRect.bottom;
      style.left = (containerRect.left + containerRect.right) / 2;
      style.maxHeight = `calc(100% - ${containerRect.bottom}px)`;
      style.maxWidth = '100%';
      break;

    case 'up':
      style.bottom = `calc(100% - ${containerRect.top}px)`;
      style.left = (containerRect.left + containerRect.right) / 2;
      style.maxHeight = `calc(100% - (100% - ${containerRect.top}px))`;
      style.maxWidth = '100%';
      break;

    case 'right':
      style.top = (containerRect.top + containerRect.bottom) / 2;
      style.left = containerRect.right;
      style.maxHeight = '100%';
      style.maxWidth = `calc(100% - ${containerRect.right}px)`;
      break;

    case 'left':
      style.top = (containerRect.top + containerRect.bottom) / 2;
      style.right = `calc(100% - ${containerRect.left}px)`;
      style.maxWidth = `calc(100% - (100% - ${containerRect.left}px))`;
      style.maxHeight = '100%';
      break;
  }

  return style;
}
