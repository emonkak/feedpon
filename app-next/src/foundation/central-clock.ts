import type { HookObject, RenderContext } from 'barebind';

export type CentralClockListener = (time: number) => void;

export class CentralClock implements HookObject<number> {
  private readonly _resolutionMillis: number;
  private _timeMillis = Date.now();
  private _listeners = new Set<CentralClockListener>();
  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor(resolutionMillis: number) {
    this._resolutionMillis = resolutionMillis;
  }

  get timeMillis(): number {
    return this._timeMillis;
  }

  get resolutionMillis(): number {
    return this._resolutionMillis;
  }

  onUse(context: RenderContext): number {
    const [currentTime, setCurrentTime] = context.useState(this.timeMillis);

    context.useEffect(() => {
      return this.subscribe((timeMillis) => {
        setCurrentTime(timeMillis);
      });
    }, [this]);

    return currentTime;
  }

  subscribe(listener: CentralClockListener): () => void {
    this._listeners.add(listener);
    if (this._listeners.size === 1) {
      this._startTimer();
    }
    return () => {
      this._listeners.delete(listener);
      if (this._listeners.size === 0) {
        this._stopTimer();
      }
    };
  }

  private _startTimer(): void {
    this._timer = setInterval(() => {
      this._timeMillis = Date.now();
      for (const listener of this._listeners) {
        listener(this._timeMillis);
      }
    }, this._resolutionMillis);
  }

  private _stopTimer(): void {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
