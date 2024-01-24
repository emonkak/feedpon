import React from 'react';

import SharedSiteinfoSettings from '../containers/SharedSiteinfoSettings';
import UserSiteinfoSettings from '../containers/UserSiteinfoSettings';

interface SiteinfoSettingsProps {}

export default function SiteinfoSettings({}: SiteinfoSettingsProps) {
  return (
    <section>
      <h1 className="display-1">Siteinfo</h1>
      <p>Siteinfo is used for extracting the full content.</p>
      <UserSiteinfoSettings />
      <SharedSiteinfoSettings />
    </section>
  );
}
