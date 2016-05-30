import Inject from '../../shared/di/annotation/Inject';
import { IWedataGateway, IWedataRepository, WedataItem, WedataResource } from './interfaces';

@Inject
export default class WedataLoader {
    private _siteinfo: { [key: string]: WedataItem<any>[] } = {};

    constructor(private _wedataGateway: IWedataGateway,
                private _wedataRepository: IWedataRepository) {
    }

    async getItems<T>(resource: WedataResource<T>): Promise<WedataItem<T>[]> {
        if (this._siteinfo[resource.url]) {
            return this._siteinfo[resource.url];
        }

        const items = await this._wedataRepository.getAll<T>(resource.url);
        if (items) {
            return this._siteinfo[resource.url] = items as any;
        }

        return await this.reloadItems<T>(resource);
    }

    async reloadItems<T>(resource: WedataResource<T>): Promise<WedataItem<T>[]> {
        const allItems = await this._wedataGateway.allItems<T>(resource.url);
        const transformedItems = resource.transformer(allItems);

        this._siteinfo[resource.url] = transformedItems;

        await this._wedataRepository.putAll(resource.url, transformedItems);

        return transformedItems;
    }
}
