const SECONDS_OF_MINUTE = 60;
const MINUTES_OF_HOUR = 60;
const MILLISECONDS_OF_SECOND = 1000;
const MILLISECONDS_OF_MINUTE = SECONDS_OF_MINUTE * MILLISECONDS_OF_SECOND;
const MILLISECONDS_OF_HOUR = MINUTES_OF_HOUR * MILLISECONDS_OF_MINUTE;

export const DURATION_PATTERN = /(?:(?:([0-9]+):)?([0-5]?[0-9]):)?([0-5]?[0-9])(?:\.([0-9]{1,3}))?/;

export default function parseDuration(input: string): number {
    const matches = input.match(DURATION_PATTERN);

    if (!matches) {
        return 0;
    }

    const h = matches[1] ? parseInt(matches[1]) : 0;
    const m = matches[2] ? parseInt(matches[2]) : 0;
    const s = matches[3] ? parseInt(matches[3]) : 0;
    const ms = matches[4] ? parseInt(matches[4]) : 0;

    return h * MILLISECONDS_OF_HOUR +
           m * MILLISECONDS_OF_MINUTE +
           s * MILLISECONDS_OF_SECOND +
           ms;
}
