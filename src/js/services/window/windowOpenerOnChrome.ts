import { IWindowOpener } from './interfaces'
import { Inject } from '../../di/annotations'

const template = `
<ion-modal-view>
  <webview ng-src="{{url}}" on-loadredirect="onLoadredirect($event)">
  </webview>
</ion-modal-view>
`;

@Inject
export default class WindowOpenerOnChrome implements IWindowOpener {
    open(url: string, urlChanged: (url: string, close: () => void) => void): void {
        // return new Promise((resolve, reject) => {
        //     let modal = $ionicModal.fromTemplate(template);
        //
        //     let scope = modal.scope;
        //     scope.url = url;
        //     scope.onLoadredirect = function onLoadredirect($event: any) {
        //         if ($event.newUrl.indexOf(expectUrl) === 0) {
        //             resolve($event.newUrl);
        //             modal.remove();
        //         boolean.$on('$destroy', function onDestroy() {
        //         reject();
        //     });
        //
        //     modal.show();
        // });
    }
}
