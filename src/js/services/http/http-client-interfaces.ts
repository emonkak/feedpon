export interface IHttpClient {
    send<T>(request: IRequest): Promise<IResponse<T>>;
}

export interface IRequest {
    method: string;
    url: string;
    params?: string | Object;
    headers?: {[key: string]: string};
    withCredentials?: boolean;
    data?: string | Object;
    timeout?: number;
    responseType?: string;
}

export interface IResponse<T> {
    data: T;
    headers: string;
    status: number;
    statusText: string;
}
