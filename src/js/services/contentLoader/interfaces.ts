export interface WedataItem<T> {
    resource_url: string
    database_resource_url: string
    data: T
    created_by: string
    name: string
    created_at: string
    updated_at: string
}

export const IWedataLoader = class {}
export interface IWedataLoader {
    loadItems<T>(resourceUrl: string): Promise<WedataItem<T>[]>
}

export const IWedataRepository = class {}
export interface IWedataRepository {
    getAll<T>(resourceUrl: string): Promise<WedataItem<T>[]>

    putAll<T>(resourceUrl: string, items: WedataItem<T>[]): Promise<void>

    deleteAll<T>(resourceUrl: string): Promise<void>
}
