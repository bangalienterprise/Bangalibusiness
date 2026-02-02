import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const ExportButton = ({ label, onExport, filenamePrefix = 'export' }) => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setStatus('loading');
      const csvData = await onExport();
      
      if (!csvData) {
        throw new Error("No data generated");
      }

      // Trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const filename = `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus('success');
      toast({
        title: "Export Successful",
        description: `File ${filename} has been downloaded.`
      });

      // Reset status after a moment
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error("Export failed:", error);
      setStatus('error');
      toast({
        title: "Export Failed",
        description: "We couldn't prepare this export. Please try again.",
        variant: "destructive"
      });
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={status === 'loading'} 
      className="w-full sm:w-auto min-w-[200px]"
      variant={status === 'error' ? "destructive" : "default"}
    >
      {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
      {status === 'error' && <AlertCircle className="mr-2 h-4 w-4" />}
      {status === 'idle' && <Download className="mr-2 h-4 w-4" />}
      
      {status === 'loading' ? 'Preparing...' : 
       status === 'success' ? 'Downloaded!' : 
       status === 'error' ? 'Failed' : 
       label}
    </Button>
  );
};

export default ExportButton;