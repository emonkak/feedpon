export interface IResponse<T> {
    data: T;
    headers: string;
    status: number;
    statusText: string;
}
