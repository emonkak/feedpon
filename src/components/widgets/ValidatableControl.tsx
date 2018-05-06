import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

type SupportedControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface ValidatableControlProps {
    children: React.ReactElement<React.HTMLProps<SupportedControl>>;
    invalidClassName?: string | null;
    validClassName?: string | null;
    validations?: Validation[];
}

interface Validation {
    rule: (value: string) => boolean;
    message: string;
}

interface ValidatableControlState {
    status: 'empty' | 'valid' | 'invalid';
}

export default class ValidatableControl extends PureComponent<ValidatableControlProps, ValidatableControlState> {
    static defaultProps = {
        invalidClassName: 'has-error',
        validClassName: 'has-success'
    };

    private controlElement: SupportedControl | null = null;

    constructor(props: ValidatableControlProps) {
        super(props);

        this.state = { status: 'empty' };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: ValidatableControlProps, prevState: ValidatableControlState) {
        this._update();
    }

    render() {
        const { children, invalidClassName, validClassName } = this.props;
        const { status } = this.state;
        const child = children;

        return cloneElement(child, {
            ref: this._handleRef,
            className: classnames(
                child.props.className,
                status === 'invalid' ? invalidClassName : null,
                status === 'valid' ? validClassName : null
            ),
            onChange: this._handleChange
        });
    }

    private _update() {
        const control = this.controlElement;

        if (!control) {
            return;
        }

        if (control.value) {
            const { validations } = this.props;
            let error = '';

            if (validations) {
                for (const validation of validations) {
                    if (!validation.rule(control.value)) {
                        error = validation.message;
                        break;
                    }
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

    private _handleRef = (ref: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null): void => {
        this.controlElement = ref;
    }

    private _handleChange = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const child = this.props.children;

        if (child.props.onChange) {
            child.props.onChange(event);
        }

        this._update();
    }
}
