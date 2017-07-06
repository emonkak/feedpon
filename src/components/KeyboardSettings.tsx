import React, { PureComponent } from 'react';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';
import { changeScrollAmount } from 'messaging/keyMappings/actions';

interface KeyboardSettingsProps {
    scrollAmount: number;
    onChangeScrollAmount: typeof changeScrollAmount;
}

interface KeyboardSettingsState {
    scrollAmount: number;
}

class KeyboardSettings extends PureComponent<KeyboardSettingsProps, KeyboardSettingsState> {
    constructor(props: KeyboardSettingsProps, context: any) {
        super(props);

        this.state = {
            scrollAmount: props.scrollAmount
        };

        this.handleChangeScrollAmount = this.handleChangeScrollAmount.bind(this);
        this.handleSubmitScrollAmount = this.handleSubmitScrollAmount.bind(this);
    }

    handleChangeScrollAmount(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;

        this.setState((state) => ({
            ...state,
            scrollAmount: value
        }));
    }

    handleSubmitScrollAmount(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onChangeScrollAmount } = this.props;
        const { scrollAmount } = this.state;

        onChangeScrollAmount(scrollAmount);
    }

    render() {
        const { scrollAmount } = this.state;

        return (
            <section className="section">
                <form className="form" onSubmit={this.handleSubmitScrollAmount}>
                    <div className="form-group">
                        <label>
                            <div className="form-group-heading">Scroll amount for "Scroll up/down" commands</div>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={scrollAmount}
                                    onChange={this.handleChangeScrollAmount}
                                    min={1}
                                    required />
                                <button type="submit" className="button button-outline-positive">Save</button>
                            </div>
                        </label>
                    </div>
                </form>
            </section>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        scrollAmount: state.keyMappings.scrollAmount
    }),
    mapDispatchToProps: bindActions({
        onChangeScrollAmount: changeScrollAmount
    })
})(KeyboardSettings);
