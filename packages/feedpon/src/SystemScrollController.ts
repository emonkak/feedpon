import type { ScrollController, ScrollTarget } from 'feedpon-store';

export class SystemScrollController implements ScrollController {
  scrollTo(target: ScrollTarget, x: number, y: number): Promise<void> {
    target.scrollTo({ left: x, top: y, behavior: 'smooth' });
    return Promise.resolve();
  }

  scrollBy(target: ScrollTarget, dx: number, dy: number): Promise<void> {
    target.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
    return Promise.resolve();
  }

  scrollIntoView(target: Element): Promise<void> {
    target.scrollIntoView({ behavior: 'smooth' });
    return Promise.resolve();
  }

  async waitForScroll(): Promise<void> {
    return Promise.resolve();
  }
}
