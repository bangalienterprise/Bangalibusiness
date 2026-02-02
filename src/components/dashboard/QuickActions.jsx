import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, FileText, Wallet, Users, Settings, DollarSign, AlertTriangle, Briefcase, Layers, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

const ActionButton = ({ icon: Icon, label, path, color, onClick }) => (
  <Card
    className="bg-slate-800 border-slate-700 hover:bg-slate-700/80 transition-all cursor-pointer group"
    onClick={onClick}
  >
    <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
      <div className={`p-3 rounded-full bg-slate-900 group-hover:bg-slate-800 transition-colors border border-slate-700`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <span className="font-medium text-slate-200">{label}</span>
    </CardContent>
  </Card>
);

const QuickActions = () => {
  const navigate = useNavigate();
  const { isOwner, isManager } = useAuth();
  const { currentBusiness } = useBusiness();

  const industry = currentBusiness?.industry?.toLowerCase() || 'retail';

  const retailActions = [
    { label: 'POS', icon: ShoppingCart, path: '/retail/pos', color: 'text-blue-400', show: true },
    { label: 'Products', icon: Package, path: '/retail/products', color: 'text-emerald-400', show: true },
    { label: 'Orders', icon: FileText, path: '/retail/orders', color: 'text-purple-400', show: true },
    { label: 'Expenses', icon: Wallet, path: '/retail/expenses', color: 'text-orange-400', show: true },
    { label: 'Team', icon: Users, path: '/retail/team', color: 'text-yellow-400', show: isOwner() || isManager() },
    { label: 'Settings', icon: Settings, path: '/retail/settings', color: 'text-slate-400', show: isOwner() },
  ];

  const serviceActions = [
    { label: 'New Appointment', icon: FileText, path: '/service/appointments', color: 'text-blue-400', show: true },
    { label: 'Calendar', icon: ShoppingCart, path: '/service/calendar', color: 'text-emerald-400', show: true }, // Using ShoppingCart as placeholder if needed, or better icon
    { label: 'Services', icon: Package, path: '/service/services', color: 'text-purple-400', show: true },
    { label: 'Customers', icon: Users, path: '/service/customers', color: 'text-orange-400', show: true },
    { label: 'Team', icon: Users, path: '/service/team', color: 'text-yellow-400', show: isOwner() || isManager() },
    { label: 'Settings', icon: Settings, path: '/service/settings', color: 'text-slate-400', show: isOwner() },
  ];

  const agencyActions = [
    { label: 'New Project', icon: Briefcase, path: '/agency/projects', color: 'text-blue-400', show: true },
    { label: 'Task Board', icon: Layers, path: '/agency/tasks', color: 'text-emerald-400', show: true },
    { label: 'Clients', icon: Users, path: '/agency/clients', color: 'text-purple-400', show: true },
    { label: 'Proposals', icon: FileText, path: '/agency/proposals', color: 'text-orange-400', show: true },
    { label: 'Team', icon: Users, path: '/agency/team', color: 'text-yellow-400', show: isOwner() || isManager() },
    { label: 'Settings', icon: Settings, path: '/agency/settings', color: 'text-slate-400', show: isOwner() },
  ];

  const freelancerActions = [
    { label: 'Time Tracker', icon: Activity, path: '/freelancer/time-tracker', color: 'text-blue-400', show: true },
    { label: 'Portfolio', icon: Briefcase, path: '/freelancer/portfolio', color: 'text-emerald-400', show: true },
    { label: 'New Invoice', icon: FileText, path: '/freelancer/invoices', color: 'text-purple-400', show: true },
    { label: 'Clients', icon: Users, path: '/freelancer/clients', color: 'text-orange-400', show: true },
    { label: 'Reports', icon: Activity, path: '/freelancer/reports', color: 'text-yellow-400', show: true },
    { label: 'Settings', icon: Settings, path: '/freelancer/settings', color: 'text-slate-400', show: isOwner() },
  ];

  let actions = [];
  switch (industry) {
    case 'service': actions = serviceActions; break;
    case 'agency': actions = agencyActions; break;
    case 'freelancer': actions = freelancerActions; break;
    case 'retail':
    default:
      actions = retailActions;
      break;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.filter(a => a.show).map((action) => (
          <ActionButton
            key={action.label}
            {...action}
            onClick={() => navigate(action.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
