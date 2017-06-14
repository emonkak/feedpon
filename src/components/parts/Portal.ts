import { Children, PureComponent } from 'react';
import { unmountComponentAtNode, unstable_renderSubtreeIntoContainer } from 'react-dom';

interface PortalProps {
    children?: React.ReactElement<any>;
    getContainerElement?: () => Element;
    overlay?: React.ReactElement<any>;
}

export default class Portal extends PureComponent<PortalProps, {}> {
    static defaultProps = {
        getContainerElement: () => document.body
    };

    containerElement: Element | null = null;

    overlayElement: Element | null = null;

    componentDidMount() {
        this.updateOverlay();
    }

    componentDidUpdate() {
        this.updateOverlay();
    }

    componentWillUnmount() {
        this.unrenderOverlay();
    }

    updateOverlay() {
        const { overlay } = this.props;

        if (overlay) {
            this.renderOverlay(overlay);
         } else {
            this.unrenderOverlay();
         }
    }

    renderOverlay(overlay: React.ReactElement<any>) {
        if (!this.overlayElement) {
            this.overlayElement = document.createElement('div');

            this.containerElement = this.props.getContainerElement!();
            this.containerElement.appendChild(this.overlayElement);
        }

        unstable_renderSubtreeIntoContainer(
            this,
            overlay,
            this.overlayElement
        );
    }

    unrenderOverlay() {
        if (this.overlayElement && this.containerElement) {
            unmountComponentAtNode(this.overlayElement);

            this.containerElement.removeChild(this.overlayElement);

            this.overlayElement = null;
            this.containerElement = null;
        }
    }

    render() {
        return Children.only(this.props.children);
    }
}
