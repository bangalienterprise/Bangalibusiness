
import React, { useEffect, useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { salesService } from '@/services/salesService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const SalesPage = () => {
    const { currentBusiness } = useBusiness();
    const { isSeller } = useAuth();
    const [sales, setSales] = useState([]);

    useEffect(() => {
        if (currentBusiness?.id) {
            salesService.getSalesByBusiness(currentBusiness.id).then(({ data }) => setSales(data || []));
        }
    }, [currentBusiness]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Sales History</h1>
                <Button>New Sale</Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Sold By</TableHead>
                            <TableHead>Total</TableHead>
                            {!isSeller() && <TableHead>Profit</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{sale.customer_name?.name || 'Walk-in'}</TableCell>
                                <TableCell>{sale.sold_by_name?.full_name}</TableCell>
                                <TableCell>{sale.total_amount}</TableCell>
                                {!isSeller() && <TableCell>{sale.profit}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default SalesPage;
