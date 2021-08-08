import React, { PureComponent } from 'react';
import relativeTime from 'utils/relativeTime';

interface RelativeTimeProps {
    className?: string;
    locales?: string | string[];
    updateInterval?: number;
    time: number;
}

interface RelativeTimeState {
    formatter: Intl.RelativeTimeFormat;
    prevLocales?: string | string[];
    prevTime: number;
    relativeTime: string;
}

export default class RelativeTime extends PureComponent<RelativeTimeProps, RelativeTimeState> {
    static defaultProps = {
        locales: 'en',
        updateInterval: 1000 * 60
    };

    private timer: number | null = null;

    static getDerivedStateFromProps(props: RelativeTimeProps, state: RelativeTimeState) {
        const updates: Partial<RelativeTimeState> = {};
        let hasUpdated = false;

        if (props.locales !== state.prevLocales) {
            updates.formatter = new Intl.RelativeTimeFormat(props.locales);
            updates.prevLocales = props.locales;
            hasUpdated = true;
        }

        if (props.time !== state.prevTime) {
            updates.relativeTime = formatTime((updates.formatter || state.formatter), props.time);
            updates.prevTime = props.time;
            hasUpdated = true;
        }

        return hasUpdated ? updates : null;
    }

    constructor(props: RelativeTimeProps) {
        super(props);

        const formatter = new Intl.RelativeTimeFormat(props.locales);

        this.state = {
            formatter,
            prevLocales: props.locales,
            prevTime: props.time,
            relativeTime: formatTime(formatter, props.time)
        };
    }

    componentDidMount() {
        this.startTimer(this.props.updateInterval!);
    }

    componentDidUpdate(prevProps: RelativeTimeProps, prevState: RelativeTimeState) {
        const { updateInterval } = this.props;

        if (updateInterval !== prevProps.updateInterval) {
            this.restartTimer(updateInterval!);
        }
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    render() {
        const { className, time } = this.props;
        const { relativeTime } = this.state;

        const date = typeof time === 'number' ? new Date(time) : time;

        return (
            <time className={className} dateTime={date.toISOString()} title={date.toLocaleString()}>
                {relativeTime}
            </time>
        );
    }

    private startTimer(updateInterval: number) {
        this.timer = window.setInterval(this.update.bind(this), updateInterval);
    }

    private stopTimer() {
        if (this.timer != null) {
            window.clearInterval(this.timer);
        }
    }

    private restartTimer(updateInterval: number) {
        this.stopTimer();
        this.startTimer(updateInterval);
        this.update();
    }

    private update() {
        const { time } = this.props;
        const { formatter } = this.state;

        this.setState({
            relativeTime: formatTime(formatter, time)
        });
    }
}

function formatTime(formatter: Intl.RelativeTimeFormat, time: number): string {
    const [amount, type] = relativeTime(new Date(time));
    return formatter.format(amount, type);
}
