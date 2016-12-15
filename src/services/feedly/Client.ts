import * as feedly from './types';

export default class Client {
    constructor(private _endPoint: string = 'https://cloud.feedly.com/') {
    }

    async authenticate(input: feedly.AuthenticateInput, open: (url: string) => Promise<string>): Promise<feedly.AuthenticateResponse> {
        const redirectUrl = await open(this._endPoint + 'v3/auth/auth?' + queryString(input))

        const matchesForCode = redirectUrl.match(/[?&]code=([^&]*)/);
        const matchesForState = redirectUrl.match(/[?&]state=([^&]*)/);
        if (matchesForCode) {
            return {
                code: matchesForCode[1],
                state: matchesForState ? matchesForState[1] : null
            };
        }

        const matchesForError = redirectUrl.match(/[?&]error=([^&]*)/);
        if (matchesForError) {
            throw new Error('Authentication failed: ' + matchesForError[1]);
        }

        throw new Error('Authentication failed');
    }

    exchangeToken(input: feedly.ExchangeTokenInput): Promise<feedly.ExchangeTokenResponse> {
        return this.doPost('v3/auth/token', input);
    }

    refreshToken(input: feedly.RefreshTokenInput): Promise<feedly.RefreshTokenResponse> {
        return this.doPost('v3/auth/token', input);
    }

    revokeToken(input: feedly.RevokeTokenInput): Promise<feedly.RevokeTokenResponse> {
        return this.doPost('v3/auth/token', input);
    }

    allCategories(accessToken: string): Promise<feedly.Category[]> {
        return this.doGet('v3/categories', null, toAuthHeader(accessToken));
    }

    deleteCategory(accessToken: string, categoryId: string): Promise<string> {
        return this.doDelete('v3/categories/' + categoryId, null, toAuthHeader(accessToken));
    }

    getFeed(accessToken: string, feedId: string): Promise<feedly.Feed> {
        return this.doGet('v3/feeds/' + feedId, null, toAuthHeader(accessToken));
    }

    allUnreadCounts(accessToken: string, input: feedly.GetUnreadCountsInput = {}): Promise<feedly.GetUnreadCountsResponce> {
        return this.doGet('v3/markers/counts', input, toAuthHeader(accessToken));
    }

    markAsReadForEntries(accessToken: string, entryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'markAsRead',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        }, toAuthHeader(accessToken));
    }

    markAsReadForFeeds(accessToken: string, feedIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'markAsRead',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        }, toAuthHeader(accessToken));
    }

    markAsReadForCetegories(accessToken: string, categoryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'markAsRead',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        }, toAuthHeader(accessToken));
    }

    keepUnreadForEntries(accessToken: string, entryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'keepUnread',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        }, toAuthHeader(accessToken));
    }

    keepUnreadForFeeds(accessToken: string, feedIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'keepUnread',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        }, toAuthHeader(accessToken));
    }

    keepUnreadForCetegories(accessToken: string, categoryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'keepUnread',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        }, toAuthHeader(accessToken));
    }

    getEntryIds(accessToken: string, input: feedly.GetStreamInput): Promise<feedly.GetEntryIdsResponse> {
        return this.doGet('v3/streams/ids', input, toAuthHeader(accessToken));
    }

    getEntryContents(accessToken: string, input: feedly.GetStreamInput): Promise<feedly.Contents> {
        return this.doGet('v3/streams/contents', input, toAuthHeader(accessToken));
    }

    allSubscriptions(accessToken: string): Promise<feedly.Subscription[]> {
        return this.doGet('v3/subscriptions', null, toAuthHeader(accessToken));
    }

    private async doGet<T>(path: string, params?: { [key: string]: any }, headers?: { [key: string]: string }): Promise<T> {
        const url = this._endPoint + path + queryString(params);
        const request = new Request(url, {
            method: 'GET',
            headers
        });

        const response = await fetch(request);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    private async doPost<T>(path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
        const url = this._endPoint + path;
        const request = new Request(url, {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
            body: data ? JSON.stringify(data) : null
        });

        const response = await fetch(request);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    private async doDelete<T>(path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
        const url = this._endPoint + path;
        const request = new Request(url, {
            method: 'DELETE',
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
            body: data ? JSON.stringify(data) : null
        });

        const response = await fetch(request);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
}

function queryString(params: any): string {
    if (params == null) {
        return '';
    }

    const parts = Object.keys(params).map(key =>
        key + '=' + encodeURIComponent(params[key])
    );

    return parts.length > 0 ? '?' + parts.join('&') : '';
}

function toAuthHeader(accessToken: string): { [key: string]: string } {
    return {
        'Authorization': 'OAuth ' + accessToken
    };
}
