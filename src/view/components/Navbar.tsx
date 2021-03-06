import React from 'react';

interface NavbarProps {
    children?: React.ReactNode;
    progress?: number;
    onToggleSidebar?: () => void;
}

const Navbar: React.SFC<NavbarProps> = ({ children, onToggleSidebar, progress }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <button className="navbar-action" onClick={onToggleSidebar}>
                    <i className="icon icon-24 icon-menu" />
                </button>
                {children}
            </div>
            {progress != null &&
                <div
                    className="navbar-indicator"
                    style={{ width: `${progress * 100}%` }} />}
        </nav>
    );
};

export default Navbar;
