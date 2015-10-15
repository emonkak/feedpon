import { Inject } from '../di/annotations'

@Inject
export default class AuthService {
    authenticate(): Promise<string> {
        return new Promise((resolve) => {
            resolve('dummy credential')
        })
    }
}

    // constructor(private credentialRepository: CredentialRepository,
    //             private feedlyAuth FeedlyAuth,
    //             private clock: IClock,
    //             private windowOpener: IWindowOpener) {
    // }
    //
    // authenticate(): Promise<Credential> {
    //     return this.credentialStore.get()
    //         .then((credential) => {
    //             if (credential == null) {
    //                 // Not authenticated yet.
    //                 return this.doAuthenticate();
    //             } else if (this.isTokenExpired(credential)) {
    //                 // Require token refreshing.
    //                 return this.doRefreshToken(credential);
    //             } else {
    //                 var deferred = this.$q.defer();
    //                 deferred.resolve(credential);
    //                 return deferred.promise;
    //             }
    //         });
    // }
    //
    // expire(): Promise<void> {
    //     return this.credentialStore.delete();
    // }
    //
    // isAuthorized(): Promise<boolean> {
    //     return this.credentialStore.get()
    //         .then((credential) => {
    //             if (credential == null) {
    //                 return false;
    //             }
    //
    //             if (this.isTokenExpired(credential)) {
    //                 return false;
    //             }
    //
    //             return true;
    //         });
    // }
    //
    // private doAuthenticate(): Promise<Credential> {
    //     return this.feedlyAuth
    //         .authenticate({
    //             client_id: 'feedly',
    //             redirect_uri: 'http://localhost',
    //             scope: 'https://cloud.feedly.com/subscriptions',
    //             response_type: 'code'
    //         }, this.windowOpener)
    //         .then((response) => {
    //             return this.feedlyAuth.exchangeToken({
    //                 code: response.code,
    //                 client_id: 'feedly',
    //                 client_secret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
    //                 redirect_uri: 'http://www.feedly.com/feedly.html',
    //                 grant_type: 'authorization_code'
    //             });
    //         })
    //         .then((response) => {
    //             let credential = {
    //                 authorized: this.clock.now(),
    //                 body: response
    //             };
    //
    //             return this.credentialStore.put(credential).then(() => credential);
    //         });
    // }
    //
    // private doRefreshToken(credential: Credential): Promise<Credential> {
    //     return this.feedlyAuth.refreshToken({
    //             refresh_token: credential.refresh_token,
    //             client_id: 'feedly',
    //             client_secret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
    //             grant_type: 'refresh_token',
    //         })
    //         .then((response) => {
    //             let newCredential = {
    //                 authorized: this.clock.now(),
    //                 body: objectAssign({}, credential.body, response);
    //             };
    //
    //             return this.credentialStore.put(newCredential)
    //                 .then<Credential>(() => newCredential);
    //         });
    // }
    //
    // private isTokenExpired(credential: Credential): boolean {
    //     return credential.created + (credential.body.expires_in * 1000) <
    //         this.clock.now();
    // }
