import {WindowOpener, IWindowOpener} from './window-opener-interface';
import {Provide} from 'di';

const template = `
<ion-modal-view>
  <webview ng-src="{{url}}" on-loadredirect="onLoadredirect($event)">
  </webview>
</ion-modal-view>
`;

@Provide(WindowOpener)
export default class WindowOpenerOnChrome implements IWindowOpener {
    open(url: string, expectUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let modal = $ionicModal.fromTemplate(template);

            let scope = modal.scope;
            scope.url = url;
            scope.onLoadredirect = function onLoadredirect($event: any) {
                if ($event.newUrl.indexOf(expectUrl) === 0) {
                    resolve($event.newUrl);
                    modal.remove();
                }
            };
            scope.$on('$destroy', function onDestroy() {
                reject();
            });

            modal.show();
        });
    }
}
