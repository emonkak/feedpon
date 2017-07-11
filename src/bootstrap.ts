import Intl from 'intl';
import objectValuesShim from 'object.values/shim';

import 'intl/locale-data/jsonp/en-US';
import 'whatwg-fetch';

objectValuesShim();

if (!(window as any).Intl) {
    (window as any).Intl = Intl;
}
