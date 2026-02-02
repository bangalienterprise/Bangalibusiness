import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';

const ServiceListPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Service Catalog - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Service List</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> Add New Service</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" /> Available Services
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        No services defined. Click "Add New Service" to get started.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ServiceListPage;