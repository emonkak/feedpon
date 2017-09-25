/// <reference path="./fastclick.d.ts" />
/// <reference path="./fbjs.d.ts" />
/// <reference path="./intl-relativeformat.d.ts" />
/// <reference path="./intl.d.ts" />
/// <reference path="./object.values.d.ts" />

interface RequestIdleCallback {
    didTimeout: boolean;
    timeRemaining(): number;
}

interface RequestIdleOptions {
    timeout?: number;
}

interface Window {
    cancelIdleCallback(id: number): void;
    requestIdleCallback(callback: (deadline: RequestIdleCallback) => void, options?: RequestIdleOptions): number;
}

declare var process: {
  env: {
    NODE_ENV: string
  }
};

declare module '*.json' {
  const value: any;

  export default value;
}
