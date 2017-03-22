import React, { PropTypes, PureComponent } from 'react';
import moment from 'moment';

export default class RelativeTime extends PureComponent<any, any> {
    static propTypes = {
        time: PropTypes.string.isRequired,
        interval: PropTypes.number.isRequired
    };

    static defaultProps = {
        interval: 1000 * 30
    };

    private timer: number;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            relativeTime: null
        };
    }

    componentWillMount() {
        this.timer = setInterval(this.update.bind(this), this.props.interval)

        this.update();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    update() {
        const { time } = this.props;

        this.setState({
            relativeTime: moment(time).fromNow()
        });
    }

    render() {
        const { time } = this.props;
        const { relativeTime } = this.state;

        return (
            <time dateTime={time}>{relativeTime}</time>
        );
    }
}
