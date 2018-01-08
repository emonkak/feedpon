import { PureComponent } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    getRootElement?: () => Element;
}

export default class Portal extends PureComponent<PortalProps, {}> {
    static defaultProps = {
        getRootElement: () => document.body
    };

    private _rootElement: Element;

    private _containerElement: Element;

    constructor(props: PortalProps, context: any) {
        super(props, context);

        this._rootElement = props.getRootElement!();
        this._containerElement = document.createElement('div');
    }

    componentDidMount() {
        this._rootElement.appendChild(this._containerElement);
    }

    componentWillUnmount() {
        this._rootElement.removeChild(this._containerElement);
    }

    render() {
        return createPortal(this.props.children, this._containerElement);
    }
}
