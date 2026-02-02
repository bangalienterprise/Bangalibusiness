import React from 'react';
import Sidebar from './Sidebar';

const MobileMenu = ({ isOpen, toggleSidebar }) => {
    return (
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} isMobile={true} />
    );
};

export default MobileMenu;