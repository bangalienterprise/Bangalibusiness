
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Building2, DollarSign, Activity, 
  Settings, Database, FileText, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeTransactions: 0
  });
  const [charts, setCharts] = useState({
    businessTypes: [],
    revenueTrend: [],
    userActivity: [],
    topBusinesses: []
  });
  const [recentActivity, setRecentActivity] = useState({
    auditLogs: [],
    newBusinesses: [],
    newUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch KPI Counts
      const [businessesRes, usersRes, salesRes, todaySalesRes] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sales_transactions').select('total_amount'),
        supabase.from('sales_transactions').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      // Calculate Total Revenue
      const totalRevenue = (salesRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

      setStats({
        totalBusinesses: businessesRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalRevenue,
        activeTransactions: todaySalesRes.count || 0
      });

      // 2. Fetch Charts Data
      // Business Types Distribution
      const { data: businessTypesData } = await supabase
        .from('businesses')
        .select('type');
      
      const typeDistribution = businessTypesData?.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});
      
      const businessTypesChart = Object.keys(typeDistribution || {}).map(key => ({
        name: key, value: typeDistribution[key]
      }));

      // Mock data for trends (since real historical data might be scarce in new DB)
      const revenueTrendChart = [
        { date: 'Day 1', amount: 4000 }, { date: 'Day 2', amount: 3000 },
        { date: 'Day 3', amount: 5000 }, { date: 'Day 4', amount: 2000 },
        { date: 'Day 5', amount: 6000 }, { date: 'Day 6', amount: 4500 },
        { date: 'Day 7', amount: 7000 }
      ];

      setCharts({
        businessTypes: businessTypesChart,
        revenueTrend: revenueTrendChart,
        userActivity: [
          { day: 'Mon', logins: 120 }, { day: 'Tue', logins: 150 },
          { day: 'Wed', logins: 180 }, { day: 'Thu', logins: 140 },
          { day: 'Fri', logins: 200 }, { day: 'Sat', logins: 90 },
          { day: 'Sun', logins: 80 }
        ],
        topBusinesses: [
          { name: 'Abul Store', revenue: 50000 },
          { name: 'Tech Solutions', revenue: 45000 },
          { name: 'Fashion Hub', revenue: 30000 }
        ]
      });

      // 3. Fetch Recent Activity
      const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentBusinesses } = await supabase
        .from('businesses')
        .select('*, profiles:owner_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity({
        auditLogs: recentLogs || [],
        newBusinesses: recentBusinesses || [],
        newUsers: recentUsers || []
      });

    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading admin analytics..." />;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <Button variant="outline" className="gap-2" onClick={fetchDashboardData}>
          <Activity className="h-4 w-4" /> Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Tx Today</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Businesses by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.businessTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.businessTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Recent Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.newBusinesses.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <p className="font-medium text-white">{biz.name}</p>
                    <p className="text-sm text-slate-400">{biz.type}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(biz.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {recentActivity.newBusinesses.length === 0 && <p className="text-slate-500">No recent businesses</p>}
            </div>
            <Button variant="link" className="text-blue-400 p-0 mt-4" onClick={() => navigate('/admin/businesses')}>
              View All Businesses <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-slate-800" onClick={() => navigate('/admin/businesses')}>
              <Building2 className="h-6 w-6 text-blue-500" />
              Manage Businesses
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-slate-800" onClick={() => navigate('/admin/users')}>
              <Users className="h-6 w-6 text-green-500" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-slate-800" onClick={() => navigate('/admin/settings')}>
              <Settings className="h-6 w-6 text-orange-500" />
              System Settings
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-slate-800" onClick={() => navigate('/admin/audit-logs')}>
              <FileText className="h-6 w-6 text-purple-500" />
              View Logs
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-slate-800" onClick={() => navigate('/admin/backups')}>
              <Database className="h-6 w-6 text-red-500" />
              Manage Backups
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
