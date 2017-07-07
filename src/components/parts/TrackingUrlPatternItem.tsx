import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import ModalButton from 'components/widgets/ModalButton';

interface TrackingUrlPatternItemProps {
    onRemove: (pattern: string) => void;
    pattern: string;
}

export default class TrackingUrlPatternItem extends PureComponent<TrackingUrlPatternItemProps, {}> {
    constructor(props: TrackingUrlPatternItemProps, context: any) {
        super(props, context);

        this.handleRemove = this.handleRemove.bind(this);
    }

    handleRemove() {
        const { onRemove, pattern } = this.props;

        onRemove(pattern);
    }

    render() {
        const { pattern } = this.props;

        return (
            <li className="list-group-item">
                <code>{pattern}</code>
                <ModalButton
                    modal={
                        <ConfirmModal
                            message="Are you sure you want to delete this pattern?"
                            confirmButtonClassName="button button-outline-negative"
                            confirmButtonLabel="Delete"
                            onConfirm={this.handleRemove}
                            title={`Delete "${pattern}"`} />
                    }
                    button={<button className="close u-pull-right" />} />
            </li>
        )
    }
}

