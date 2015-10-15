import {HttpClient, IHttpClient} from 'services/http/IHttpClient';
import {Inject} from 'di';
import * from './feedly-interfaces';

@Inject(HttpClient)
export default class FeedlyGateway {
    constructor(private httpClient: IHttpClient) {
    }

    allCategories(): Promise<Category[]> {
        return this.doGet('/v3/categories');
    }

    deleteCategory(categoryId: string): Promise<string> {
        return this.doDelete('/v3/categories/' + categoryId);
    }

    getFeed(feedId: string): Promise<Feed> {
        return this.doGet('/v3/feeds/' + feedId);
    }

    allUnreadCounts(input: UnreadCountsInput = {}): Promise<UnreadCountsResponce> {
        return this.doGet('/v3/markers/counts', input);
    }

    markAsReadForEntries(entryIds: any): Promise<void> {
        if (!Array.isArray(entryIds)) entryIds = [entryIds];

        return this.doPost<void>('/v3/markers', {
            action: 'markAsRead',
            type: 'entries',
            entryIds: entryIds
        });
    }

    markAsReadForFeeds(feedIds: any): Promise<void> {
        if (!Array.isArray(feedIds)) feedIds = [feedIds];

        return this.doPost<void>('/v3/markers', {
            action: 'markAsRead',
            type: 'feeds',
            feedIds: feedIds
        });
    }

    markAsReadForCetegories(categoryIds: any): Promise<void> {
        if (!Array.isArray(categoryIds)) categoryIds = [categoryIds];

        return this.doPost<void>('/v3/markers', {
            action: 'markAsRead',
            type: 'categories',
            categoryIds: categoryIds
        });
    }

    keepUnreadForEntries(entryIds: any): Promise<void> {
        if (!Array.isArray(entryIds)) entryIds = [entryIds];

        return this.doPost<void>('/v3/markers', {
            action: 'keepUnread',
            type: 'entries',
            entryIds: entryIds
        });
    }

    keepUnreadForFeeds(feedIds: any): Promise<void> {
        if (!Array.isArray(feedIds)) feedIds = [feedIds];

        return this.doPost<void>('/v3/markers', {
            action: 'keepUnread',
            type: 'feeds',
            feedIds: feedIds
        });
    }

    keepUnreadForCetegories(categoryIds: any): Promise<void> {
        if (!Array.isArray(categoryIds)) categoryIds = [categoryIds];

        return this.doPost<void>('/v3/markers', {
            action: 'keepUnread',
            type: 'categories',
            categoryIds: categoryIds
        });
    }

    getEntryIds(input: GetStreamInput): Promise<GetEntryIdsResponse> {
        return this.doGet('/v3/streams/ids', input);
    }

    getContents(input: GetStreamInput): Promise<Contents> {
        return this.doGet('/v3/streams/contents', input);
    }

    allSubscriptions(): Promise<Subscription[]> {
        return this.doGet('/v3/subscriptions');
    }

    private doGet<T>(path: string, data?: any): Promise<T> {
        return this.httpClient.send({
            method: 'GET',
            params: data,
            responseType: 'json',
            url: this.feedlyEndPoint + path,
        })
    }

    private doPost<T>(path: string, data?: any): Promise<T> {
        return this.httpClient.send({
            data: data,
            method: 'POST',
            responseType: 'json',
            url: this.feedlyEndPoint + path,
        });
    }

    private doDelete<T>(path: string, data?: any): Promise<T> {
        return this.httpClient.send({
            data: data,
            method: 'DELETE',
            responseType: 'json',
            url: this.feedlyEndPoint + path,
        });
    }
}
