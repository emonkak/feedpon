export default function removeFromArray<T>(array: Array<T>, element: T): void {
    var index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
