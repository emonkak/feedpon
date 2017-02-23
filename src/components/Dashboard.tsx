import React, { PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Modal from 'components/parts/Modal';
import connect from 'utils/components/connect';
import { sendNotification } from 'messaging/actions';

@connect()
export default class Dashboard extends PureComponent<any, any> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isModalShown: false,
        };
    }

    handleModalOpen() {
        this.setState(state => ({ ...state, isModalShown: true }));
    }

    handleModalClose() {
        this.setState(state => ({ ...state, isModalShown: false }));
    }

    handleSendNotification(kind: any) {
        const { dispatch } = this.props;

        dispatch(sendNotification({
            message: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            kind,
            dismissAfter: 3000,
        }));
    }

    render() {
        const { isModalShown } = this.state;

        return (
            <div className="container">
                <h1>Heading level 1</h1>
                <h2>Heading level 2</h2>
                <h3>Heading level 3</h3>
                <h4>Heading level 4</h4>
                <h5>Heading level 5</h5>
                <h6>Heading level 6</h6>

                <h2>Button</h2>
                <p className="button-toolbar">
                    <button className="button button-default" onClick={this.handleSendNotification.bind(this, 'default')}>Default</button>
                    <button className="button button-positive" onClick={this.handleSendNotification.bind(this, 'positive')}>Positive</button>
                    <button className="button button-negative" onClick={this.handleSendNotification.bind(this, 'negative')}>Negative</button>
                </p>
                <p className="button-toolbar">
                    <button className="button button-large button-default" onClick={this.handleSendNotification.bind(this, 'default')}>Default</button>
                    <button className="button button-large button-positive" onClick={this.handleSendNotification.bind(this, 'positive')}>Positive</button>
                    <button className="button button-large button-negative" onClick={this.handleSendNotification.bind(this, 'negative')}>Negative</button>
                </p>

                <h2>Paragraph</h2>
                <p><em>Lorem Ipsum</em> is simply dummy text of the printing and typesetting industry. <strong>Lorem Ipsum</strong> has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

                <h2>Navigation</h2>
                <nav className="nav">
                    <a className="nav-item" href="#">First</a>
                    <a className="nav-item is-selected" href="#">Second</a>
                    <a className="nav-item" href="#">Third</a>
                </nav>

                <h2>Popover</h2>
                <div className="popover popover-default popover-above">
                    <h3 className="popover-title">Popover Title</h3>
                    <p>Popover Content</p>
                </div>
                <div className="popover popover-default popover-above popover-right">
                    <h3 className="popover-title">Popover Title</h3>
                    <p>Popover Content</p>
                </div>
                <div className="popover popover-positive popover-below">
                    <h3 className="popover-title">Popover Title</h3>
                    <p>Popover Content</p>
                </div>
                <div className="popover popover-negative popover-below popover-right">
                    <h3 className="popover-title">Popover Title</h3>
                    <p>Popover Content</p>
                </div>

                <h2>Dropdown</h2>
                <Dropdown toggleButton={<button className="button button-default dropdown-toggle">Dropdown</button>}>
                    <MenuItem primaryText="First Action"></MenuItem>
                    <MenuItem primaryText="Second Action"></MenuItem>
                    <MenuItem primaryText="Third Action"></MenuItem>
                    <div className="menu-divider"></div>
                    <MenuItem primaryText="Forth Action"></MenuItem>
                </Dropdown>

                <h2>Modal</h2>
                <div className="button-toolbar">
                    <button className="button button-positive" onClick={this.handleModalOpen.bind(this)}>Launch Modal</button>
                </div>
                <Modal shown={isModalShown} onHide={this.handleModalClose.bind(this)}>
                    <button className="close" onClick={this.handleModalClose.bind(this)}></button>
                    <h3 className="modal-title">Modal Title</h3>
                    <p>Modal body text goes here.</p>
                    <div className="button-toolbar">
                        <button className="button button-positive">Okay</button>
                        <button className="button button-invert" onClick={this.handleModalClose.bind(this)}>Cancel</button>
                    </div>
                </Modal>

                <h2>Message</h2>
                <div className="message message-default">
                    <button className="close"></button>
                    <h6 className="message-title">Changes in Service</h6>
                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                </div>
                <div className="message message-positive">
                    <button className="close"></button>
                    <h6 className="message-title">Changes in Service</h6>
                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                </div>
                <div className="message message-negative">
                    <button className="close"></button>
                    <h6 className="message-title">Changes in Service</h6>
                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                </div>

                <h2>Placeholder</h2>
                <h2 className="placeholder placeholder-animated placeholder-60"></h2>
                <p>
                    <span className="placeholder placeholder-animated placeholder-100" />
                    <span className="placeholder placeholder-animated placeholder-100" />
                    <span className="placeholder placeholder-animated placeholder-100" />
                    <span className="placeholder placeholder-animated placeholder-80" />
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

                <h2>Group List</h2>
                <div className="list-group">
                    <a className="list-group-item" href="#">
                        <div className="u-text-truncate">
                            The standard Lorem Ipsum passage, used since the 1500s
                        </div>
                        <div className="u-text-nowrap">1 hour ago</div>
                    </a>
                    <a className="list-group-item" href="#">
                        <div className="u-text-truncate">
                            The standard Lorem Ipsum passage, used since the 1500s
                        </div>
                        <div className="u-text-nowrap">1 hour ago</div>
                    </a>
                </div>

                <h2>Blockquote</h2>
                <blockquote>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</blockquote>
            </div>
        );
    }
}
