import { Observable } from 'rxjs/Observable'

export const IWindowOpener = class {}
export interface IWindowOpener {
    open(url: string): Observable<string>
}
