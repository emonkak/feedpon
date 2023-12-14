const SECONDS_OF_MINUTE = 60;
const MINUTES_OF_HOUR = 60;

const MILLISECONDS_OF_SECOND = 1000;
const MILLISECONDS_OF_MINUTE = SECONDS_OF_MINUTE * MILLISECONDS_OF_SECOND;
const MILLISECONDS_OF_HOUR = MINUTES_OF_HOUR * MILLISECONDS_OF_MINUTE;

export default function formatDuration(millisecond: number): string {
    const h = Number(millisecond / MILLISECONDS_OF_HOUR);
    const m = Number(millisecond / MILLISECONDS_OF_MINUTE) % MINUTES_OF_HOUR;
    const s = Number(millisecond / MILLISECONDS_OF_SECOND) % SECONDS_OF_MINUTE;
    const ms = millisecond % MILLISECONDS_OF_SECOND;

    let str = (h > 9 ? h : '0' + h) +
              ':' +
              (m > 9 ? m : '0' + m) +
              ':' +
              (s > 9 ? s : '0' + s);

    if (ms > 0) {
        str += '.' + (ms > 99 ? ms : ms > 9 ? '0' + ms : '00' + ms);
    }

    return str;
}
