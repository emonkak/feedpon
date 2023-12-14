const MILIS_PER_SECOND = 1000;
const MILIS_PER_MINITE = 60 * 1000;
const MILIS_PER_HOUR = 60 * 60 * 1000;
const MILIS_PER_DAY = 24 * 60 * 60 * 1000;

export default function relativeTime(date: Date, now?: Date): [number, Intl.RelativeTimeFormatUnit] {
    if (!now) {
        now = new Date();
    }

    const delta = date.getTime() - now.getTime();

    if (Math.abs(delta) < MILIS_PER_MINITE) {
        return [(delta / MILIS_PER_SECOND) << 0, 'second'];
    }

    if (Math.abs(delta) < MILIS_PER_HOUR) {
        return [(delta / MILIS_PER_MINITE) << 0, 'minute'];
    }

    if (Math.abs(delta) < MILIS_PER_DAY) {
        return [(delta / MILIS_PER_HOUR) << 0, 'hour'];
    }

    return [(delta / MILIS_PER_DAY) << 0, 'day'];
}
