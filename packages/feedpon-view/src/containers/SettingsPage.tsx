import React from 'react';
import { useLocation, useHistory } from 'react-router';

import MainLayout from '../layouts/MainLayout';
import Navbar from '../components/Navbar';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import { Nav, NavItem } from '../components/Nav';
import { toggleSidebar } from 'feedpon-messaging/ui';
import useEvent from '../hooks/useEvent';

interface SettingsProps {
  children: React.ReactElement<any>;
  onToggleSidebar: typeof toggleSidebar;
}

function SettingsPage({ children, onToggleSidebar }: SettingsProps) {
  const history = useHistory();
  const location = useLocation();

  const handleSelectNavItem = useEvent((path: string) => {
    history.replace(path);
  });

  const navbar = (
    <Navbar onToggleSidebar={onToggleSidebar}>
      <h1 className="navbar-title">Settings</h1>
    </Navbar>
  );

  return (
    <MainLayout header={navbar}>
      <div className="container">
        <Nav onSelect={handleSelectNavItem}>
          <NavItem
            value="/settings/ui"
            title="UI"
            isSelected={location.pathname === '/settings/ui'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-browser-window" />
            <span className="u-none u-md-inline">UI</span>
          </NavItem>
          <NavItem
            value="/settings/stream"
            title="Stream"
            isSelected={location.pathname === '/settings/stream'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-news-feed" />
            <span className="u-none u-md-inline">Stream</span>
          </NavItem>
          <NavItem
            value="/settings/tracking_url"
            title="Tracking URL"
            isSelected={location.pathname === '/settings/tracking_url'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-link" />
            <span className="u-none u-md-inline">Tracking URL</span>
          </NavItem>
          <NavItem
            value="/settings/url_replacement"
            title="URL Replacement"
            isSelected={location.pathname === '/settings/url_replacement'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-replace" />
            <span className="u-none u-md-inline">URL Replacement</span>
          </NavItem>
          <NavItem
            value="/settings/siteinfo"
            title="Siteinfo"
            isSelected={location.pathname === '/settings/siteinfo'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-database" />
            <span className="u-none u-md-inline">Siteinfo</span>
          </NavItem>
          <NavItem
            value="/settings/keyboard"
            title="Keyboard"
            isSelected={location.pathname === '/settings/keyboard'}
          >
            <i className="u-inline-block u-md-none icon icon-20 icon-keyboard" />
            <span className="u-none u-md-inline">Keyboard</span>
          </NavItem>
        </Nav>
        {children}
      </div>
    </MainLayout>
  );
}

export default connect(SettingsPage, {
  mapDispatchToProps: bindActions({
    onToggleSidebar: toggleSidebar,
  }),
});
