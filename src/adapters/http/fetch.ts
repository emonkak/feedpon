export default function fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return typeof cordova === 'object' ?
        cordova.plugins.fetch(input, init) :
        window.fetch(input, init);
}
