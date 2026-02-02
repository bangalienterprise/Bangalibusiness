import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { calculateCommission } from '@/utils/commissionCalculator';

const CommissionHistory = ({ 
    commissions = [], 
    currency = '৳'
}) => {
    if (!commissions || commissions.length === 0) {
        return <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded bg-slate-900/50">No commission history found.</div>;
    }

    return (
        <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-900">
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400 text-right">Sale Amount</TableHead>
                        <TableHead className="text-slate-400 text-center">Rate</TableHead>
                        <TableHead className="text-slate-400 text-right">Commission</TableHead>
                        <TableHead className="text-slate-400">Sale ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {commissions.map((item, idx) => (
                        <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                            <TableCell className="text-slate-300 text-xs">
                                {new Date(item.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right text-slate-300">
                                {currency}{parseFloat(item.total).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="border-blue-900/50 text-blue-400 text-[10px]">
                                    {item.commission_percentage}%
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-400">
                                {currency}{parseFloat(item.commission_amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 font-mono">
                                #{item.id.slice(0, 8)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default CommissionHistory;