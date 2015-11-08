import { IWindowOpener } from './interfaces'
import { Inject } from '../../di/annotations'

@Inject
export default class ChromeWindowOpener implements IWindowOpener {
    open(url: string, urlChanged: (url: string, close: () => void) => void): void {
        // TODO: Use Modal
        const webview = document.createElement('webview') as any
        webview.src = url

        function close() {
            webview.parentNode && webview.parentNode.removeChild(webview)
        }

        webview.addEventListener('loadredirect', (event: any) => {
            urlChanged(event.newUrl, close)
        })

        document.body.appendChild(webview)
    }
}
