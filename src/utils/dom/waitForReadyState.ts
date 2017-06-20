export default function waitForReadyState(document: Document, expectedReadyStates: string[], callback: () => void) {
    function onReadyStateChange() {
        if (expectedReadyStates.includes(document.readyState)) {
            callback();

            document.removeEventListener('readystatechange', onReadyStateChange);
        }
    }

    document.addEventListener('readystatechange', onReadyStateChange);

    onReadyStateChange();
}
