import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DamageForm from '@/components/damage/DamageForm';
import DamageHistory from '@/components/damage/DamageHistory';
import ReplacementDialog from '@/components/damage/ReplacementDialog';
import ReplacementHistory from '@/components/damage/ReplacementHistory';
import { FileWarning, History, RotateCw, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DamageManagement = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isReplacementDialogOpen, setIsReplacementDialogOpen] = useState(false);

    const handleActionConfirmed = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <Helmet>
                <title>Damage & Replacements - Bangali Enterprise</title>
                <meta name="description" content="Record and manage damaged or replaced products." />
            </Helmet>
            <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Damage & Replacements</h1>
                        <p className="text-muted-foreground">Record damaged products, process replacements, and view historical data.</p>
                    </div>
                     <Button onClick={() => setIsReplacementDialogOpen(true)}>
                        <RotateCw className="mr-2 h-4 w-4" /> Process Replacement
                    </Button>
                </div>

                <Tabs defaultValue="record" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="record">
                            <FileWarning className="mr-2 h-4 w-4" />
                            Record Damage
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <History className="mr-2 h-4 w-4" />
                            Damage History
                        </TabsTrigger>
                         <TabsTrigger value="replacement_history">
                            <Wrench className="mr-2 h-4 w-4" />
                            Replacement History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="record" className="mt-6">
                        <DamageForm onDamageConfirmed={handleActionConfirmed} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-6">
                        <DamageHistory refreshTrigger={refreshTrigger} />
                    </TabsContent>
                    <TabsContent value="replacement_history" className="mt-6">
                        <ReplacementHistory refreshTrigger={refreshTrigger} />
                    </TabsContent>
                </Tabs>
            </motion.div>
            <ReplacementDialog open={isReplacementDialogOpen} onOpenChange={setIsReplacementDialogOpen} onSuccess={handleActionConfirmed} />
        </>
    );
};

export default DamageManagement;