declare module 'readability' {
    class Readability {
        constructor(documentOrOptions: Document | ReadabilityOptions);
        parse(): Article | undefined;
    }

    interface ReadabilityOptions {
        documentElement: Document;
        debug: boolean;
        maxElemsToParse: number;
        nbTopCandidates: number;
        charThreshold: number;
        classesToPreserve: string[];
    }

    interface Article {
        title: string;
        content: string;
        length: number;
        excerpt: string;
        byline: string;
        dir: string;
    }

    export = Readability;
}
