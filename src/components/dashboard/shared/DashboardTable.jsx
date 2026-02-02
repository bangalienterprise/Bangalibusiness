import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardTable = ({ 
  title, 
  headers = [], 
  children, 
  loading = false, 
  onViewAll,
  emptyMessage = "No recent records found." 
}) => {
  const hasData = React.Children.count(children) > 0;

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700 shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium text-slate-100">{title}</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary hover:text-primary/80">
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading records...</p>
          </div>
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                {headers.map((header, index) => (
                  <TableHead key={index} className="text-slate-400 font-medium h-10">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {children}
            </TableBody>
          </Table>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground border-2 border-dashed border-slate-700/50 rounded-lg">
            <div className="bg-slate-700/50 p-3 rounded-full mb-3">
              <FileText className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardTable;