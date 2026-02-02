import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SalesRepDropdown = ({ sellers, selectedSellerId, onChange, canChange }) => {
    if (!sellers || sellers.length === 0) return null;

    if (!canChange) {
        const current = sellers.find(s => s.id === selectedSellerId);
        return (
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                <span>Sold By:</span>
                <span className="text-white font-medium">{current?.full_name || 'Me'}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sold By:</span>
            <Select value={selectedSellerId} onValueChange={onChange}>
                <SelectTrigger className="w-[180px] h-8 bg-slate-900 border-slate-700 text-xs">
                    <SelectValue placeholder="Select Seller" />
                </SelectTrigger>
                <SelectContent>
                    {sellers.map(seller => (
                        <SelectItem key={seller.id} value={seller.id}>{seller.full_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SalesRepDropdown;