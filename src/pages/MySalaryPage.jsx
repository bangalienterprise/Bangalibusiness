import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { DollarSign, Calendar, Landmark, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import SuspenseLoader from '@/components/SuspenseLoader';

const MySalaryPage = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [salaryRecords, setSalaryRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSalary = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('salaries')
            .select('*')
            .eq('user_id', user.id)
            .order('payment_date', { ascending: false });
        
        if (error) {
            toast({ title: 'Error fetching salary records', description: error.message, variant: 'destructive' });
        } else {
            setSalaryRecords(data || []);
        }
        setLoading(false);
    }, [user, toast]);

    useEffect(() => {
        fetchSalary();
    }, [fetchSalary]);

    const totalSalary = salaryRecords.reduce((sum, record) => sum + Number(record.amount), 0);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
    
    if (loading && !profile) {
        return <SuspenseLoader />;
    }

    return (
        <>
            <Helmet>
                <title>My Salary - Bangali Enterprise</title>
                <meta name="description" content="View your salary collection history." />
            </Helmet>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold">My Salary</h1>
                    <p className="text-muted-foreground">Your personal salary collection history.</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Salary Received</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">৳{totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">Across all recorded payments</p>
                        </CardContent>
                    </Card>
                </motion.div>
                
                <motion.div variants={itemVariants} className="space-y-4">
                     {loading ? (
                        <p className="text-center text-muted-foreground">Loading salary records...</p>
                    ) : salaryRecords.length > 0 ? (
                        salaryRecords.map(record => (
                            <motion.div key={record.id} variants={itemVariants}>
                                <Card className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${record.payment_method === 'Cash' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                                            {record.payment_method === 'Cash' ? 
                                             <Banknote className="h-6 w-6 text-green-500" /> : 
                                             <Landmark className="h-6 w-6 text-blue-500" />}
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold">৳{Number(record.amount).toLocaleString('en-IN')}</p>
                                            {record.notes && <p className="text-xs text-muted-foreground">{record.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 sm:mt-0">
                                         <Badge variant="outline" className="capitalize">{record.payment_method}</Badge>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(record.payment_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No salary records found.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </>
    );
};

export default MySalaryPage;