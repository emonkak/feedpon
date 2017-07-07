import IntlRelativeFormat from 'intl-relativeformat';
import React, { PureComponent } from 'react';

interface RelativeTimeProps {
    className?: string;
    locales?: string[];
    refreshInterval?: number;
    time: Date | number;
}

interface RelativeTimeState {
    relativeTime: string;
}

export default class RelativeTime extends PureComponent<RelativeTimeProps, RelativeTimeState> {
    static defaultProps = {
        refreshInterval: 1000 * 60
    };

    private timer: number | null = null;

    private formatter: IntlRelativeFormat;

    constructor(props: RelativeTimeProps, context: any) {
        super(props, context);

        this.formatter = new IntlRelativeFormat(props.locales);

        this.state = {
            relativeTime: this.formatter.format(props.time)
        };
    }

    componentWillMount() {
        this.startTimer(this.props.refreshInterval!);
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.locales !== nextProps.locales) {
            this.formatter = new IntlRelativeFormat(nextProps.locales);
        }

        if (this.props.time !== nextProps.time) {
            this.setState({
                relativeTime: this.formatter.format(nextProps.time)
            });
        }

        if (this.props.refreshInterval !== nextProps.refreshInterval) {
            this.stopTimer();

            this.startTimer(nextProps.refreshInterval!);

            this.setState({
                relativeTime: this.formatter.format(nextProps.time)
            });
        }
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    startTimer(refreshInterval: number) {
        this.timer = setInterval(this.refresh.bind(this), refreshInterval);
    }

    stopTimer() {
        if (this.timer != null) {
            clearInterval(this.timer);
        }
    }

    refresh() {
        const { time } = this.props;

        this.setState({
            relativeTime: this.formatter.format(time)
        });
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
}
