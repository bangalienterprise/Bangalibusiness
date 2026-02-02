import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Archive, TrendingUp, TrendingDown, Layers, AlertTriangle, UserCheck } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SellerSummary from '@/components/admin/SellerSummary';

const DashboardSummaryPage = ({ sales, products, damages, sellers, onSellerClick, onSaleClick }) => {
    const summaryStats = useMemo(() => {
        const totalSales = sales.reduce((acc, sale) => acc + sale.final_amount, 0);
        const totalCollections = sales.reduce((acc, sale) => acc + sale.amount_paid, 0);
        const totalDues = totalSales - totalCollections;
        const totalDamageCost = damages.reduce((acc, damage) => acc + (damage.loss_amount || 0), 0);
        const stockBuyingValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.cost_price || 0)), 0);
        const stockSellingValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.selling_price || 0)), 0);
        const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

        return {
            totalSales,
            totalCollections,
            totalDues,
            totalDamageCost,
            stockBuyingValue,
            stockSellingValue,
            totalStockUnits
        };
    }, [sales, products, damages]);

    const sellerPerformanceData = useMemo(() => {
        return sellers.map(seller => {
            const sellerSales = sales.filter(sale => sale.seller_id === seller.id);
            const totalSales = sellerSales.reduce((acc, sale) => acc + sale.final_amount, 0);
            return {
                name: seller.username,
                sales: totalSales,
            };
        });
    }, [sales, sellers]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value (Buying)</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{summaryStats.stockBuyingValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value (Selling)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{summaryStats.stockSellingValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Units</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalStockUnits.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Damage Cost</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">৳{summaryStats.totalDamageCost.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">৳{summaryStats.totalSales.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                        <UserCheck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">৳{summaryStats.totalCollections.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Dues</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">৳{summaryStats.totalDues.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Seller Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <RechartsBarChart data={sellerPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="sales" fill="hsl(var(--primary))" name="Total Sales" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <div className="lg:col-span-3">
                     <SellerSummary sellers={sellers} sales={sales} onSellerClick={onSellerClick} onSaleClick={onSaleClick} />
                </div>
            </div>
        </div>
    );
};

DashboardSummaryPage.propTypes = {
    sales: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    damages: PropTypes.array.isRequired,
    sellers: PropTypes.array.isRequired,
    onSellerClick: PropTypes.func.isRequired,
    onSaleClick: PropTypes.func.isRequired,
};

export default DashboardSummaryPage;