import Intl from 'intl';
import 'intl/locale-data/jsonp/en-US';

if (!(window as any).Intl) {
    (window as any).Intl = Intl;
}
