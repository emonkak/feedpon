import IRequest from './IRequest';
import IResponse from './IResponse';

export interface IHttpClient {
    send<T>(request: IRequest): Promise<IResponse<T>>;
}
