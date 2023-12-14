import React, { PureComponent } from 'react';

import ConfirmModal from '../components/ConfirmModal';

interface TrackingUrlPatternItemProps {
    onDelete: (pattern: string) => void;
    pattern: string;
}

interface TrackingUrlPatternItemState {
    isDeleting: boolean;
}

export default class TrackingUrlPatternItem extends PureComponent<TrackingUrlPatternItemProps, TrackingUrlPatternItemState> {
    constructor(props: TrackingUrlPatternItemProps) {
        super(props);

        this.state = {
            isDeleting: false
        };
    }

    override render() {
        const { pattern } = this.props;
        const { isDeleting } = this.state;

        return (
            <tr>
                <td>
                    <code>{pattern}</code>
                </td>
                <td className="u-text-nowrap">
                    <button
                        className="button button-small button-outline-negative"
                        onClick={this._handleStartDeleting}>
                        <i className="icon icon-16 icon-trash" />
                    </button>
                    <ConfirmModal
                        confirmButtonClassName="button button-outline-negative"
                        confirmButtonLabel="Delete"
                        isOpened={isDeleting}
                        message="Are you sure you want to delete this pattern?"
                        onClose={this._handleCancelDeleting}
                        onConfirm={this._handleDelete}
                        title={`Delete "${pattern}"`} />
                </td>
            </tr>
        );
    }

    private _handleCancelDeleting = () => {
        this.setState({
            isDeleting: false
        });
    }

    private _handleDelete = () => {
        const { onDelete, pattern } = this.props;

        onDelete(pattern);
    }

    private _handleStartDeleting = () => {
        this.setState({
            isDeleting: true
        });
    }
}
