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
