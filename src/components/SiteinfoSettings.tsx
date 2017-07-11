import React from 'react';

import SharedSiteinfoSettings from 'components/SharedSiteinfoSettings';
import UserSiteinfoSettings from 'components/UserSiteinfoSettings';

const SiteinfoSettings: React.SFC<{}> = () => {
    return (
        <section>
            <h1 className="display-1">Siteinfo</h1>
            <p>Siteinfo is used for extracting the full content.</p>
            <UserSiteinfoSettings />
            <SharedSiteinfoSettings />
        </section>
    );
};

export default SiteinfoSettings;
