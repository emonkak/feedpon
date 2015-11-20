export default function htmlParser(htmlText: string): HTMLDocument {
    const parser = new DOMParser()

    let html = parser.parseFromString(htmlText, 'text/html')

    if (html == null) {
        html = document.implementation.createHTMLDocument('')
        html.body.innerHTML = htmlText
    }

    return html
}
