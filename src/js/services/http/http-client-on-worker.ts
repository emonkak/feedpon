import "reflect-metadata";

import { IHttpClient, IRequest, IResponse } from './http-client-interface';

export default class HttpClientOnWorker implements IHttpClient {
    private worker: Worker;

    private tasks: { [key: string]: IDeferred<any> } = {};

    private sequence: number = 0;

    constructor() {
        this.worker = new Worker('js/xhr-worker.js');
        this.worker.onmessage = this.handleMessage.bind(this);
    }

    send<T>(request: IRequest): Promise<IResponse<T>> {
        const id = this.sequence++;
        const promise = new Promise((resolve, reject) => {
            this.tasks[id] = {
                resolve: resolve,
                reject: reject
            };
        });

        this.worker.postMessage({
            id: id,
            request: request
        });

        return promise;
    }

    private handleMessage(e: MessageEvent): void {
        const message = e.data;
        if (message == null) return;

        const id = message.id;
        const task = this.tasks[id];
        if (task == null) return;

        const response = message.response,
        if (response.success) {
            task.resolve(response);
        } else {
            task.reject(response);
        }

        delete this.tasks[id];
    }
}

interface IDeferred<T> {
    resolve(value?: T | Promise<T>): void;
    reject(reason?: any): void;
}
