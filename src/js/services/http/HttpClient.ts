import { IHttpClient } from './interfaces';
import Inject from '../../shared/di/annotation/Inject';

@Inject
export default class HttpClient implements IHttpClient {
    send(request: Request): Promise<Response> {
        return fetch(request)
            .then(response => response.ok ? response as any : Promise.reject(response));
    }
}
