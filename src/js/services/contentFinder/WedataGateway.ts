import { IHttpClient } from '../http/interfaces'
import { IWedataGateway, WedataItem } from './interfaces'
import { Inject } from '../../di/annotations'

@Inject
export default class WedataGateway implements IWedataGateway {
    constructor(private httpClient: IHttpClient) {
    }

    allItems<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        const request = new Request(resourceUrl + '/items_all.json', {
            method: 'GET'
        })

        return this.httpClient.send(request)
            .then(response => response.json<WedataItem<T>[]>())
    }
}
