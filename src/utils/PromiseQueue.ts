export default class PromiseQueue<T> {
    private readonly executing: Set<Promise<void>> = new Set();

    private readonly pending: (() => Promise<T>)[] = [];

    private readonly results: T[] = [];

    private readonly errors: any[] = [];

    constructor(private readonly concurrency: number) {
    }

    enqueue(job: () => Promise<T>) {
        if (this.executing.size < this.concurrency) {
            this.invoke(job);
        } else {
            this.pending.push(job);
        }
    }

    getResults(): Promise<{ results: T[],  errors: any[] }> {
        return this.executing.size > 0
            ? Promise.all(this.executing).then(() => this.getResults())
            : Promise.resolve(({ results: this.results, errors: this.errors }));
    }

    private invoke(job: () => Promise<T>): void {
        const promise = job().then(
            (value) => {
                this.results.push(value);
                this.executing.delete(promise);
                this.dequeue();
            },
            (error) => {
                this.errors.push(error);
                this.executing.delete(promise);
                this.dequeue();
            }
        );
        this.executing.add(promise);
    }

    private dequeue(): void {
        const job = this.pending.shift();
        if (job) {
            this.invoke(job);
        }
    }
}
