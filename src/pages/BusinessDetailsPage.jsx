import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Package, ShoppingCart, AlertTriangle, Briefcase, Users, ArrowLeft } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import SuspenseLoader from '@/components/SuspenseLoader';

const StatsCard = ({ title, value, icon: Icon, trend, trendUp, variant = "default" }) => {
    const variantClasses = {
        default: { bg: 'bg-card', iconText: 'text-primary', iconBg: 'bg-primary/10' },
        green: { bg: 'bg-green-500/10', iconText: 'text-green-500', iconBg: 'bg-green-500/20' },
        red: { bg: 'bg-red-500/10', iconText: 'text-red-500', iconBg: 'bg-red-500/20' }
    };
    const classes = variantClasses[variant] || variantClasses.default;
    
    return (
        <motion.div
            className={`rounded-xl border border-border p-4 sm:p-6 flex flex-col justify-between ${classes.bg}`}
            whileHover={{ translateY: -5, boxShadow: '0 10px 20px hsla(var(--primary), 0.1)' }}
        >
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className={`p-2 rounded-lg ${classes.iconBg}`}><Icon className={`h-5 w-5 ${classes.iconText}`} /></div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{value}</p>
            {trend && <p className={`text-xs mt-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</p>}
        </motion.div>
    );
};

const BusinessDetailsPage = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const { activeBusiness, users, products, sales, damages } = useBusiness();
    const { toast } = useToast();
    
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, totalProfit: 0, totalProducts: 0, totalStock: 0, totalStockValue: 0, totalSales: 0, totalUnitsSold: 0, totalDamages: 0, totalLoss: 0 });

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('businesses').select('*').eq('id', businessId).single();
        
        if (error || !data) {
            toast({ title: "Error", description: "Could not find business.", variant: "destructive" });
            setLoading(false);
            return;
        }
        setBusiness(data);
        setLoading(false);
    }, [businessId, toast]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    useEffect(() => {
        if(business) {
            const businessProducts = products.filter(p => p.business_id === business.id);
            const businessSales = sales.filter(s => s.business_id === business.id);
            const businessDamages = damages.filter(d => d.business_id === business.id);
            
            const productStats = {
                totalProducts: businessProducts.length,
                totalStock: businessProducts.reduce((acc, p) => acc + (p.stock || 0), 0),
                totalStockValue: businessProducts.reduce((acc, p) => acc + ((p.cost_price || 0) * (p.stock || 0)), 0),
            };

            const salesStats = {
                totalSales: businessSales.length,
                totalRevenue: businessSales.reduce((acc, s) => acc + (s.final_amount || 0), 0),
                totalUnitsSold: businessSales.reduce((acc, s) => acc + (s.sale_items?.reduce((itemAcc, item) => itemAcc + item.quantity, 0) || 0), 0),
            };

            const damageStats = {
                totalDamages: businessDamages.length,
                totalLoss: businessDamages.reduce((acc, d) => acc + (d.loss_amount || 0), 0),
            };

            setStats(prev => ({ ...prev, ...productStats, ...salesStats, ...damageStats }));
        }
    }, [business, products, sales, damages]);

    if (loading) {
        return <SuspenseLoader />;
    }

    if (!business) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold">Business Not Found</h1>
                <p className="text-muted-foreground mt-2">The business you are looking for does not exist.</p>
                <Button onClick={() => navigate('/businesses')} className="mt-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Business Management
                </Button>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{business.name} - Business Details</title>
                <meta name="description" content={`Detailed business profile for ${business.name}.`} />
            </Helmet>

            <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/businesses')}><ArrowLeft className="h-4 w-4" /></Button>
                    <div className="flex items-center gap-4">
                        {business.icon_url ? (
                            <img src={business.icon_url} alt={`${business.name} icon`} className="h-12 w-12 object-contain rounded-lg bg-card p-2 shadow-lg" />
                        ) : <Briefcase className="h-12 w-12 text-primary" />}
                        <div>
                            <h1 className="text-3xl font-bold">{business.name}</h1>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1"><Users className="h-4 w-4" />Owner: {business.owner_name}</p>
                        </div>
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-bold mb-4">Financial Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard title="Total Revenue" value={`৳${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} variant="green" />
                        <StatsCard title="Total Expenses" value={`৳${(stats.totalExpenses || 0).toLocaleString()}`} icon={TrendingDown} variant="red" />
                        <StatsCard title="Net Profit" value={`৳${(stats.totalProfit || 0).toLocaleString()}`} icon={TrendingUp} variant={(stats.totalProfit || 0) >= 0 ? 'default' : 'red'} />
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">Inventory Snapshot</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard title="Unique Products" value={(stats.totalProducts || 0).toLocaleString()} icon={Package} />
                        <StatsCard title="Total Stock Units" value={(stats.totalStock || 0).toLocaleString()} icon={Package} />
                        <StatsCard title="Est. Stock Value" value={`৳${(stats.totalStockValue || 0).toLocaleString()}`} icon={Package} />
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-bold mb-4">Sales Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatsCard title="Sales Orders" value={(stats.totalSales || 0).toLocaleString()} icon={ShoppingCart} />
                        <StatsCard title="Units Sold" value={(stats.totalUnitsSold || 0).toLocaleString()} icon={ShoppingCart} />
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-bold mb-4">Damages & Losses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatsCard title="Damaged Item Records" value={(stats.totalDamages || 0).toLocaleString()} icon={AlertTriangle} variant="red" />
                        <StatsCard title="Total Loss" value={`৳${(stats.totalLoss || 0).toLocaleString()}`} icon={AlertTriangle} variant="red" />
                    </div>
                </section>
            </motion.div>
        </>
    );
};

export default BusinessDetailsPage;