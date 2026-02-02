
import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export const useExportData = () => {
  const { toast } = useToast();

  const exportToCSV = useCallback((data, filename, columns) => {
    if (!data || data.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data available to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Transform data based on columns map if provided
      const csvData = columns ? data.map(item => {
        const row = {};
        Object.keys(columns).forEach(key => {
            // Support nested keys like 'customer.name'
            const value = key.split('.').reduce((obj, k) => obj && obj[k], item);
            row[columns[key]] = value;
        });
        return row;
      }) : data;

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const finalFilename = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', finalFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Data exported to ${finalFilename}`
      });

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return { exportToCSV };
};
