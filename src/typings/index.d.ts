/// <reference path="./cordova-plugins.d.ts" />
/// <reference path="./readability.d.ts" />
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
