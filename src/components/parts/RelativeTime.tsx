import React, { PureComponent } from 'react';
import moment from 'moment';

interface RelativeTimeProps {
    className?: string;
    refreshInterval?: number;
    time: string;
}

interface RelativeTimeState {
    relativeTime: string;
}

export default class RelativeTime extends PureComponent<RelativeTimeProps, RelativeTimeState> {
    static defaultProps = {
        refreshInterval: 1000 * 30
    };

    private timer: number | null = null;

    constructor(props: RelativeTimeProps, context: any) {
        super(props, context);

        this.state = {
            relativeTime: moment(props.time).fromNow()
        };
    }

    componentWillMount() {
        this.startTimer(this.props.refreshInterval!);
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.time !== nextProps.time) {
            this.setState({
                relativeTime: moment(nextProps.time).fromNow()
            });
        }

        if (this.props.refreshInterval !== nextProps.refreshInterval) {
            this.stopTimer();

            this.startTimer(nextProps.refreshInterval!);

            this.setState({
                relativeTime: moment(nextProps.time).fromNow()
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
            relativeTime: moment(time).fromNow()
        });
    }

    render() {
        const { className, time } = this.props;
        const { relativeTime } = this.state;

        return (
            <time className={className} dateTime={time} title={moment(time).format('llll')}>
                {relativeTime}
            </time>
        );
    }
}
