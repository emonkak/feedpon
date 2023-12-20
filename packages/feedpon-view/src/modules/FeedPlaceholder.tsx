import React from 'react';

export default function FeedPlaceholder(_props: {}) {
  return (
    <li className="list-group-item">
      <div className="link-strong">
        <span className="placeholder placeholder-40 animation-shining" />
      </div>
      <div className="u-text-7">
        <span className="placeholder placeholder-10 animation-shining" />
      </div>
      <div className="u-text-muted">
        <span className="placeholder placeholder-100 animation-shining" />
        <span className="placeholder placeholder-60 animation-shining" />
      </div>
    </li>
  );
}
