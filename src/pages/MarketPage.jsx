import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketplaceView from '@/components/market/MarketplaceView';
import MarketOverviewPage from '@/components/market/MarketOverviewPage';
import SalesHistory from '@/components/market/SalesHistory';
import { ShoppingCart, History, BarChart3 } from 'lucide-react';

const MarketPage = () => {
    return (
        <div className="h-[calc(100vh-4rem)] p-4 md:p-6 space-y-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Market & Sales</h1>
                    <p className="text-muted-foreground">Manage sales, view history, and track market performance.</p>
                </div>
            </div>

            <Tabs defaultValue="new-sale" className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                        <TabsTrigger value="new-sale" className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden sm:inline">New Sale</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">History</span>
                        </TabsTrigger>
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="new-sale" className="flex-1 min-h-0 mt-0">
                    <MarketplaceView />
                </TabsContent>
                
                <TabsContent value="history" className="flex-1 min-h-0 mt-0 overflow-auto">
                    <SalesHistory />
                </TabsContent>

                <TabsContent value="overview" className="flex-1 min-h-0 mt-0 overflow-auto">
                    <MarketOverviewPage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MarketPage;