import React, { PureComponent } from 'react';

interface MenuFormProps {
    onSubmit?: () => void;
}

export default class MenuForm extends PureComponent<MenuFormProps, {}> {
    constructor(props: MenuFormProps, context: any) {
        super(props, context);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleSubmit(event: React.FormEvent<any>) {
        event.preventDefault();

        const { onSubmit } = this.props;

        if (onSubmit) {
            onSubmit();
        }
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        event.stopPropagation();
    }

    render() {
        const { children } = this.props;

        return (
            <form
                className="menu-form"
                onKeyDown={this.handleKeyDown}
                onSubmit={this.handleSubmit}>
                {children}
            </form>
        );
    }
}

