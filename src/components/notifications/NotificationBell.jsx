import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell = () => {
  const { user, userRole } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user || !user.business_id) return null;

  return (
    <NotificationDropdown 
      businessId={user.business_id} 
      userId={user.id} 
      role={userRole}
      isMobile={isMobile}
    />
  );
};

export default NotificationBell;