import React, { useEffect, useMemo, useState } from 'react';

const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINITE = 60 * 1000;
const MILLIS_PER_HOUR = 60 * 60 * 1000;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const MILLIS_PER_YEAR = 24 * 60 * 60 * 365 * 1000;

interface RelativeTimeProps {
  className?: string;
  locales?: string | string[];
  updateInterval?: number;
  time: number;
}

export default function RelativeTime({
  className,
  locales = 'en',
  time,
  updateInterval = MILLIS_PER_MINITE,
}: RelativeTimeProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    return () => {
      clearInterval(timer);
    };
  }, [updateInterval]);

  const formatter = useMemo(
    () => new Intl.RelativeTimeFormat(locales),
    [locales],
  );
  const date = typeof time === 'number' ? new Date(time) : time;
  const [amount, unit] = relativeTime(date, now);
  const relativeTimeString =
    unit === 'second' && amount <= 0 ? 'now' : formatter.format(amount, unit);

  return (
    <time
      className={className}
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
    >
      {relativeTimeString}
    </time>
  );
}

function relativeTime(
  date: Date,
  now: Date,
): [number, Intl.RelativeTimeFormatUnit] {
  const delta = date.getTime() - now.getTime();

  if (Math.abs(delta) < MILLIS_PER_MINITE) {
    return [(delta / MILLIS_PER_SECOND) << 0, 'second'];
  }

  if (Math.abs(delta) < MILLIS_PER_HOUR) {
    return [(delta / MILLIS_PER_MINITE) << 0, 'minute'];
  }

  if (Math.abs(delta) < MILLIS_PER_DAY) {
    return [(delta / MILLIS_PER_HOUR) << 0, 'hour'];
  }

  if (Math.abs(delta) < MILLIS_PER_YEAR) {
    return [(delta / MILLIS_PER_DAY) << 0, 'day'];
  }

  return [date.getFullYear() - now.getFullYear(), 'year'];
}
