import { IWedataGateway, IWedataRepository, WedataItem, WedataResource } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class WedataLoader {
    private siteinfo: { [key: string]: WedataItem<any>[] } = {}

    constructor(private wedataGateway: IWedataGateway,
                private wedataRepository: IWedataRepository) {
    }

    getItems<T>(resource: WedataResource<T>): Promise<WedataItem<T>[]> {
        if (this.siteinfo[resource.url]) {
            return Promise.resolve(this.siteinfo[resource.url])
        }

        return this.wedataRepository.getAll<T>(resource.url)
            .then(items => (this.siteinfo[resource.url] = items as any) || this.reloadItems<T>(resource))
    }

    reloadItems<T>(resource: WedataResource<T>): Promise<WedataItem<T>[]> {
        return this.wedataGateway.allItems<T>(resource.url)
            .then(resource.transformer)
            .then(items => this.wedataRepository.putAll(resource.url, items).then(() => items))
            .then(items => this.siteinfo[resource.url] = items)
    }
}
