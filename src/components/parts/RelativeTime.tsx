import React, { PropTypes, PureComponent } from 'react';
import moment from 'moment';

interface Props {
    time: string;
    refreshInterval?: number;
}

interface State {
    relativeTime: string;
}

export default class RelativeTime extends PureComponent<Props, State> {
    static propTypes = {
        time: PropTypes.string.isRequired,
        refreshInterval: PropTypes.number.isRequired
    };

    static defaultProps = {
        refreshInterval: 1000 * 30
    };

    private timer: number | null;

    constructor(props: any, context: any) {
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
        const { time } = this.props;
        const { relativeTime } = this.state;

        return (
            <time dateTime={time} title={moment(time).format('llll')}>
                {relativeTime}
            </time>
        );
    }
}
