export const IWindowOpener = class {}
export interface IWindowOpener {
    open(url: string, urlChanged: (url: string, close: () => void) => void): void
}
