import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardShell from '@/components/dashboard/DashboardShell';

const AdminAccountDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Account - Bangali Enterprise</title>
      </Helmet>
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold mb-2">Admin Account Dashboard</h2>
          <p className="text-muted-foreground">This feature is under development.</p>
        </div>
      </DashboardShell>
    </>
  );
};

export default AdminAccountDashboard;