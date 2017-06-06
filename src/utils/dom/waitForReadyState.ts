export default function waitForReadyState(document: Document, readyState: 'loding' | 'interactive' | 'complete', callback: () => void) {
    function onReadyStateChange() {
        if (document.readyState === readyState) {
            callback();

            document.removeEventListener('readystatechange', onReadyStateChange);
        }
    }

    document.addEventListener('readystatechange', onReadyStateChange);

    onReadyStateChange();
}
