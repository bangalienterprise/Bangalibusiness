import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import SettingsProviderWrapper from '@/components/SettingsProviderWrapper';
import { Toaster } from '@/components/ui/toaster';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';

// Public Pages
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import JoinBusinessPage from '@/pages/JoinBusinessPage';
import JoinExistingBusiness from '@/pages/JoinExistingBusiness';

// Main Router
import DashboardRouter from '@/pages/DashboardRouter';
import AdminRouteGuard from '@/components/AdminRouteGuard';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import BusinessesManagement from '@/pages/admin/BusinessesManagement';
import UsersManagement from '@/pages/admin/UsersManagement';
import SystemSettingsAdmin from '@/pages/admin/SystemSettings';
import AuditLogs from '@/pages/admin/AuditLogs';
import BackupsManagement from '@/pages/admin/BackupsManagement';

// Retail Pages
import RetailDashboard from '@/pages/RetailDashboard';
import POSPage from '@/pages/retail/POSPage';
import SalesHistoryPage from '@/pages/retail/SalesHistoryPage';
import ProductsPage from '@/pages/retail/ProductsPage';
import CategoriesPage from '@/pages/retail/CategoriesPage';
import ExpensesPage from '@/pages/retail/ExpensesPage';
import TeamPage from '@/pages/TeamManagement';
import SettingsPage from '@/pages/SystemSettings';
import DueCollectionPage from '@/pages/retail/DueCollectionPage';
import DamageManagement from '@/pages/retail/DamageManagement';
import SuppliersPage from '@/pages/retail/SuppliersPage';
import GiftCardsPage from '@/pages/retail/GiftCardsPage';
import Reports from '@/pages/Reports';
import UserProfile from '@/pages/UserProfile';
import OrdersPage from '@/pages/OrdersPage';

// Agency Pages
import AgencyDashboard from '@/pages/agency/AgencyDashboard';
import ProjectBoardPage from '@/pages/agency/ProjectBoardPage';
import ClientsPortal from '@/pages/agency/ClientPortalPage';
import ProposalsPage from '@/pages/agency/ProposalsPage';
import TaskBoard from '@/pages/agency/TaskBoardPage';

// Service Pages
import ServiceDashboard from '@/pages/service/ServiceDashboard';
import AppointmentsPage from '@/pages/service/AppointmentsPage';
import BookingCalendar from '@/pages/service/BookingCalendarPage';
import ServicesList from '@/pages/service/ServiceListPage';
import ServiceCustomers from '@/pages/service/CustomersPage';

// Freelancer Pages
import FreelancerDashboard from '@/pages/freelancer/FreelancerDashboard';
import PortfolioPage from '@/pages/freelancer/PortfolioPage';
import TimeTrackerPage from '@/pages/freelancer/TimeTrackerPage';
import FreelancerClients from '@/pages/freelancer/ClientsPage';
import FreelancerInvoices from '@/pages/freelancer/InvoicesPage';

// Education Pages
import StudentListPage from '@/pages/education/StudentListPage';
import AttendancePage from '@/pages/education/AttendancePage';
import CourseManager from '@/pages/education/CourseManagerPage';
import FeeCollection from '@/pages/education/FeeCollectionPage';

// Restaurant Pages
import FloorPlanPage from '@/pages/restaurant/FloorPlanPage';
import KitchenViewPage from '@/pages/restaurant/KitchenViewPage';
import MenuManagerPage from '@/pages/restaurant/MenuManagerPage';
import RestaurantOrdersPage from '@/pages/restaurant/RestaurantOrdersPage';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const { user, loading: authLoading, role } = useAuth();
  const { currentBusiness, loading: businessLoading } = useBusiness();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const loading = authLoading || businessLoading;

  useEffect(() => {
    if (!loading && user) {
      // Force Theme based on role
      if (role === 'global_admin') {
        setTheme('dark');
      } else {
        setTheme('light');
      }

      // Smart redirection based on role/business type if at root
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        if (role === 'global_admin') {
          navigate('/admin');
        } else if (currentBusiness) {
            const type = currentBusiness.type_slug || currentBusiness.type || 'retail';
            switch(type) {
                case 'restaurant':
                    navigate('/restaurant/dashboard');
                    break;
                case 'agency':
                    navigate('/agency/dashboard');
                    break;
                case 'service':
                    navigate('/service/dashboard');
                    break;
                case 'freelancer':
                    navigate('/freelancer/dashboard');
                    break;
                case 'education':
                    navigate('/education/students');
                    break;
                default:
                    navigate('/retail/dashboard');
            }
        }
      }
    }
  }, [user, loading, role, currentBusiness, navigate, setTheme]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage isAdmin={true} />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/join-business" element={<JoinExistingBusiness />} /> {/* Updated to point to correct page */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
        <Route path="/admin/businesses" element={<AdminRouteGuard><BusinessesManagement /></AdminRouteGuard>} />
        <Route path="/admin/users" element={<AdminRouteGuard><UsersManagement /></AdminRouteGuard>} />
        <Route path="/admin/settings" element={<AdminRouteGuard><SystemSettingsAdmin /></AdminRouteGuard>} />
        <Route path="/admin/audit-logs" element={<AdminRouteGuard><AuditLogs /></AdminRouteGuard>} />
        <Route path="/admin/backups" element={<AdminRouteGuard><BackupsManagement /></AdminRouteGuard>} />
      </Route>

      {/* Retail/User Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/retail/dashboard" element={<RetailDashboard />} />
        <Route path="/retail/pos" element={<POSPage />} />
        <Route path="/retail/sales-history" element={<SalesHistoryPage />} />
        <Route path="/retail/products" element={<ProductsPage />} />
        <Route path="/retail/categories" element={<CategoriesPage />} />
        <Route path="/retail/expenses" element={<ExpensesPage />} />
        <Route path="/retail/damage" element={<DamageManagement />} />
        <Route path="/retail/gift-cards" element={<GiftCardsPage />} />
        <Route path="/retail/orders" element={<OrdersPage />} />
        <Route path="/retail/suppliers" element={<SuppliersPage />} />
        <Route path="/retail/team" element={<TeamPage />} />
        <Route path="/retail/settings" element={<SettingsPage />} />
        <Route path="/retail/due-collection" element={<DueCollectionPage />} />
        <Route path="/retail/reports" element={<Reports />} />
        <Route path="/retail/profile" element={<UserProfile />} />
      </Route>

       {/* Restaurant Routes */}
       <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/restaurant/dashboard" element={<FloorPlanPage />} /> {/* Defaulting to Floor Plan for now */}
        <Route path="/restaurant/floor-plan" element={<FloorPlanPage />} />
        <Route path="/restaurant/kitchen" element={<KitchenViewPage />} />
        <Route path="/restaurant/menu" element={<MenuManagerPage />} />
        <Route path="/restaurant/orders" element={<RestaurantOrdersPage />} />
        <Route path="/restaurant/team" element={<TeamPage />} />
        <Route path="/restaurant/reports" element={<Reports />} />
        <Route path="/restaurant/settings" element={<SettingsPage />} />
      </Route>

      {/* Agency Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/agency/dashboard" element={<AgencyDashboard />} />
        <Route path="/agency/projects" element={<ProjectBoardPage />} />
        <Route path="/agency/clients" element={<ClientsPortal />} />
        <Route path="/agency/proposals" element={<ProposalsPage />} />
        <Route path="/agency/tasks" element={<TaskBoard />} />
        <Route path="/agency/team" element={<TeamPage />} />
        <Route path="/agency/reports" element={<Reports />} />
        <Route path="/agency/settings" element={<SettingsPage />} />
      </Route>

      {/* Service Business Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/service/dashboard" element={<ServiceDashboard />} />
        <Route path="/service/appointments" element={<AppointmentsPage />} />
        <Route path="/service/calendar" element={<BookingCalendar />} />
        <Route path="/service/services" element={<ServicesList />} />
        <Route path="/service/customers" element={<ServiceCustomers />} />
        <Route path="/service/team" element={<TeamPage />} />
        <Route path="/service/reports" element={<Reports />} />
        <Route path="/service/settings" element={<SettingsPage />} />
      </Route>

      {/* Freelancer Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
        <Route path="/freelancer/portfolio" element={<PortfolioPage />} />
        <Route path="/freelancer/time-tracker" element={<TimeTrackerPage />} />
        <Route path="/freelancer/clients" element={<FreelancerClients />} />
        <Route path="/freelancer/invoices" element={<FreelancerInvoices />} />
        <Route path="/freelancer/reports" element={<Reports />} />
        <Route path="/freelancer/settings" element={<SettingsPage />} />
      </Route>

      {/* Education Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/education/students" element={<StudentListPage />} />
        <Route path="/education/attendance" element={<AttendancePage />} />
        <Route path="/education/courses" element={<CourseManager />} />
        <Route path="/education/fees" element={<FeeCollection />} />
        <Route path="/education/reports" element={<Reports />} />
        <Route path="/education/settings" element={<SettingsPage />} />
      </Route>

      {/* Common Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/help" element={<div className="p-8 text-white">Help Page Placeholder</div>} />
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <ThemeProvider>
          <RoleProvider>
            <SettingsProviderWrapper>
              <AppContent />
              <Toaster />
            </SettingsProviderWrapper>
          </RoleProvider>
        </ThemeProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;