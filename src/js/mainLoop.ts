import Store from './store'

type Renderer<T> = (element: HTMLElement, state: T) => void

export default function mainLoop<T>(element: HTMLElement, store: Store<T>, renderer: Renderer<T>) {
    store.subscribe(state => renderer(element, state))

    renderer(element, store.getState())
}
