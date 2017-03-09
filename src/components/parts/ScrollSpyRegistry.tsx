import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

export default class ScrollSpyRegistry {
    private readonly childKeys: Map<HTMLElement, string> = new Map();

    register(element: HTMLElement, key: string): void {
        this.childKeys.set(element, key);
    }

    unregister(element: HTMLElement): void {
        this.childKeys.delete(element);
    }

    getActiveKey(scrollTop: number, scrollBottom: number): string {
        return new Enumerable(this.childKeys)
            .where(([element, key]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                return offsetTop < scrollBottom && offsetBottom > scrollTop;
            })
            .maxBy(([element, key]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                if (offsetTop >= scrollTop && offsetBottom <= scrollBottom) {
                    return scrollBottom - offsetTop;
                } else {
                    const displayTop = Math.max(offsetTop, scrollTop);
                    const displayBottom = Math.min(offsetBottom, scrollBottom);

                    return displayBottom - displayTop;
                }
            })
            .select(([element, key]) => key)
            .firstOrDefault();
    }
}
