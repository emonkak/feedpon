/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />

declare module "iconv-lite" {
    namespace Iconv {
        var encodings: { [key: string]: string }

        var defaultCharUnicode: string

        var defaultCharSingleByte: string

        function encode(str: string, encoding: string, options?: any): Buffer

        function decode(buffer: Buffer, encoding: string, options?: any): string

        function encodingExists(enconding: string): boolean
    }

    export default Iconv
}
