import { IWindowOpener } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class CordovaWindowOpener implements IWindowOpener  {
    open(url: string, urlChanged: (url: string, close: () => void) => void): void {
        const authWindow = window.open(url, '_blank', 'location=no,toolbar=no')
        const close = () => authWindow.close

        authWindow.addEventListener('loadstart', (event: any) => {
            const url = event.url;

            urlChanged(url, close)
        })
    }
}
