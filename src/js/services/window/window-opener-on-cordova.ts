import {WindowOpener, IWindowOpener} from './window-opener-interface';
import {Provide} from 'di';

@Provide(WindowOpener)
export default class WindowOpenerOnCordova implements IWindowOpener  {
    open(url: string, expectUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let authWindow = window.open(url, '_blank', 'location=no,toolbar=no');
            let resolved = false;

            authWindow.addEventListener('loadstart', (e) => {
                var url = (<any> e).url;
                if (resolved = url.indexOf(expectUrl) === 0) {
                    resolve(url);
                    authWindow.close();
                }
            });

            authWindow.addEventListener('exit', (e) => {
                if (!resolved) reject();
            });
        });
    }
}
