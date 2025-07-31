import type { HookContext } from 'barebind';

export interface SwipeableProps {
  coordinates: Coordinates;
  isSwiping: boolean;
  onTouchEnd: TouchEventListenerObject;
  onTouchMove: TouchEventListenerObject;
  onTouchStart: TouchEventListenerObject;
}

export interface Coordinates {
  initialX: number;
  initialY: number;
  destX: number;
  destY: number;
}

interface TouchEventListenerObject {
  handleEvent(event: TouchEvent): void;
}

export function swipeableHook(context: HookContext): SwipeableProps {
  const [isSwiping, setIsSwping] = context.useState(false);
  const [coordinates, setCoordinates] = context.useState<Coordinates>(() => ({
    initialX: 0,
    initialY: 0,
    destX: 0,
    destY: 0,
  }));

  const onTouchStart = context.useMemo(
    () => ({
      passive: true,
      handleEvent(event: TouchEvent): void {
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
      },
    }),
    [],
  );
  const onTouchMove = context.useMemo(
    () => ({
      passive: true,
      handleEvent(event: TouchEvent): void {
        if (event.targetTouches.length === 0) {
          return;
        }

        const { clientX, clientY } = event.targetTouches[0]!;

        setCoordinates((coordinates) => ({
          ...coordinates,
          destX: clientX,
          destY: clientY,
        }));
      },
    }),
    [],
  );
  const onTouchEnd = context.useMemo(
    () => ({
      passive: true,
      handleEvent(_event: TouchEvent): void {
        setIsSwping(false);
      },
    }),
    [],
  );

  return {
    coordinates,
    isSwiping,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
}
