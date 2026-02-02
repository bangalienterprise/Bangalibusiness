import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Plus } from 'lucide-react';

const PortfolioPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Portfolio - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PenTool className="h-5 w-5" /> My Works
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        Your portfolio is empty.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PortfolioPage;