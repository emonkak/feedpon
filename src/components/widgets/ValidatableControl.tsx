import React, { PureComponent, Children,  cloneElement } from 'react';
import classnames from 'classnames';

import createChainedFunction from 'utils/createChainedFunction';

interface ValidatableControlProps {
    children: React.ReactElement<any>;
    component?: 'input' | 'select' | 'textarea';
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
        component: 'input',
        invalidClassName: 'has-error',
        validClassName: 'has-success'
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
        this.update();
    }

    update() {
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

    handleChange(event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        this.update();
    }

    handleRef(ref: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) {
        this.controlElement = ref;
    }

    renderChild(child: React.ReactElement<any>) {
        const { invalidClassName, validClassName } = this.props;
        const { status } = this.state;

        return cloneElement(child, {
            ...child.props,
            ref: createChainedFunction((child as any).ref, this.handleRef),
            className: classnames(
                child.props.className,
                status === 'invalid' ? invalidClassName : null,
                status === 'valid' ? validClassName : null
            ),
            onChange: createChainedFunction(child.props.onChange, this.handleChange)
        });
    }

    render() {
        return this.renderChild(Children.only(this.props.children));
    }
}
