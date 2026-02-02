import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

const ClientPortalPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Client Portal - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
                <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Client</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Active Clients
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        No clients added to the portal.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientPortalPage;