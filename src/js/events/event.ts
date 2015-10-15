export default class Event<T> {
    private listeners = [];

    emit(payload: T): void {
        for (let i = 0, l = this.listeners.length; i < l; i++) {
            this.listeners[i](value);
        }
    }

    on(listener: (T) => void): void {
        this.listeners.add(listener);
    }

    off(listener: (T) => void): void {
        let index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
}
