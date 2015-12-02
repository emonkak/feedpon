/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />

declare module "iconv-lite" {
    namespace Iconv {
        var encodings: { [key: string]: string }

        var defaultCharUnicode: string

        var defaultCharSingleByte: string

        function encode(str: string, encoding: string, options?: any): Buffer|Uint8Array

        function decode(buffer: Buffer|Uint8Array, encoding: string, options?: any): string

        function encodingExists(enconding: string): boolean
    }

    export default Iconv
}
