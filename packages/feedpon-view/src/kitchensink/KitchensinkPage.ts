import { createComponent, type RenderContext } from 'barebind';
import { sendNotification, toggleSidebar } from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'feedpon-store/hooks/BindActionCreators';
import type { NotificationType } from 'feedpon-store/state';
import { MainLayout } from '../layout/MainLayout.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import { Navbar } from '../primitives/Navbar.ts';

export interface KitchenSinkProps {}

export const KitchensinkPage = createComponent(function KitchensinkPage(
  {}: KitchenSinkProps,
  $: RenderContext,
): unknown {
  const { onNotificationSend, onSidebarToggle } = $.use(
    BindActionCreators({
      onNotificationSend: sendNotification,
      onSidebarToggle: toggleSidebar,
    }),
  );
  const [modalOpened, setModalOpened] = $.useState(false);

  const handleOpenModal = $.useCallback(() => {
    setModalOpened(true);
  }, []);

  const handleCloseModal = $.useCallback(() => {
    setModalOpened(false);
  }, []);

  const handleSendNotification = $.useCallback(
    (type: NotificationType) => {
      onNotificationSend(
        type,
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      );
    },
    [onNotificationSend],
  );

  const header = Navbar({
    onSidebarToggle,
    children: $.html`
      <h1 class="navbar-title">Kitchen sink</h1>
    `,
  });

  const content = $.html`
    <div class="container">
      <h1>Heading</h1>
      <div>
        <h1>Heading level 1</h1>
        <h2>Heading level 2</h2>
        <h3>Heading level 3</h3>
        <h4>Heading level 4</h4>
        <h5>Heading level 5</h5>
        <h6>Heading level 6</h6>
      </div>
      <h1>Display</h1>
      <div>
        <h1 class="display-1">Display level 1</h1>
        <h2 class="display-2">Display level 2</h2>
        <h3 class="display-3">Display level 3</h3>
        <h4 class="display-4">Display level 4</h4>
        <h5 class="display-5">Display level 5</h5>
        <h6 class="display-6">Display level 6</h6>
      </div>
      <h2>Colors</h2>
      <p>
        <span class="u-text-muted">
          Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.
        </span>
        <br>
        <span class="u-text-positive">
          Nullam id dolor id nibh ultricies vehicula ut id elit.
        </span>
        <br>
        <span class="u-text-negative">
          Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
        </span>
      </p>
      <h2>Code</h2>
      <p>
        <kbd>Ctrl</kbd>
        <kbd>Alt</kbd>
        <kbd>Delete</kbd>
        <br>
        <code>Code</code>
      </p>
      <h2>Button</h2>
      <p class="button-toolbar">
        <button
          type="button"
          class="button button-default"
          @click=${handleSendNotification.bind(null, 'info')}
        >
          Default
        </button>
        <button
          type="button"
          class="button button-positive"
          @click=${handleSendNotification.bind(null, 'positive')}
        >
          Positive
        </button>
        <button
          type="button"
          class="button button-negative"
          @click=${handleSendNotification.bind(null, 'negative')}
        >
          Negative
        </button>
        <button
          type="button"
          class="button button-outline-default"
          @click=${handleSendNotification.bind(null, 'info')}
        >
          Default
        </button>
        <button
          type="button"
          class="button button-outline-positive"
          @click=${handleSendNotification.bind(null, 'positive')}
        >
          Positive
        </button>
        <button
          type="button"
          class="button button-outline-negative"
          @click=${handleSendNotification.bind(null, 'negative')}
        >
          Negative
        </button>
      </p>
      <h2>Disabled Button</h2>
      <p class="button-toolbar">
        <button type="button" class="button button-default" disabled>
          Default
        </button>
        <button type="button" class="button button-positive" disabled>
          Positive
        </button>
        <button type="button" class="button button-negative" disabled>
          Negative
        </button>
        <button
          type="button"
          class="button button-outline-default"
          disabled
        >
          Default
        </button>
        <button
          type="button"
          class="button button-outline-positive"
          disabled
        >
          Positive
        </button>
        <button
          type="button"
          class="button button-outline-negative"
          disabled
        >
          Negative
        </button>
      </p>
      <h2>Large Button</h2>
      <p class="button-toolbar">
        <button type="button" class="button button-large button-default">
          Default
        </button>
        <button type="button" class="button button-large button-positive">
          Positive
        </button>
        <button type="button" class="button button-large button-negative">
          Negative
        </button>
        <button
          type="button"
          class="button button-large button-outline-default"
        >
          Default
        </button>
        <button
          type="button"
          class="button button-large button-outline-positive"
        >
          Positive
        </button>
        <button
          type="button"
          class="button button-large button-outline-negative"
        >
          Negative
        </button>
      </p>
      <h2>Group Button</h2>
      <div class="button-toolbar u-margin-bottom-2">
        <span class="button-group">
          <button type="button" class="button button-default">
            First
          </button>
          <button type="button" class="button button-default">
            Second
          </button>
          <button type="button" class="button button-default">
            Third
          </button>
        </span>
        <span class="button-group">
          <button type="button" class="button button-outline-default">
            First
          </button>
          <button type="button" class="button button-outline-default">
            Second
          </button>
          <button type="button" class="button button-outline-default">
            Third
          </button>
        </span>
      </div>
      <h2>Badge</h2>
      <div class="button-toolbar u-margin-bottom-2">
        <span class="badge badge-small badge-default">Default</span>
        <span class="badge badge-small badge-positive">Positive</span>
        <span class="badge badge-small badge-negative">Negative</span>
        <span class="badge badge-medium badge-default">Default</span>
        <span class="badge badge-medium badge-positive">Positive</span>
        <span class="badge badge-medium badge-negative">Negative</span>
        <span class="badge badge-large badge-default">Default</span>
        <span class="badge badge-large badge-positive">Positive</span>
        <span class="badge badge-large badge-negative">Negative</span>
      </div>
      <h2>Pill Badge</h2>
      <div class="button-toolbar u-margin-bottom-2">
        <span class="badge badge-small badge-pill badge-default">12</span>
        <span class="badge badge-small badge-pill badge-positive">
          34
        </span>
        <span class="badge badge-small badge-pill badge-negative">
          56
        </span>
        <span class="badge badge-medium badge-pill badge-default">
          12
        </span>
        <span class="badge badge-medium badge-pill badge-positive">
          34
        </span>
        <span class="badge badge-medium badge-pill badge-negative">
          56
        </span>
        <span class="badge badge-large badge-pill badge-default">12</span>
        <span class="badge badge-large badge-pill badge-positive">
          34
        </span>
        <span class="badge badge-large badge-pill badge-negative">
          56
        </span>
      </div>
      <h2>Paragraph</h2>
      <p>
        <em>Lorem Ipsum</em> is simply dummy text of the printing and
        typesetting industry. <strong>Lorem Ipsum</strong> has been the
        industry's standard dummy text ever since the 1500s, when an unknown
        printer took a galley of type and scrambled it to make a type specimen
        book. It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularised in the 1960s with the release of Letraset sheets
        containing Lorem Ipsum passages, and more recently with desktop
        publishing software like Aldus PageMaker including versions of Lorem
        Ipsum.
      </p>
      <hr>
      <p>
        <em>Lorem Ipsum</em> is simply dummy text of the printing and
        typesetting industry. <strong>Lorem Ipsum</strong> has been the
        industry's standard dummy text ever since the 1500s, when an unknown
        printer took a galley of type and scrambled it to make a type specimen
        book. It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularised in the 1960s with the release of Letraset sheets
        containing Lorem Ipsum passages, and more recently with desktop
        publishing software like Aldus PageMaker including versions of Lorem
        Ipsum.
      </p>
      <h2>Navigation</h2>
      <div class="u-margin-bottom-2">
        <nav class="nav">
          <a class="nav-item" href="#">
            First
          </a>
          <a class="nav-item is-selected" href="#">
            Second
          </a>
          <a class="nav-item" href="#">
            Third
          </a>
        </nav>
      </div>
      <h2>Popover</h2>
      <div class="popover popover-default is-pull-down">
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <p>Popover Content</p>
        </div>
      </div>
      <div class="popover popover-positive is-pull-down">
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <p>Popover Content</p>
        </div>
      </div>
      <div class="popover popover-negative is-pull-down">
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <p>Popover Content</p>
        </div>
      </div>
      <div class="popover popover-default is-pull-up">
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <p>Popover Content</p>
        </div>
      </div>
      <div class="popover popover-positive is-pull-up">
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <p>Popover Content</p>
        </div>
      </div>
      <div class="popover popover-negative is-pull-up">
        <div class="popover-arrow"></div>
        <div class="popover-content">
          <p>Popover Content</p>
        </div>
      </div>
      <h2>Dropdown</h2>
      <div class="u-margin-bottom-2">
        <${Dropdown({
          trigger: ({ id, onMenuToggle, open }, context) => context.html`
            <button
              aria-expanded=${open.toString()}
              aria-haspopup="listbox"
              id=${id}
              type="button"
              class="button button-outline-default DropdownArrow"
              @click=${onMenuToggle}
            >
              Open Dropdown
            </button>
          `,
          items: [
            {
              children: $.html`
                <div class="MenuItem-content">First</div>
              `,
              type: 'button',
              onAction: $.useCallback(() => alert('First'), []),
              key: 'first',
            },
            {
              children: $.html`
                <div class="MenuItem-content">Second</div>
              `,
              type: 'button',
              onAction: $.useCallback(() => alert('Second'), []),
              key: 'second',
            },
            {
              key: 'separator1',
              type: 'separator',
            },
            {
              children: $.html`
                <div class="MenuItem-content">Thrid</div>
              `,
              type: 'button',
              onAction: $.useCallback(() => alert('Thrid'), []),
              key: 'thrid',
            },
          ],
        })}>
      </div>
      <h2>Modal</h2>
      <p class="button-toolbar">
        <button
          type="button"
          class="button button-positive"
          @click=${handleOpenModal}
        >
          Open modal
        </button>
      </p>
      <${Dialog({
        children: $.html`
          <button
            type="button"
            class="close u-pull-right"
            @click=${close}
          ></button>
          <h1 class="modal-title">Modal Title</h1>
          <p>Modal body text goes here.</p>
          <p class="button-toolbar">
            <button
              type="button"
              class="button button-positive"
              @click=${handleCloseModal}
              >
            OK
            </button>
            <button
              type="button"
              class="button button-outline-default"
              @click=${handleCloseModal}
            >
              Cancel
            </button>
          </p>
        `,
        onClose: handleCloseModal,
        open: modalOpened,
      })}>
      <h2>Message</h2>
      <div class="message message-default">
        <button type="button" class="close u-pull-right"></button>
        <h6 class="message-title">Changes in Service</h6>
        <p>
          We just updated our privacy policy here to better service our
          customers. We recommend reviewing the changes.
        </p>
      </div>
      <div class="message message-positive">
        <button type="button" class="close u-pull-right"></button>
        <h6 class="message-title">Changes in Service</h6>
        <p>
          We just updated our privacy policy here to better service our
          customers. We recommend reviewing the changes.
        </p>
      </div>
      <div class="message message-negative">
        <button type="button" class="close u-pull-right"></button>
        <h6 class="message-title">Changes in Service</h6>
        <p>
          We just updated our privacy policy here to better service our
          customers. We recommend reviewing the changes.
        </p>
      </div>
      <h2>Icon</h2>
      <p>
        <i class="icon icon-32 icon-angle-down"></i>
        <i class="icon icon-32 icon-angle-right"></i>
        <i class="icon icon-32 icon-bookmark"></i>
        <i class="icon icon-32 icon-browser-window"></i>
        <i class="icon icon-32 icon-checked"></i>
        <i class="icon icon-32 icon-checkmark"></i>
        <i class="icon icon-32 icon-close"></i>
        <i class="icon icon-32 icon-comments"></i>
        <i class="icon icon-32 icon-database"></i>
        <i class="icon icon-32 icon-delete"></i>
        <i class="icon icon-32 icon-dot"></i>
        <i class="icon icon-32 icon-edit"></i>
        <i class="icon icon-32 icon-external-link"></i>
        <i class="icon icon-32 icon-facebook"></i>
        <i class="icon icon-32 icon-feedly"></i>
        <i class="icon icon-32 icon-file"></i>
        <i class="icon icon-32 icon-folder"></i>
        <i class="icon icon-32 icon-hatena-bookmark"></i>
        <i class="icon icon-32 icon-info"></i>
        <i class="icon icon-32 icon-instapaper"></i>
        <i class="icon icon-32 icon-keyboard"></i>
        <i class="icon icon-32 icon-link"></i>
        <i class="icon icon-32 icon-menu"></i>
        <i class="icon icon-32 icon-menu-2"></i>
        <i class="icon icon-32 icon-news-feed"></i>
        <i class="icon icon-32 icon-page-overview"></i>
        <i class="icon icon-32 icon-pin-3"></i>
        <i class="icon icon-32 icon-plus-math"></i>
        <i class="icon icon-32 icon-pocket"></i>
        <i class="icon icon-32 icon-refresh"></i>
        <i class="icon icon-32 icon-settings"></i>
        <i class="icon icon-32 icon-share"></i>
        <i class="icon icon-32 icon-spinner"></i>
        <i class="icon icon-32 icon-trash"></i>
        <i class="icon icon-32 icon-twitter"></i>
        <i class="icon icon-32 icon-warning"></i>
      </p>
      <p>
        <i class="icon icon-16 icon-angle-down"></i>
        <i class="icon icon-16 icon-angle-right"></i>
        <i class="icon icon-16 icon-bookmark"></i>
        <i class="icon icon-16 icon-browser-window"></i>
        <i class="icon icon-16 icon-checked"></i>
        <i class="icon icon-16 icon-checkmark"></i>
        <i class="icon icon-16 icon-close"></i>
        <i class="icon icon-16 icon-comments"></i>
        <i class="icon icon-16 icon-database"></i>
        <i class="icon icon-16 icon-delete"></i>
        <i class="icon icon-16 icon-dot"></i>
        <i class="icon icon-16 icon-edit"></i>
        <i class="icon icon-16 icon-external-link"></i>
        <i class="icon icon-16 icon-facebook"></i>
        <i class="icon icon-16 icon-file"></i>
        <i class="icon icon-16 icon-folder"></i>
        <i class="icon icon-16 icon-hatena-bookmark"></i>
        <i class="icon icon-16 icon-info"></i>
        <i class="icon icon-16 icon-instapaper"></i>
        <i class="icon icon-16 icon-keyboard"></i>
        <i class="icon icon-16 icon-link"></i>
        <i class="icon icon-16 icon-menu"></i>
        <i class="icon icon-16 icon-menu-2"></i>
        <i class="icon icon-16 icon-news-feed"></i>
        <i class="icon icon-16 icon-page-overview"></i>
        <i class="icon icon-16 icon-pin-3"></i>
        <i class="icon icon-16 icon-plus-math"></i>
        <i class="icon icon-16 icon-pocket"></i>
        <i class="icon icon-16 icon-refresh"></i>
        <i class="icon icon-16 icon-settings"></i>
        <i class="icon icon-16 icon-share"></i>
        <i class="icon icon-16 icon-spinner"></i>
        <i class="icon icon-16 icon-trash"></i>
        <i class="icon icon-16 icon-twitter"></i>
        <i class="icon icon-16 icon-warning"></i>
      </p>
      <h2>Placeholder</h2>
      <p class="placeholder placeholder-60 animation-shining"></p>
      <p>
        <span class="placeholder placeholder-100 animation-shining"></span>
        <span class="placeholder placeholder-100 animation-shining"></span>
        <span class="placeholder placeholder-100 animation-shining"></span>
        <span class="placeholder placeholder-80 animation-shining"></span>
      </p>
      <h2>List</h2>
      <ul>
        <li>
          <a href="http://www.lipsum.com/">Lorem ipsum</a> dolor sit amet,
          consectetur adipiscing elit.
        </li>
        <li>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</li>
        <li>
          Curabitur at lectus eget diam accumsan egestas nec quis ligula.
        </li>
        <li>Mauris aliquet turpis et massa maximus dignissim.</li>
        <li>
          <ul>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>
              Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.
            </li>
            <li>
              Curabitur at lectus eget diam accumsan egestas nec quis ligula.
            </li>
            <li>Mauris aliquet turpis et massa maximus dignissim.</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
        <li>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</li>
        <li>
          Curabitur at lectus eget diam accumsan egestas nec quis ligula.
        </li>
        <li>Mauris aliquet turpis et massa maximus dignissim.</li>
      </ol>
      <dl>
        <dt>First</dt>
        <dd>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</dd>
        <dt>Second</dt>
        <dd>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</dd>
        <dt>Thrid</dt>
        <dd>
          Curabitur at lectus eget diam accumsan egestas nec quis ligula.
        </dd>
        <dt>Fourth</dt>
        <dd>Mauris aliquet turpis et massa maximus dignissim.</dd>
      </dl>
      <h2>Table</h2>
      <table class="table table-striped">
        <caption>
          This is an example table, and this is its caption to describe the
          contents.
        </caption>
        <thead>
          <tr>
            <th>Table heading</th>
            <th>Table heading</th>
            <th>Table heading</th>
            <th>Table heading</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
        </tbody>
      </table>
      <table>
        <caption>
          This is an example table, and this is its caption to describe the
          contents.
        </caption>
        <thead>
          <tr>
            <th>Table heading</th>
            <th>Table heading</th>
            <th>Table heading</th>
            <th>Table heading</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
        </tbody>
      </table>
      <h2>Group List</h2>
      <div class="list-group">
        <a class="list-group-item" href="#">
          <div class="u-text-truncate">
            The standard Lorem Ipsum passage, used since the 1500s
          </div>
        </a>
        <a class="list-group-item" href="#">
          <div class="u-text-truncate">
            The standard Lorem Ipsum passage, used since the 1500s
          </div>
        </a>
      </div>
      <h2>Blockquote</h2>
      <blockquote>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only
        five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s with
        the release of Letraset sheets containing Lorem Ipsum passages, and
        more recently with desktop publishing software like Aldus PageMaker
        including versions of Lorem Ipsum.
      </blockquote>
    </div>
  `;

  return MainLayout({
    header,
    content,
  });
});
