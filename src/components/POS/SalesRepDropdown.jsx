import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SalesRepDropdown = ({ sellers, selectedSellerId, onChange, canChange }) => {
    if (!sellers || sellers.length === 0) return null;

    return (
        <div className="w-full max-w-[200px]">
            <Label className="text-xs text-slate-500 mb-1 block">Sales Rep (Sold By)</Label>
            <Select 
                value={selectedSellerId} 
                onValueChange={onChange} 
                disabled={!canChange}
            >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-9 text-xs">
                    <SelectValue placeholder="Select Seller" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    {sellers.map(seller => (
                        <SelectItem key={seller.id} value={seller.id} className="text-xs">
                            {seller.full_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SalesRepDropdown;