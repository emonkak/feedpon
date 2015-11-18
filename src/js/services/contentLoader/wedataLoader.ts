import { IWedataLoader, WedataItem } from './interfaces.ts'
import { IHttpClient } from '../http/interfaces.ts'
import { Inject } from '../../di/annotations'

@Inject
export default class WedataLoader implements IWedataLoader {
    constructor(private httpClient: IHttpClient) {
    }

    loadItems<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        const request = new Request(resourceUrl + '/items_all.json', {
            method: 'GET'
        })

        return this.httpClient.send(request)
            .then(response => response.json<WedataItem<T>[]>())
    }
}
