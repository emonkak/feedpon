import { createComponent, type RenderContext, Repeat } from 'barebind';
import { type HistoryNavigator, RelativeURL } from 'barebind/extras/router';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import { toggleSidebar } from 'feedpon-messaging/ui';

import { MainLayout } from '../layout/MainLayout.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import { Navbar } from '../primitives/Navbar.ts';

export interface AboutPageProps {
  navigator: HistoryNavigator;
}

const USING_LIBRARIES = [
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

export const AboutPage = createComponent(function AboutPage(
  { navigator }: AboutPageProps,
  $: RenderContext,
): unknown {
  const { onToggleSidebar, version } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        version: state.version,
      }),
      mapDispatchToProps: bindActions({
        onToggleSidebar: toggleSidebar,
      }),
    }),
  );

  const handleGoKitchensink = $.useCallback(() => {
    navigator.navigate(new RelativeURL('/kitchensink'));
  }, []);

  const header = Navbar({
    onToggleSidebar,
    children: $.html`
      <h1 class="navbar-title">About</h1>
      <${Dropdown({
        trigger: ({ id, onToggle, open }, context) => context.html`
          <button
            aria-label="Open menu"
            aria-expanded=${open.toString()}
            aria-haspopup="listbox"
            class="navbar-action"
            id=${id}
            type="button"
            @click=${onToggle}
          >
            <i
              aria-hidden
              class="icon icon-24 icon-menu-2"
              role="img"
            ></i>
          </button>
        `,
        items: [
          {
            type: 'button',
            key: 'go_kitchensink',
            children: $.html`
              <div class="MenuItem-content">Go kitchensink...</div>
            `,
            onAction: handleGoKitchensink,
          },
        ],
      })}>
    `,
  });

  const usingLibraries = Repeat({
    source: USING_LIBRARIES,
    valueSelector: ({ license, name, url }) => $.html`
        <li>
          <h2>
            <a href=${url} target="_blank" rel="noreferrer">
              ${name}
            </a>
          </h2>
          <pre class="u-text-prewrap">${license}</pre>
        </li>
      `,
  });
  const content = $.html`
    <section class="section u-text-center">
      <div class="container">
        <a
          href="https://github.com/emonkak/feedpon"
          target="_blank"
          rel="noreferrer"
        >
          <img src="./img/logo.svg" width="244" height="88">
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

  return MainLayout({
    header,
    content,
  });
});
