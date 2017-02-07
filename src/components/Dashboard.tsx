import * as React from 'react';

import Dropdown from 'components/parts/Dropdown';
import DropdownMenuItem from 'components/parts/DropdownMenuItem';
import Modal from 'components/parts/Modal';

export default class Dashboard extends React.PureComponent<any, any> {
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

    render() {
        const { isModalShown } = this.state;

        return (
            <div className="main">
                <header className="main-header">
                    <h1 className="main-title u-text-truncate"><a className="link-default" href="#">Typographica</a></h1>
                    <ul className="list-inline list-inline-slash">
                        <li><a href="#">Refresh</a></li>
                        <li><a href="#">Mark as Read</a></li>
                        <li>
                            <Dropdown toggleButton={<a className="dropdown-toggle" href="#">View</a>} pullRight={true}>
                                <DropdownMenuItem>Action</DropdownMenuItem>
                                <DropdownMenuItem>Another action</DropdownMenuItem>
                                <DropdownMenuItem>Something else here</DropdownMenuItem>
                            </Dropdown>
                        </li>
                    </ul>
                </header>
                <div className="main-body">
                    <article className="entry">
                        <header className="entry-header">
                            <h1 className="entry-title"><a className="link-default" href="#">The standard Lorem Ipsum passage, used since the 1500s</a></h1>
                            <div className="entry-info">
                                <ul className="list-inline list-inline-dot">
                                    <li>John Doe</li>
                                    <li>1 hour ago</li>
                                </ul>
                            </div>
                        </header>
                        <div className="entry-body">
                            <h1>Heading level 1</h1>
                            <h2>Heading level 2</h2>
                            <h3>Heading level 3</h3>
                            <h4>Heading level 4</h4>
                            <h5>Heading level 5</h5>
                            <h6>Heading level 6</h6>

                            <h2>Button</h2>
                            <p className="button-toolbar">
                                <button className="button button-default">Default</button>
                                <button className="button button-positive">Positive</button>
                                <button className="button button-negative">Negative</button>
                            </p>
                            <p className="button-toolbar">
                                <button className="button button-large button-default">Default</button>
                                <button className="button button-large button-positive">Positive</button>
                                <button className="button button-large button-negative">Negative</button>
                            </p>

                            <h2>Paragraph</h2>
                            <p><em>Lorem Ipsum</em> is simply dummy text of the printing and typesetting industry. <strong>Lorem Ipsum</strong> has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

                            <h2>Navigation</h2>
                            <nav className="nav">
                                <a className="nav-item" href="#">First</a>
                                <a className="nav-item is-selected" href="#">Second</a>
                                <a className="nav-item" href="#">Third</a>
                            </nav>

                            <h2>Dropdown</h2>
                            <Dropdown toggleButton={<button className="button button-default dropdown-toggle">Dropdown</button>}>
                                <DropdownMenuItem>First Action</DropdownMenuItem>
                                <DropdownMenuItem>Second Action</DropdownMenuItem>
                                <DropdownMenuItem>Third Action</DropdownMenuItem>
                                <li className="dropdown-menu-divider"></li>
                                <DropdownMenuItem>Forth Action</DropdownMenuItem>
                            </Dropdown>

                            <h2>Modal</h2>
                            <div className="button-toolbar">
                                <button className="button button-positive" onClick={this.handleModalOpen.bind(this)}>Launch Modal</button>
                            </div>
                            <Modal isShown={isModalShown} onHide={this.handleModalClose.bind(this)}>
                                <div className="modal-header">
                                    <h2>Modal Title</h2>
                                    <button className="button button-close" onClick={this.handleModalClose.bind(this)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <p>Modal body text goes here.</p>
                                </div>
                                <div className="modal-footer">
                                    <div className="button-toolbar">
                                        <button className="button button-positive">Okay</button>
                                        <button className="button button-invert" onClick={this.handleModalClose.bind(this)}>Cancel</button>
                                    </div>
                                </div>
                            </Modal>

                            <h2>Message</h2>
                            <div className="message message-default">
                                <header className="message-header">
                                    <h6 className="message-title">Changes in Service</h6>
                                    <button className="button button-close">×</button>
                                </header>
                                <div className="message-body">
                                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                                </div>
                            </div>
                            <div className="message message-positive">
                                <header className="message-header">
                                    <h6 className="message-title">Changes in Service</h6>
                                    <button className="button button-close">×</button>
                                </header>
                                <div className="message-body">
                                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                                </div>
                            </div>
                            <div className="message message-negative">
                                <header className="message-header">
                                    <h6 className="message-title">Changes in Service</h6>
                                    <button className="button button-close">×</button>
                                </header>
                                <div className="message-body">
                                    <p>We just updated our privacy policy here to better service our customers. We recommend reviewing the changes.</p>
                                </div>
                            </div>

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
                                        <strong>The standard Lorem Ipsum passage, used since the 1500s</strong>
                                    </div>
                                    <div className="u-text-nowrap">1 hour ago</div>
                                </a>
                                <a className="list-group-item" href="#">
                                    <div className="u-text-truncate">
                                        <strong>The standard Lorem Ipsum passage, used since the 1500s</strong>
                                    </div>
                                    <div className="u-text-nowrap">1 hour ago</div>
                                </a>
                            </div>

                            <h2>Blockquote</h2>
                            <blockquote>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</blockquote>
                        </div>
                        <footer className="entry-footer">
                            <ul className="list-inline list-inline-dot u-baseline-2">
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-pin-3"></i></a></li>
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-bookmark"></i></a></li>
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-comments"></i></a></li>
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-share"></i></a></li>
                            </ul>
                        </footer>
                    </article>
                    <article className="entry">
                        <header className="entry-header">
                            <h2 className="entry-title"><a className="link-default" href="#">Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</a></h2>
                            <div className="entry-info">
                                <ul className="list-inline list-inline-dot">
                                    <li>John Doe</li>
                                    <li>1 hour ago</li>
                                </ul>
                            </div>
                        </header>
                        <div className="entry-body">
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                        </div>
                        <footer className="entry-footer">
                            <ul className="list-inline list-inline-dot u-baseline-double">
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-pin-3"></i></a></li>
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-bookmark"></i></a></li>
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-comments"></i></a></li>
                                <li><a className="link-default" href="#"><i className="icon icon-32 icon-share"></i></a></li>
                            </ul>
                        </footer>
                    </article>
                </div>
            </div>
        );
    }
}
