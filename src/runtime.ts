import Intl from 'intl';
import objectValuesShim from 'object.values/shim';
import { TextDecoder, TextEncoder } from 'text-encoding';

import 'intl/locale-data/jsonp/en-US';
import 'whatwg-fetch';

objectValuesShim();

if (!(window as any).Intl) {
    (window as any).Intl = Intl;
}

if (!(window as any).TextEncoder) {
    (window as any).TextEncoder = TextEncoder;
}

if (!(window as any).TextDecoder) {
    (window as any).TextDecoder = TextDecoder;
}
