import {HttpClient, IHttpClient} from 'services/http/IHttpClient';
import {Inject} from 'di';
import * from './feedly-interfaces';

@Inject(HttpClient)
export default class FeedlyAuth {
    constructor(private httpClient: IHttpClient) {
    }

    authenticate(input: AuthenticateInput, windowOpener: IWindowOpener): Promise<AuthenticateResponse> {
        var escape = encodeURIComponent;
        var authUrl = this.feedlyEndPoint + '/v3/auth/auth' +
            '?response_type=' + escape(input.response_type) +
            '&client_id=' + escape(input.client_id) +
            '&redirect_uri=' + escape(input.redirect_uri) +
            '&scope=' + escape(input.scope) +
            (input.state != null ? '&state=' + escape(input.state) : '');

        return windowOpener(authUrl, input.redirect_uri).then((url) => {
            var deferred = this.$q.defer();
            var matchesForCode = url.match(/[?&]code=([^&]*)/);
            var matchesForState = url.match(/[?&]state=([^&]*)/);

            if (matchesForCode) {
                deferred.resolve({
                    code: matchesForCode[1],
                    state: matchesForState ? matchesForState[1] : null
                });
            } else {
                var matchesForError = url.match(/[&?]error=([^&]+)/);
                if (matchesForError) {
                    deferred.reject({
                        code: matchesForCode[1],
                        state: matchesForState ? matchesForState[1] : null
                    });
                }
            }

            return deferred.promise;
        })
    }

    exchangeToken(input: ExchangeTokenInput): Promise<ExchangeTokenResponse> {
        return this.doPost('/v3/auth/token', input);
    }

    refreshToken(input: RefreshTokenInput): Promise<RefreshTokenResponse> {
        return this.doPost('/v3/auth/token', input);
    }

    revokeToken(input: RevokeTokenInput): Promise<RevokeTokenResponse> {
        return this.doPost('/v3/auth/token', input);
    }

    private doPost<T>(path: string, data?: any): Promise<T> {
        return this.httpClient.request({
                data: data,
                method: 'POST',
                responseType: 'json',
                url: this.feedlyEndPoint + path
            })
            .then((response) => response.data);
    }
}
