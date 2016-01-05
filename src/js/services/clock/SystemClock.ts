import { IClock } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class SystemClock implements IClock {
    now() {
        return Date.now()
    }
}
