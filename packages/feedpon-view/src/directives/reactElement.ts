import {
  type Binding,
  BlockBinding,
  type ChildNodePart,
  CommitStatus,
  type Directive,
  type DirectiveContext,
  type Effect,
  type Part,
  PartType,
  type UpdateContext,
  directiveTag,
  reportPart,
} from '@emonkak/ebit';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

const REACT_MOUNT_POINT_TAG = ' react-mount-point-unstable ';

export function reactElement(element: React.ReactElement): ReactElement {
  return new ReactElement(element);
}

export class ReactElement implements Directive<ReactElement> {
  private readonly _element: React.ReactElement;

  constructor(element: React.ReactElement) {
    this._element = element;
  }

  get element(): React.ReactElement {
    return this._element;
  }

  [directiveTag](
    part: Part,
    context: DirectiveContext,
  ): BlockBinding<ReactElement, unknown> {
    if (part.type !== PartType.ChildNode) {
      throw new Error(
        'ReactAdapter directive must be used in a child node, but it is used here:\n' +
          reportPart(part),
      );
    }
    return new BlockBinding(new ReactElementBinding(this, part), context.block);
  }
}

export class ReactElementBinding implements Binding<ReactElement>, Effect {
  private _value: ReactElement;

  private readonly _part: ChildNodePart;

  private _root: ReactDOMClient.Root | null = null;

  private _mountedElement: Element | null = null;

  private _status = CommitStatus.Committed;

  constructor(value: ReactElement, part: ChildNodePart) {
    this._value = value;
    this._part = part;
  }

  get value(): ReactElement {
    return this._value;
  }

  get part(): ChildNodePart {
    return this._part;
  }

  get startNode(): ChildNode {
    return this._mountedElement ?? this._part.node;
  }

  get endNode(): ChildNode {
    return this._part.node;
  }

  connect(context: UpdateContext<unknown>): void {
    this._requestCommit(context);
    this._status = CommitStatus.Mounting;
  }

  bind(newValue: ReactElement, context: UpdateContext<unknown>): void {
    this._requestCommit(context);
    this._value = newValue;
    this._status = CommitStatus.Mounting;
  }

  unbind(context: UpdateContext<unknown>): void {
    this._requestCommit(context);
    this._status = CommitStatus.Unmounting;
  }

  disconnect(context: UpdateContext<unknown>): void {
    this._requestCommit(context);
    this._status = CommitStatus.Unmounting;
  }

  commit(): void {
    switch (this._status) {
      case CommitStatus.Mounting:
        ReactDOM.flushSync(() => {
          const reactElement = this._value.element;
          const originalRef: React.ForwardedRef<Element> | undefined =
            reactElement.props.ref;
          const ref: React.Ref<Element> = (element) => {
            if (typeof originalRef === 'function') {
              originalRef(element);
            } else if (originalRef != null) {
              originalRef.current = element;
            }
            this._mountedElement = element;
          };
          const container = this._part.node;
          const originalData = container.data;
          container.data = REACT_MOUNT_POINT_TAG;
          try {
            this._root ??= ReactDOMClient.createRoot(this._part.node as any);
            this._root.render(
              React.cloneElement(reactElement, {
                ref,
              }),
            );
          } finally {
            container.data = originalData;
          }
        });
        break;
      case CommitStatus.Unmounting:
        ReactDOM.flushSync(() => {
          this._root?.unmount();
        });
        break;
    }
    this._status = CommitStatus.Committed;
  }

  private _requestCommit(context: UpdateContext): void {
    if (this._status === CommitStatus.Committed) {
      context.enqueueMutationEffect(this);
    }
  }
}
