export interface WedataItem<T> {
    resource_url: string
    database_resource_url: string
    data: T
    created_by: string
    name: string
    created_at: string
    updated_at: string
}

export interface FoundContent {
    content: HTMLElement
    nextLink?: HTMLElement
    encoding?: string
}

export interface WedataResource<T> {
    url: string
    transformer: (items: WedataItem<T>[]) => WedataItem<T>[]
}

export const IContentFinder = class {}
export interface IContentFinder {
    find(url: string, doc: HTMLDocument): Promise<FoundContent>
}

export const IWedataGateway = class {}
export interface IWedataGateway {
    allItems<T>(resourceUrl: string): Promise<WedataItem<T>[]>
}

export const IWedataRepository = class {}
export interface IWedataRepository {
    getAll<T>(resourceUrl: string): Promise<WedataItem<T>[]>

    putAll<T>(resourceUrl: string, items: WedataItem<T>[]): Promise<void>

    deleteAll<T>(resourceUrl: string): Promise<void>
}
