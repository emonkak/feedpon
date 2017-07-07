import React, { PureComponent } from 'react';
import classnames from 'classnames';

interface ValidatableControlProps extends React.HTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
    component?: 'input' | 'select' | 'textarea';
    invalidClassName?: string | null;
    validClassName?: string | null;
    validations?: {
        rule: (value: string) => boolean,
        message: string
    }[];
}

interface ValidatableControlState {
    status: 'empty' | 'valid' | 'invalid';
}

export default class ValidatableControl extends PureComponent<ValidatableControlProps, ValidatableControlState> {
    static defaultProps = {
        component: 'input',
        invalidClassName: 'has-error',
        validClassName: 'has-success',
        validations: []
    };

    private controlElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

    constructor(props: ValidatableControlProps, context: any) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
        this.handleRef = this.handleRef.bind(this);

        this.state = { status: 'empty' };
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps: ValidatableControlProps, prevState: ValidatableControlState) {
        if (this.props.value !== prevProps.value) {
            this.update();
        }
    }

    update() {
        const control = this.controlElement;

        if (!control) {
            return;
        }

        if (control.value) {
            const { validations } = this.props;
            let error = '';

            for (const validation of validations!) {
                if (!validation.rule(control.value)) {
                    error = validation.message;
                    break;
                }
            }

            control.setCustomValidity(error);

            this.setState({
                status: control.validity.valid ? 'valid' : 'invalid'
            });
        } else {
            control.setCustomValidity('');

            this.setState({ status: 'empty' });
        }
    }

    handleChange(event: React.FormEvent<HTMLInputElement>) {
        const { onChange } = this.props;

        if (onChange) {
            onChange(event);
        }

        this.update();
    }

    handleRef(ref: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) {
        this.controlElement = ref;
    }

    render() {
        const {
            className,
            component,
            invalidClassName,
            validClassName,
            validations,
            ...restProps
        } = this.props;
        const { status } = this.state;

        const Component = component!;

        return (
            <Component
                {...restProps}
                ref={this.handleRef}
                className={classnames(
                    className,
                    status === 'invalid' ? invalidClassName : null,
                    status === 'valid' ? validClassName : null
                )}
                onChange={this.handleChange} />
        );
    }
}
