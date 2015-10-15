export class WindowOpener {}

export interface IWindowOpener {
    open(url: string, expectUrl: string): Promise<string>;
}
