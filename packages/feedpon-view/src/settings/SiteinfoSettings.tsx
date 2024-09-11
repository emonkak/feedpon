import React from 'react';

import { SharedSiteinfoSettings } from './SharedSiteinfoSettings';
import { UserSiteinfoSettings } from './UserSiteinfoSettings';

interface SiteinfoSettingsProps {}

export function SiteinfoSettings(_props: SiteinfoSettingsProps) {
  return (
    <section>
      <h1 className="display-1">Siteinfo</h1>
      <p>Siteinfo is used for extracting the full content.</p>
      <UserSiteinfoSettings />
      <SharedSiteinfoSettings />
    </section>
  );
}
