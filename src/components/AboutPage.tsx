import React, { PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/parts/Navbar';
import { MenuLink } from 'components/parts/Menu';
import { VERSION } from 'messaging/constants';

interface AboutPageProps {
    onToggleSidebar: () => void;
    version: string;
}

const REACT_LICENSE = `
BSD License

For React software

Copyright (c) 2013-present, Facebook, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

 * Neither the name Facebook nor the names of its contributors may be used to
   endorse or promote products derived from this software without specific
   prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`.trim();

const REACT_ROUTER_LICENSE = `
The MIT License (MIT)

Copyright (c) 2015-present, Ryan Florence, Michael Jackson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`.trim();

const RESELECT_LICENSE = `
The MIT License (MIT)

Copyright (c) 2015-2016 Reselect Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`.trim();

const INTL_RELATIVEFORMAT_LICENSE = `
Copyright 2014 Yahoo! Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    * Neither the name of the Yahoo! Inc. nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL YAHOO! INC. BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

------------------------------------------------------------------------------
Pluralization rules built from
https://github.com/papandreou/node-cldr
which is licensed under the BSD license and has the following license:

Copyright (c) 2012, Andreas Lind Petersen
All rights reserved.

See the following for more details:
https://github.com/papandreou/node-cldr/blob/master/LICENSE
`.trim();

const CLASSNAMES_LICENSE = `
The MIT License (MIT)

Copyright (c) 2017 Jed Watson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`.trim();

export default class AboutPage extends PureComponent<AboutPageProps, {}> {
    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">About</h1>
                <Dropdown
                    toggleButton={
                        <button className="navbar-action">
                            <i className="icon icon-24 icon-menu-2" />
                        </button>
                    }>
                    <MenuLink
                        to="/kitchensink/"
                        primaryText="Go to kitchensink..." />
                </Dropdown>
            </Navbar>
        );
    }

    renderContent() {
        return (
            <div>
                <section className="section u-text-center">
                    <div className="container">
                        <div>
                            <a href="https://github.com/emonkak/feedpon" target="_blank">
                                <img src="/img/feedpon.svg" width="320" height="96" />
                            </a>
                        </div>
                        <div className="u-margin-bottom-1">
                            <div className="u-text-large"><em>The feed reader for me</em></div>
                            <div className="u-text-large">Version <strong>{VERSION}</strong></div>
                        </div>
                        <ul className="list-inline list-inline-slashed">
                            <li className="list-inline-item"><a href="https://github.com/emonkak/feedpon" target="_blank">Source code</a></li>
                            <li className="list-inline-item"><a href="https://github.com/emonkak/feedpon/issues" target="_blank">Issues</a></li>
                        </ul>
                    </div>
                </section>
                <section className="section">
                    <div className="container">
                        <h1 className="display-1">Licenses</h1>
                        <ul>
                            <li>
                                <h2>React</h2>
                                <pre>{REACT_LICENSE}</pre>
                            </li>
                            <li>
                                <h2>React Router</h2>
                                <pre>{REACT_ROUTER_LICENSE}</pre>
                            </li>
                            <li>
                                <h2>Reselect</h2>
                                <pre>{RESELECT_LICENSE}</pre>
                            </li>
                            <li>
                                <h2>Intl RelativeFormat</h2>
                                <pre>{INTL_RELATIVEFORMAT_LICENSE}</pre>
                            </li>
                            <li>
                                <h2>classnames</h2>
                                <pre>{CLASSNAMES_LICENSE}</pre>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
    }
}
