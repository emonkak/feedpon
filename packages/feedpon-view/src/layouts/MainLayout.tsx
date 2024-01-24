import React from 'react';

interface MainLayoutProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
  header: React.ReactNode;
}

export default function MainLayout({
  children,
  footer = <DefaultFooter />,
  header,
}: MainLayoutProps) {
  return (
    <>
      <div className="l-header">{header}</div>
      <div className="l-content">{children}</div>
      <div className="l-footer">{footer}</div>
    </>
  );
}

function DefaultFooter() {
  return (
    <footer className="u-margin-top-4 u-margin-bottom-4">
      <div className="u-text-center">
        <small>Copyright &copy; 2017 Shota Nozaki</small>
      </div>
      <div className="u-text-center">
        <ul className="list-inline list-inline-slashed">
          <li className="list-inline-item">
            <a href="https://github.com/emonkak/feedpon" target="_blank">
              Source code
            </a>
          </li>
          <li className="list-inline-item">
            <a href="https://github.com/emonkak/feedpon/issues" target="_blank">
              Issues
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
