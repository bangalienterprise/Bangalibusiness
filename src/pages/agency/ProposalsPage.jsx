import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

const ProposalsPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Proposals - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> Create Proposal</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Recent Proposals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        No proposals generated yet.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProposalsPage;