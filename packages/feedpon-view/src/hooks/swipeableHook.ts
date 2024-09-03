import type { RenderContext } from '@emonkak/ebit';

export interface SwipeableProps {
  coordinates: Coordinates;
  isSwiping: boolean;
  onTouchEnd: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchStart: (event: TouchEvent) => void;
}

export interface Coordinates {
  initialX: number;
  initialY: number;
  destX: number;
  destY: number;
}

export function swipeableHook(context: RenderContext): SwipeableProps {
  const [isSwiping, setIsSwping] = context.useState(false);
  const [coordinates, setCoordinates] = context.useState<Coordinates>(() => ({
    initialX: 0,
    initialY: 0,
    destX: 0,
    destY: 0,
  }));

  const onTouchStart = context.useCallback((event: TouchEvent): void => {
    if (event.targetTouches.length === 0) {
      return;
    }

    const { clientX, clientY } = event.targetTouches[0]!;

    setIsSwping(true);
    setCoordinates({
      initialX: clientX,
      initialY: clientY,
      destX: clientX,
      destY: clientY,
    });
  }, []);
  const onTouchMove = context.useCallback((event: TouchEvent): void => {
    if (event.targetTouches.length === 0) {
      return;
    }

    const { clientX, clientY } = event.targetTouches[0]!;

    setCoordinates((coordinates) => ({
      ...coordinates,
      destX: clientX,
      destY: clientY,
    }));
  }, []);
  const onTouchEnd = context.useCallback((_event: TouchEvent): void => {
    setIsSwping(false);
  }, []);

  return {
    coordinates,
    isSwiping,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
}
