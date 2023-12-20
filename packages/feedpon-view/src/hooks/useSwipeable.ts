import { useCallback, useState } from 'react';

export interface SwipeableProps {
  coordinates: Coordinates;
  isSwiping: boolean;
  onTouchEnd: (event: React.TouchEvent<unknown>) => void;
  onTouchMove: (event: React.TouchEvent<unknown>) => void;
  onTouchStart: (event: React.TouchEvent<unknown>) => void;
}

export interface Coordinates {
  initialX: number;
  initialY: number;
  destX: number;
  destY: number;
}

export default function useSwipeable(): SwipeableProps {
  const [isSwiping, setIsSwping] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>(() => ({
    initialX: 0,
    initialY: 0,
    destX: 0,
    destY: 0,
  }));

  const onTouchStart = useCallback((event: React.TouchEvent<unknown>): void => {
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

  const onTouchMove = useCallback((event: React.TouchEvent<unknown>): void => {
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

  const onTouchEnd = useCallback((_event: React.TouchEvent<unknown>): void => {
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
