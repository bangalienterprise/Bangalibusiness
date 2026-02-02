import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExportButton from './ExportButton';
import { DataExportService } from '@/lib/services/DataExportService';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';

const ExportSection = () => {
  const { activeBusiness } = useBusiness();
  const { user } = useAuth();
  
  if (!activeBusiness || !user) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Customers Export */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Customers & Clients</CardTitle>
          <CardDescription className="text-slate-400">
            Download a CSV file with your customers details including contact info and address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton 
            label="Export Customers (CSV)" 
            onExport={() => DataExportService.exportCustomers(activeBusiness.id, user.role)}
            filenamePrefix="customers"
          />
        </CardContent>
      </Card>

      {/* Sales/Orders Export */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Orders & Projects</CardTitle>
          <CardDescription className="text-slate-400">
            Export your sales history, orders, bookings, or projects depending on your business type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton 
            label="Export Orders (CSV)" 
            onExport={() => DataExportService.exportSales(activeBusiness.id, user.role)}
            filenamePrefix="sales_orders"
          />
        </CardContent>
      </Card>

      {/* Products/Services Export */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Products & Services</CardTitle>
          <CardDescription className="text-slate-400">
            Get a list of all your products, services, inventory levels, and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton 
            label="Export Products (CSV)" 
            onExport={() => DataExportService.exportProducts(activeBusiness.id, user.role)}
            filenamePrefix="products_inventory"
          />
        </CardContent>
      </Card>

      {/* Transactions Export */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Transactions & Payments</CardTitle>
          <CardDescription className="text-slate-400">
            Download detailed payment collection history and transaction records.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ExportButton 
            label="Export Transactions (CSV)" 
            onExport={() => DataExportService.exportTransactions(activeBusiness.id, user.role)}
            filenamePrefix="transactions"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportSection;