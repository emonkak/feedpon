declare module 'intl-relativeformat' {
    class IntlRelativeFormat {
        constructor(locales?: string | string[], options?: Partial<ConstructorOptions>);
        resolvedOptions(): ResolvedOptions;
        format(date: Date | number, options?: Partial<FormatOptions>): string;
    }

    interface ConstructorOptions {
        units: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
        style: 'best fit' | 'numeric';
    }

    interface ResolvedOptions {
        locale: string;
    }

    interface FormatOptions {
        now: Date | number;
    }

    export = IntlRelativeFormat;
}
