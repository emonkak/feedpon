import { type LocationActions, RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
import type { State } from 'feedpon-messaging';
import { toggleSidebar } from 'feedpon-messaging/ui';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, nonKeyedList } from '@emonkak/ebit/directives.js';
import { Navbar } from '../common/components/Navbar';
import { MainLayout } from '../layouts/MainLayout';
import { Dropdown, type ToggleButtonProps } from '../primitives/Dropdown';

export interface AboutPageProps {
  locationActions: LocationActions;
}

const USING_LIBRARIES = [
  {
    name: 'classnames',
    url: 'https://github.com/JedWatson/classnames/blob/master/LICENSE',
    license: `
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
    `.trim(),
  },
  {
    name: 'React',
    url: 'https://github.chttps://github.com/facebook/react/blob/master/LICENSEom/JedWatson/classnames/blob/master/LICENSE',
    license: `
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
    `.trim(),
  },
  {
    name: 'redux-logger',
    url: 'https://github.com/evgenyrodionov/redux-logger/blob/master/LICENSE',
    license: `
Copyright (c) 2016 Eugene Rodionov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
    `.trim(),
  },
  {
    name: 'reselect',
    url: 'https://github.com/reactjs/reselect/blob/master/LICENSE',
    license: `
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
    `.trim(),
  },
];

export function AboutPage(
  { locationActions }: AboutPageProps,
  context: RenderContext,
): TemplateResult {
  const { onToggleSidebar, version } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        version: state.version,
      }),
      mapDispatchToProps: bindActions({
        onToggleSidebar: toggleSidebar,
      }),
    }),
  );

  const handleGoKitchensink = context.useCallback(() => {
    locationActions.navigate(new RelativeURL('/kitchensink'));
  }, []);

  const header = component(Navbar, {
    onToggleSidebar,
    child: context.html`
      <h1 class="navbar-title">About</h1>
      <${component(Dropdown, {
        toggleButton: ToggleButton,
        children: context.html`
          <button
            class="MenuItem"
            role="option"
            type="button"
            @click=${handleGoKitchensink}
          >
            <div class="MenuItem-content">Go kitchensink...</div>
          </button>
        `,
      })}>
    `,
  });

  const usingLibraries = nonKeyedList(
    USING_LIBRARIES,
    ({ license, name, url }) => context.html`
      <li>
        <h2>
          <a href=${url} target="_blank" rel="noreferrer">
            ${name}
          </a>
        </h2>
        <pre class="u-text-prewrap">${license}</pre>
      </li>
    `,
  );
  const content = context.html`
    <section class="section u-text-center">
      <div class="container">
        <a
          href="https://github.com/emonkak/feedpon"
          target="_blank"
          rel="noreferrer"
        >
          <img src="./img/logo.svg" width="244" height="88" />
        </a>
        <div>
          Version <strong>${version}</strong>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <h1 class="display-1">Licenses</h1>
        <ul><${usingLibraries}></ul>
      </div>
    </section>
  `;

  return context.html`<${component(MainLayout, {
    header,
    content,
  })}>`;
}

function ToggleButton(
  { id, toggle, opened }: ToggleButtonProps,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <button
      aria-label="Open menu"
      aria-expanded=${opened.toString()}
      aria-haspopup="listbox"
      class="navbar-action"
      id=${id}
      type="button"
      @click=${toggle}
    >
      <i
        aria-hidden
        class="icon icon-24 icon-menu-2"
        role="img"
      ></i>
    </button>
  `;
}
