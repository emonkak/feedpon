import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';

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

        this.handleCancelDeleting = this.handleCancelDeleting.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleStartDeleting = this.handleStartDeleting.bind(this);
    }

    handleCancelDeleting() {
        this.setState({
            isDeleting: false
        });
    }

    handleDelete() {
        const { onDelete, pattern } = this.props;

        onDelete(pattern);
    }

    handleStartDeleting() {
        this.setState({
            isDeleting: true
        });
    }

    render() {
        const { pattern } = this.props;
        const { isDeleting } = this.state;

        return (
            <tr>
                <td>
                    <code>{pattern}</code>
                    <ConfirmModal
                        confirmButtonClassName="button button-outline-negative"
                        confirmButtonLabel="Delete"
                        isOpened={isDeleting}
                        message="Are you sure you want to delete this pattern?"
                        onClose={this.handleCancelDeleting}
                        onConfirm={this.handleDelete}
                        title={`Delete "${pattern}"`} />
                </td>
                <td className="u-text-right">
                    <button
                        className="close"
                        onClick={this.handleStartDeleting} />
                </td>
            </tr>
        );
    }
}

