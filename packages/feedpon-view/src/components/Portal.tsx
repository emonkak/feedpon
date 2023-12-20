import React from 'react';
import { createPortal } from 'react-dom';

interface PortalProps extends React.ComponentPropsWithRef<'div'> {
  container?: Element;
}

export default function Portal({
  container = document.body,
  ...portalProps
}: PortalProps) {
  return createPortal(<div {...portalProps} />, container);
}
