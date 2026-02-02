import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const SellerSummary = ({ sellers, sales, onSellerClick, onSaleClick }) => {
    const sellerStats = sellers.map(seller => {
        const sellerSales = sales.filter(s => s.seller_id === seller.id);
        const totalSales = sellerSales.reduce((sum, s) => sum + (s.final_amount || 0), 0);
        const totalCollections = sellerSales.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
        const outstandingDue = totalSales - totalCollections;
        const recentSale = sellerSales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))[0];
        
        return {
            ...seller,
            totalSales,
            totalCollections,
            outstandingDue,
            recentSale
        };
    }).sort((a,b) => b.totalSales - a.totalSales);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seller Leaderboard</CardTitle>
                <CardDescription>Performance metrics by seller.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                        {sellerStats.map((seller) => (
                            <div
                                key={seller.id}
                                className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="ml-4 flex-1 space-y-1">
                                    <p
                                        className="text-sm font-medium leading-none cursor-pointer hover:underline"
                                        onClick={() => onSellerClick(seller.id)}
                                    >
                                        {seller.username}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Sales: <span className="text-green-500 font-semibold">৳{seller.totalSales.toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Collections: <span className="text-blue-500 font-semibold">৳{seller.totalCollections.toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Dues: <span className="text-orange-500 font-semibold">৳{seller.outstandingDue.toLocaleString()}</span>
                                    </p>
                                </div>
                                {seller.recentSale &&
                                    <button
                                        onClick={() => onSaleClick(seller.recentSale.id)}
                                        className="text-xs text-right text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Last Sale: ৳{seller.recentSale.final_amount.toLocaleString()}
                                    </button>
                                }
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

SellerSummary.propTypes = {
    sellers: PropTypes.array.isRequired,
    sales: PropTypes.array.isRequired,
    onSellerClick: PropTypes.func.isRequired,
    onSaleClick: PropTypes.func.isRequired,
};

export default SellerSummary;