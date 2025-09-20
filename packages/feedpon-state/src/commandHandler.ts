import type { AppContext } from './action.ts';
import type { CommandHandler } from './state.ts';

export class AppCommandHandler implements CommandHandler<AppContext> {
  scrollDown({ state$ }: AppContext): void {
    const { scrollDistanceRatio, scrollBehavior } =
      state$.get('keyboardSettings').value;

    scrollBy({
      left: 0,
      top: -document.documentElement.clientHeight / scrollDistanceRatio,
      behavior: scrollBehavior,
    });
  }

  scrollUp({ state$ }: AppContext): void {
    const { scrollDistanceRatio, scrollBehavior } =
      state$.get('keyboardSettings').value;

    scrollBy({
      left: 0,
      top: document.documentElement.clientHeight / scrollDistanceRatio,
      behavior: scrollBehavior,
    });
  }
}
