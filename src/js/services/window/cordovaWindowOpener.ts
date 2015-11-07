import { IWindowOpener } from './interfaces'
import { Inject } from '../../di/annotations'

@Inject
export default class CordovaWindowOpener implements IWindowOpener  {
    open(url: string, urlChanged: (url: string, close: () => void) => void): void {
        const authWindow = window.open(url, '_blank', 'location=no,toolbar=no')
        const close = authWindow.close.bind(authWindow)

        authWindow.addEventListener('loadstart', (e) => {
            const url = (e as any).url;

            urlChanged(url, close)
        })
    }
}
