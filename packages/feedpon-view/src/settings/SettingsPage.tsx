import { type LocationActions, RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import { toggleSidebar } from 'feedpon-messaging/ui';
import React from 'react';

import { Nav, NavItem } from '../common/components/Nav';
import { ReactNavbar } from '../common/components/Navbar';
import { useEvent } from '../common/hooks/useEvent';
import { ReactMainLayout } from '../layouts/MainLayout';

export interface SettingsProps {
  children: React.ReactElement;
  locationActions: LocationActions;
  url: RelativeURL;
}

export function SettingsPage({
  children,
  locationActions,
  url,
}: SettingsProps) {
  const { onToggleSidebar } = useStore({
    mapDispatchToProps: bindActions({
      onToggleSidebar: toggleSidebar,
    }),
  });

  const handleSelectNavItem = useEvent((path: string) => {
    locationActions.navigate(new RelativeURL(path), { replace: true });
  });

  const navbar = (
    <ReactNavbar onToggleSidebar={onToggleSidebar}>
      <h1 className="navbar-title">Settings</h1>
    </ReactNavbar>
  );

  return (
    <ReactMainLayout header={navbar}>
      <div className="container">
        <Nav onSelect={handleSelectNavItem}>
          <NavItem
            value="/settings/ui"
            title="UI"
            isSelected={url.pathname === '/settings/ui'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-browser-window" />
            <span className="u-none u-md-inline">UI</span>
          </NavItem>
          <NavItem
            value="/settings/stream"
            title="Stream"
            isSelected={url.pathname === '/settings/stream'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-news-feed" />
            <span className="u-none u-md-inline">Stream</span>
          </NavItem>
          <NavItem
            value="/settings/tracking_url"
            title="Tracking URL"
            isSelected={url.pathname === '/settings/tracking_url'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-link" />
            <span className="u-none u-md-inline">Tracking URL</span>
          </NavItem>
          <NavItem
            value="/settings/url_replacement"
            title="URL Replacement"
            isSelected={url.pathname === '/settings/url_replacement'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-replace" />
            <span className="u-none u-md-inline">URL Replacement</span>
          </NavItem>
          <NavItem
            value="/settings/siteinfo"
            title="Siteinfo"
            isSelected={url.pathname === '/settings/siteinfo'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-database" />
            <span className="u-none u-md-inline">Siteinfo</span>
          </NavItem>
          <NavItem
            value="/settings/keyboard"
            title="Keyboard"
            isSelected={url.pathname === '/settings/keyboard'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-keyboard" />
            <span className="u-none u-md-inline">Keyboard</span>
          </NavItem>
        </Nav>
        {children}
      </div>
    </ReactMainLayout>
  );
}
