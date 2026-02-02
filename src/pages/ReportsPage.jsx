import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ReportsPage = () => {
  const { activeBusiness } = useBusiness();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');

  const businessType = activeBusiness?.type || 'retail';

  const REPORT_TYPES = {
    retail: [
      { id: 'sales', name: 'Sales Performance', icon: TrendingUp, desc: 'Revenue, profit margins, and top selling items' },
      { id: 'inventory', name: 'Inventory Value', icon: BarChart3, desc: 'Current stock value and low stock alerts' },
      { id: 'customers', name: 'Customer Insights', icon: Users, desc: 'Purchase frequency and top customers' }
    ],
    agency: [
      { id: 'projects', name: 'Project Status', icon: FileText, desc: 'Active projects, milestones, and deadlines' },
      { id: 'time', name: 'Time Utilization', icon: Calendar, desc: 'Billable hours vs non-billable hours' },
      { id: 'revenue', name: 'Client Revenue', icon: TrendingUp, desc: 'Revenue breakdown by client' }
    ],
    education: [
      { id: 'attendance', name: 'Attendance Report', icon: Users, desc: 'Student attendance trends by class' },
      { id: 'fees', name: 'Fee Collection', icon: TrendingUp, desc: 'Paid vs unpaid fees summary' },
      { id: 'academic', name: 'Academic Results', icon: FileText, desc: 'Student performance analysis' }
    ],
    service: [
      { id: 'appointments', name: 'Appointment History', icon: Calendar, desc: 'Completed vs cancelled appointments' },
      { id: 'staff', name: 'Staff Performance', icon: Users, desc: 'Revenue generated per staff member' },
      { id: 'services', name: 'Service Popularity', icon: BarChart3, desc: 'Most requested services' }
    ],
    freelancer: [
      { id: 'income', name: 'Income Statement', icon: TrendingUp, desc: 'Monthly earnings and expenses' },
      { id: 'tax', name: 'Tax Summary', icon: FileText, desc: 'Estimated tax calculations' },
      { id: 'hours', name: 'Hours Logged', icon: Calendar, desc: 'Total work hours history' }
    ]
  };

  const currentReports = REPORT_TYPES[businessType] || REPORT_TYPES['retail'];

  const handleExport = (reportName) => {
    toast({
      title: "Export Started",
      description: `Generating CSV for ${reportName}...`,
    });
    // Simulation of download
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your report has been downloaded successfully.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <Helmet><title>Reports - Bangali Enterprise</title></Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-slate-400 mt-1">Insights for <span className="capitalize text-blue-400">{businessType}</span> Business</p>
        </div>
        <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => handleExport("All Data")}>
          <Download className="mr-2 h-4 w-4" /> Export All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentReports.map((report) => (
          <Card key={report.id} className="bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <report.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">Live</Badge>
              </div>
              <CardTitle className="text-lg text-white mt-4">{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400 mb-4 h-10">
                {report.desc}
              </CardDescription>
              <Button 
                variant="default" 
                className="w-full bg-slate-900 hover:bg-blue-600 text-white border border-slate-700"
                onClick={() => handleExport(report.name)}
              >
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-700 text-white mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-lg m-6 border border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-400">Chart Visualization</h3>
          <p className="text-sm mt-1">Select a report type above to view detailed graphs</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;