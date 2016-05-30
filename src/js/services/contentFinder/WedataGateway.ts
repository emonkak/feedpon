import Inject from '../../shared/di/annotation/Inject';
import { IHttpClient } from '../http/interfaces';
import { IWedataGateway, WedataItem } from './interfaces';

@Inject
export default class WedataGateway implements IWedataGateway {
    constructor(private _httpClient: IHttpClient) {
    }

    allItems<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        const request = new Request(resourceUrl + '/items_all.json', {
            method: 'GET'
        });

        return this._httpClient.send(request)
            .then(response => response.json<WedataItem<T>[]>());
    }
}
