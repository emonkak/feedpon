export interface BookmarkCounts {
    [key: string]: number;
}

export interface GetEntryResponse extends Entry {
    bookmarks?: Bookmark[];
}

export interface Entry {
    count: number;
    bookmarks?: Bookmark[];
    url: string;
    eid: number;
    title: string;
    screenshot: string;
    entry_url: string;
}

export interface Bookmark {
    comment: string;
    timestamp: string;
    user: string;
    tags: string[];
}
