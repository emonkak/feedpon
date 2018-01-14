/// <reference path="./cordova-plugins.d.ts" />
/// <reference path="./fbjs.d.ts" />
/// <reference path="./intl-relativeformat.d.ts" />
/// <reference path="./intl.d.ts" />
/// <reference path="./object.values.d.ts" />
/// <reference path="./requestIdleCallback.d.ts" />

declare var process: {
  env: {
    NODE_ENV: string
  }
};

declare module '*.json' {
  const value: any;

  export default value;
}
