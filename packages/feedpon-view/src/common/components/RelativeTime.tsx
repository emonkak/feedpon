import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import React, { useEffect, useMemo, useState } from 'react';

const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINITE = 60 * 1000;
const MILLIS_PER_HOUR = 60 * 60 * 1000;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const MILLIS_PER_YEAR = 24 * 60 * 60 * 365 * 1000;

interface RelativeTimeProps {
  class?: string;
  locales?: string | string[];
  updateInterval?: number;
  time: number;
}

export function RelativeTime(
  {
    class: className,
    locales = 'en',
    time,
    updateInterval = MILLIS_PER_MINITE,
  }: RelativeTimeProps,
  context: RenderContext,
): TemplateResult {
  const [now, setNow] = context.useState(() => new Date());

  context.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    return () => {
      clearInterval(timer);
    };
  }, [updateInterval]);

  const formatter = context.useMemo(
    () => new Intl.RelativeTimeFormat(locales),
    [locales],
  );
  const date = typeof time === 'number' ? new Date(time) : time;
  const [amount, unit] = relativeTime(date, now);
  const relativeTimeString =
    unit === 'second' && amount <= 0 ? 'now' : formatter.format(amount, unit);

  return context.html`
    <time
      class=${className}
      datetime=${date.toISOString()}
      title=${date.toLocaleString()}
    >
      ${relativeTimeString}
    </time>
  `;
}

export interface ReactRelativeTimeProps {
  className?: string;
  locales?: string | string[];
  updateInterval?: number;
  time: number;
}

export function ReactRelativeTime({
  className,
  locales = 'en',
  time,
  updateInterval = MILLIS_PER_MINITE,
}: ReactRelativeTimeProps) {
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
