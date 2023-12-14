export interface WedataItem<T> {
    resource_url: string;
    database_resource_url: string;
    data: T;
    created_by: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface AutoPagerizeData {
    url: string;
    nextLink: string;
    pageElement: string;
    exampleUrl?: string;
    insertBefore?: string;
}

export interface LDRFullFeedData {
    url: string;
    xpath: string;
    type: string;
    enc?: string;
    microformats?: string;
    base?: string;
}
