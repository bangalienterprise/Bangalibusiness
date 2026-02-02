import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">System Status</h1>
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>System Operational</AlertTitle>
        <AlertDescription>
          Running in Local Mode (Mock Data / LocalStorage).
        </AlertDescription>
      </Alert>
      <Card>
          <CardHeader><CardTitle>Environment</CardTitle></CardHeader>
          <CardContent>
              <p>Storage: LocalStorage</p>
              <p>Auth: Mock Auth Provider</p>
          </CardContent>
      </Card>
    </div>
  );
}