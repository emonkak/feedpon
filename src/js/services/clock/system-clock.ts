import {Clock IClock} from './clock-interface';
import {Provide} from 'di';

@Provide(Clock)
export default class SystemClock implements IClock {
    now() {
        return Date.now();
    }
}
