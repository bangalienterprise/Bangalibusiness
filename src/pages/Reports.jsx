
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateReport } from '@/services/edgeFunctions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Reports = () => {
  const { business } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState({ from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = async (type) => {
    setLoading(true);
    // Format dates for API
    const range = { 
      startDate: date?.from?.toISOString(), 
      endDate: date?.to?.toISOString() 
    };
    
    const result = await generateReport(business.id, type, range);
    
    if (result.success) {
      setReportData(result.report);
      toast({ title: "Report Generated", description: `Successfully loaded ${type} data.` });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
          <p className="text-muted-foreground">Analyze performance and generate insights.</p>
        </div>
        <div className="flex items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4" onValueChange={(val) => handleGenerateReport(val)}>
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Revenue and transaction volume over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center bg-slate-50 border-dashed rounded-md m-4">
              {loading ? "Generating Report..." : (reportData ? JSON.stringify(reportData).slice(0,100) + "..." : "Select date range and generate report")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Health</CardTitle>
              <CardDescription>Stock levels and valuation.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select date range to view historical inventory data.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
         <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Top customers and purchasing habits.</CardDescription>
            </CardHeader>
             <CardContent>
              <p className="text-muted-foreground">Select date range to view customer activity.</p>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>Cost breakdown by category.</CardDescription>
            </CardHeader>
             <CardContent>
              <p className="text-muted-foreground">Select date range to view expense reports.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
