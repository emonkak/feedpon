import { createComponent, html } from 'barebind';
import { CentralClock } from '../../foundation/central-clock.ts';

const UNITS = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const;

export interface RelativeTimeProps {
  timeMillis: number;
  class?: string;
}

export const RelativeTime = createComponent(function RelativeTime({
  timeMillis,
  class: className,
}: RelativeTimeProps) {
  const clock = this.inject(CentralClock);
  const currentTime = this.use(clock);
  const dateTimeFormat = this.inject(Intl.DateTimeFormat);
  const relativeTimeFormat = this.inject(Intl.RelativeTimeFormat);

  const timeZone = dateTimeFormat.resolvedOptions().timeZone;
  const currentDate =
    Temporal.Instant.fromEpochMilliseconds(currentTime).toZonedDateTimeISO(
      timeZone,
    );
  const targetDate = Temporal.Instant.fromEpochMilliseconds(
    timeMillis - (timeMillis % clock.resolutionMillis),
  ).toZonedDateTimeISO(timeZone);

  return html`
    <time
      class=${className}
      datetime=${targetDate.toString()}
      title=${dateTimeFormat.format(targetDate.toInstant())}
    >
      ${getRelativeTimeString(currentDate, targetDate, relativeTimeFormat)}
    </time>
  `;
});

function getRelativeTimeString(
  currentDate: Temporal.ZonedDateTime,
  targetDate: Temporal.ZonedDateTime,
  relativeTimeFormat: Intl.RelativeTimeFormat,
): string {
  for (const unit of UNITS) {
    const duration = targetDate.since(currentDate, { smallestUnit: unit });
    const amount = duration[unit];
    if (amount !== 0) {
      return relativeTimeFormat.format(amount, unit);
    }
  }
  return relativeTimeFormat.format(0, 'second');
}
