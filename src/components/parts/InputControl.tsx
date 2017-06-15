import React, { PureComponent } from 'react';
import classnames from 'classnames';

interface InputControlProps extends React.HTMLAttributes<HTMLInputElement> {
    errorClassName?: string | null;
    successClassName?: string | null;
    validations?: { rule: (value: string) => boolean, message: string }[];
}

interface InputControlState {
    status: 'empty' | 'valid' | 'invalid';
}

export default class InputControl extends PureComponent<InputControlProps, InputControlState> {
    static defaultProps = {
        errorClassName: 'has-error',
        successClassName: 'has-success',
        validations: []
    };

    private inputElement: HTMLInputElement;

    constructor(props: InputControlProps, context: any) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);

        this.state = { status: 'empty' };
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps: InputControlProps, prevState: InputControlState) {
        if (this.props.value !== prevProps.value) {
            this.update();
        }
    }

    update() {
        const input = this.inputElement;

        if (input.value) {
            const { validations } = this.props;
            let error = '';

            for (const validation of validations!) {
                if (!validation.rule(input.value)) {
                    error = validation.message;
                    break;
                }
            }

            input.setCustomValidity(error);

            this.setState({
                status: input.validity.valid ? 'valid' : 'invalid'
            });
        } else {
            input.setCustomValidity('');

            this.setState({ status: 'empty' });
        }
    }

    handleChange(event: React.FormEvent<HTMLInputElement>) {
        this.update();

        const { onChange } = this.props;

        if (onChange) {
            onChange(event);
        }
    }

    render() {
        const { className, errorClassName, successClassName, validations, ...restProps } = this.props;
        const { status } = this.state;

        return (
            <input
                {...restProps}
                ref={(element) => this.inputElement = element}
                className={classnames(className, {
                    [successClassName!]: status === 'valid',
                    [errorClassName!]: status === 'invalid'
                })}
                onChange={this.handleChange} />
        );
    }
}
