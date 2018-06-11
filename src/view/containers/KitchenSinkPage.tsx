import React, { PureComponent } from 'react';

import Dropdown from 'view/components/Dropdown';
import MainLayout from 'view/layouts/MainLayout';
import Modal from 'view/components/Modal';
import Navbar from 'view/components/Navbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { MenuItem } from 'view/components/Menu';
import { NotificationKind } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';
import { toggleSidebar } from 'messaging/ui/actions';

interface KitchenSinkProps {
    onSendNotification: typeof sendNotification;
    onToggleSidebar: typeof toggleSidebar;
}

interface KitchenSinkState {
    modalIsOpened: boolean;
}

class KitchenSinkPage extends PureComponent<KitchenSinkProps, KitchenSinkState> {
    constructor(props: KitchenSinkProps) {
        super(props);

        this.state = {
            modalIsOpened: false
        };
    }

    handleOpenModal() {
        this.setState({ modalIsOpened: true });
    }

    handleCloseModal() {
        this.setState({ modalIsOpened: false });
    }

    handleSendNotification(kind: NotificationKind) {
        const { onSendNotification } = this.props;

        onSendNotification(
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            kind
        );
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">Kitchen sink</h1>
            </Navbar>
        );
    }

    renderContent() {
        const { modalIsOpened } = this.state;

        return (
            <div className="container">
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
                    <h1 className="display-1">Display level 1</h1>
                    <h2 className="display-2">Display level 2</h2>
                    <h3 className="display-3">Display level 3</h3>
                    <h4 className="display-4">Display level 4</h4>
                    <h5 className="display-5">Display level 5</h5>
                    <h6 className="display-6">Display level 6</h6>
                </div>

                <h2>Colors</h2>
                <p>
                    <span className="u-text-muted">Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.</span>
                    <br />
                    <span className="u-text-positive">Nullam id dolor id nibh ultricies vehicula ut id elit.</span>
                    <br />
                    <span className="u-text-negative">Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</span>
                </p>

                <h2>Code</h2>
                <p>
                    <kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>Delete</kbd>
                    <br />
                    <code>Code</code>
                </p>

                <h2>Button</h2>
                <p className="button-toolbar">
                    <button className="button button-default" onClick={this.handleSendNotification.bind(this, 'default')}>Default</button>
                    <button className="button button-positive" onClick={this.handleSendNotification.bind(this, 'positive')}>Positive</button>
                    <button className="button button-negative" onClick={this.handleSendNotification.bind(this, 'negative')}>Negative</button>
                    <button className="button button-outline-default" onClick={this.handleSendNotification.bind(this, 'default')}>Default</button>
                    <button className="button button-outline-positive" onClick={this.handleSendNotification.bind(this, 'positive')}>Positive</button>
                    <button className="button button-outline-negative" onClick={this.handleSendNotification.bind(this, 'negative')}>Negative</button>
                </p>

                <h2>Disabled Button</h2>
                <p className="button-toolbar">
                    <button className="button button-default" disabled>Default</button>
                    <button className="button button-positive" disabled>Positive</button>
                    <button className="button button-negative" disabled>Negative</button>
                    <button className="button button-outline-default" disabled>Default</button>
                    <button className="button button-outline-positive" disabled>Positive</button>
                    <button className="button button-outline-negative" disabled>Negative</button>
                </p>

                <h2>Large Button</h2>
                <p className="button-toolbar">
                    <button className="button button-large button-default">Default</button>
                    <button className="button button-large button-positive">Positive</button>
                    <button className="button button-large button-negative">Negative</button>
                    <button className="button button-large button-outline-default">Default</button>
                    <button className="button button-large button-outline-positive">Positive</button>
                    <button className="button button-large button-outline-negative">Negative</button>
                </p>

                <h2>Group Button</h2>
                <div className="button-toolbar u-margin-bottom-2">
                    <span className="button-group">
                        <button className="button button-default">First</button>
                        <button className="button button-default">Second</button>
                        <button className="button button-default">Third</button>
                    </span>
                    <span className="button-group">
                        <button className="button button-outline-default">First</button>
                        <button className="button button-outline-default">Second</button>
                        <button className="button button-outline-default">Third</button>
                    </span>
                </div>

                <h2>Badge</h2>
                <div className="button-toolbar u-margin-bottom-2">
                    <span className="badge badge-small badge-default">Default</span>
                    <span className="badge badge-small badge-positive">Positive</span>
                    <span className="badge badge-small badge-negative">Negative</span>
                    <span className="badge badge-default">Default</span>
                    <span className="badge badge-positive">Positive</span>
                    <span className="badge badge-negative">Negative</span>
                    <span className="badge badge-large badge-default">Default</span>
                    <span className="badge badge-large badge-positive">Positive</span>
                    <span className="badge badge-large badge-negative">Negative</span>
                </div>

                <h2>Pill Badge</h2>
                <div className="button-toolbar u-margin-bottom-2">
                    <span className="badge badge-small badge-pill badge-default">12</span>
                    <span className="badge badge-small badge-pill badge-positive">34</span>
                    <span className="badge badge-small badge-pill badge-negative">56</span>
                    <span className="badge badge-pill badge-default">12</span>
                    <span className="badge badge-pill badge-positive">34</span>
                    <span className="badge badge-pill badge-negative">56</span>
                    <span className="badge badge-large badge-pill badge-default">12</span>
                    <span className="badge badge-large badge-pill badge-positive">34</span>
                    <span className="badge badge-large badge-pill badge-negative">56</span>
                </div>

                <h2>Paragraph</h2>
                <p><em>Lorem Ipsum</em> is simply dummy text of the printing and typesetting industry. <strong>Lorem Ipsum</strong> has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                <hr />
                <p><em>Lorem Ipsum</em> is simply dummy text of the printing and typesetting industry. <strong>Lorem Ipsum</strong> has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

                <h2>Navigation</h2>
                <div className="u-margin-bottom-2">
                    <nav className="nav">
                        <a className="nav-item" href="#">First</a>
                        <a className="nav-item is-selected" href="#">Second</a>
                        <a className="nav-item" href="#">Third</a>
                    </nav>
                </div>

                <h2>Popover</h2>
                <div className="popover popover-default is-pull-down">
                    <div className="popover-arrow" />
                    <div className="popover-content">
                        <p>Popover Content</p>
                    </div>
                </div>
                <div className="popover popover-positive is-pull-down">
                    <div className="popover-arrow" />
                    <div className="popover-content">
                        <p>Popover Content</p>
                    </div>
                </div>
                <div className="popover popover-negative is-pull-down">
                    <div className="popover-arrow" />
                    <div className="popover-content">
                        <p>Popover Content</p>
                    </div>
                </div>
                <div className="popover popover-default is-pull-up">
                    <div className="popover-arrow" />
                    <div className="popover-content">
                        <p>Popover Content</p>
                    </div>
                </div>
                <div className="popover popover-positive is-pull-up">
                    <div className="popover-arrow" />
                    <div className="popover-content">
                        <p>Popover Content</p>
                    </div>
                </div>
                <div className="popover popover-negative is-pull-up">
                    <div className="popover-arrow" />
                    <div className="popover-content">
                        <p>Popover Content</p>
                    </div>
                </div>

                <h2>Dropdown</h2>
                <div className="u-margin-bottom-2">
                    <Dropdown
                        className="u-inline-block"
                        toggleButton={<button className="button button-outline-default dropdown-arrow">Dropdown</button>}>
                        <MenuItem primaryText="First Action" secondaryText="First"></MenuItem>
                        <MenuItem primaryText="Second Action" secondaryText="Second"></MenuItem>
                        <MenuItem primaryText="Third Action" secondaryText="Third"></MenuItem>
                        <div className="menu-divider"></div>
                        <MenuItem isDisabled={true} primaryText="Forth Action"></MenuItem>
                    </Dropdown>
                </div>

                <h2>Modal</h2>
                <p className="button-toolbar">
                    <button className="button button-positive" onClick={this.handleOpenModal.bind(this)}>Launch Modal</button>
                </p>
                <Modal isOpened={modalIsOpened} onClose={this.handleCloseModal.bind(this)}>
                    <button className="close u-pull-right" onClick={this.handleCloseModal.bind(this)}></button>
                    <h1 className="modal-title">Modal Title</h1>
                    <p>Modal body text goes here.</p>
                    <p className="button-toolbar">
                        <button className="button button-positive">Okay</button>
                        <button className="button button-outline-default" onClick={this.handleCloseModal.bind(this)}>Cancel</button>
                    </p>
                </Modal>

                <h2>Message</h2>
                <div className="message message-default">
                    <button className="close u-pull-right"></button>
                    <h6 className="message-title">Changes in Service</h6>
                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                </div>
                <div className="message message-positive">
                    <button className="close u-pull-right"></button>
                    <h6 className="message-title">Changes in Service</h6>
                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                </div>
                <div className="message message-negative">
                    <button className="close u-pull-right"></button>
                    <h6 className="message-title">Changes in Service</h6>
                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                </div>

                <h2>Icon</h2>
                <p>
                    <i className="icon icon-32 icon-angle-down" />
                    <i className="icon icon-32 icon-angle-right" />
                    <i className="icon icon-32 icon-bookmark" />
                    <i className="icon icon-32 icon-browser-window" />
                    <i className="icon icon-32 icon-checked" />
                    <i className="icon icon-32 icon-checkmark" />
                    <i className="icon icon-32 icon-close" />
                    <i className="icon icon-32 icon-comments" />
                    <i className="icon icon-32 icon-database" />
                    <i className="icon icon-32 icon-delete" />
                    <i className="icon icon-32 icon-dot" />
                    <i className="icon icon-32 icon-edit" />
                    <i className="icon icon-32 icon-external-link" />
                    <i className="icon icon-32 icon-facebook" />
                    <i className="icon icon-32 icon-feedly" />
                    <i className="icon icon-32 icon-file" />
                    <i className="icon icon-32 icon-folder" />
                    <i className="icon icon-32 icon-hatena-bookmark" />
                    <i className="icon icon-32 icon-info" />
                    <i className="icon icon-32 icon-instapaper" />
                    <i className="icon icon-32 icon-keyboard" />
                    <i className="icon icon-32 icon-link" />
                    <i className="icon icon-32 icon-menu" />
                    <i className="icon icon-32 icon-menu-2" />
                    <i className="icon icon-32 icon-news-feed" />
                    <i className="icon icon-32 icon-page-overview" />
                    <i className="icon icon-32 icon-pin-3" />
                    <i className="icon icon-32 icon-plus-math" />
                    <i className="icon icon-32 icon-pocket" />
                    <i className="icon icon-32 icon-refresh" />
                    <i className="icon icon-32 icon-settings" />
                    <i className="icon icon-32 icon-share" />
                    <i className="icon icon-32 icon-spinner" />
                    <i className="icon icon-32 icon-trash" />
                    <i className="icon icon-32 icon-twitter" />
                    <i className="icon icon-32 icon-warning" />
                </p>
                <p>
                    <i className="icon icon-16 icon-angle-down" />
                    <i className="icon icon-16 icon-angle-right" />
                    <i className="icon icon-16 icon-bookmark" />
                    <i className="icon icon-16 icon-browser-window" />
                    <i className="icon icon-16 icon-checked" />
                    <i className="icon icon-16 icon-checkmark" />
                    <i className="icon icon-16 icon-close" />
                    <i className="icon icon-16 icon-comments" />
                    <i className="icon icon-16 icon-database" />
                    <i className="icon icon-16 icon-delete" />
                    <i className="icon icon-16 icon-dot" />
                    <i className="icon icon-16 icon-edit" />
                    <i className="icon icon-16 icon-external-link" />
                    <i className="icon icon-16 icon-facebook" />
                    <i className="icon icon-16 icon-file" />
                    <i className="icon icon-16 icon-folder" />
                    <i className="icon icon-16 icon-hatena-bookmark" />
                    <i className="icon icon-16 icon-info" />
                    <i className="icon icon-16 icon-instapaper" />
                    <i className="icon icon-16 icon-keyboard" />
                    <i className="icon icon-16 icon-link" />
                    <i className="icon icon-16 icon-menu" />
                    <i className="icon icon-16 icon-menu-2" />
                    <i className="icon icon-16 icon-news-feed" />
                    <i className="icon icon-16 icon-page-overview" />
                    <i className="icon icon-16 icon-pin-3" />
                    <i className="icon icon-16 icon-plus-math" />
                    <i className="icon icon-16 icon-pocket" />
                    <i className="icon icon-16 icon-refresh" />
                    <i className="icon icon-16 icon-settings" />
                    <i className="icon icon-16 icon-share" />
                    <i className="icon icon-16 icon-spinner" />
                    <i className="icon icon-16 icon-trash" />
                    <i className="icon icon-16 icon-twitter" />
                    <i className="icon icon-16 icon-warning" />
                </p>

                <h2>Placeholder</h2>
                <h2 className="placeholder placeholder-60 animation-shining"></h2>
                <p>
                    <span className="placeholder placeholder-100 animation-shining" />
                    <span className="placeholder placeholder-100 animation-shining" />
                    <span className="placeholder placeholder-100 animation-shining" />
                    <span className="placeholder placeholder-80 animation-shining" />
                </p>

                <h2>List</h2>
                <ul>
                    <li><a href="http://www.lipsum.com/">Lorem ipsum</a> dolor sit amet, consectetur adipiscing elit.</li>
                    <li>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</li>
                    <li>Curabitur at lectus eget diam accumsan egestas nec quis ligula.</li>
                    <li>Mauris aliquet turpis et massa maximus dignissim.</li>
                    <li>
                        <ul>
                            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                            <li>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</li>
                            <li>Curabitur at lectus eget diam accumsan egestas nec quis ligula.</li>
                            <li>Mauris aliquet turpis et massa maximus dignissim.</li>
                        </ul>
                    </li>
                </ul>

                <ol>
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</li>
                    <li>Curabitur at lectus eget diam accumsan egestas nec quis ligula.</li>
                    <li>Mauris aliquet turpis et massa maximus dignissim.</li>
                </ol>

                <dl>
                    <dt>First</dt>
                    <dd>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</dd>
                    <dt>Second</dt>
                    <dd>Nam eu nunc nec dolor facilisis feugiat ac accumsan risus.</dd>
                    <dt>Thrid</dt>
                    <dd>Curabitur at lectus eget diam accumsan egestas nec quis ligula.</dd>
                    <dt>Fourth</dt>
                    <dd>Mauris aliquet turpis et massa maximus dignissim.</dd>
                </dl>

                <h2>Table</h2>
                <table className="table table-striped">
                    <caption>
                        This is an example table, and this is its caption to describe the contents.
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
                        This is an example table, and this is its caption to describe the contents.
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
                <div className="list-group">
                    <a className="list-group-item" href="#">
                        <div className="u-text-truncate">
                            The standard Lorem Ipsum passage, used since the 1500s
                        </div>
                    </a>
                    <a className="list-group-item" href="#">
                        <div className="u-text-truncate">
                            The standard Lorem Ipsum passage, used since the 1500s
                        </div>
                    </a>
                </div>

                <h2>Blockquote</h2>
                <blockquote>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</blockquote>
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

export default connect({
    mapDispatchToProps: bindActions({
        onSendNotification: sendNotification,
        onToggleSidebar: toggleSidebar
    })
})(KitchenSinkPage);
