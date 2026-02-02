import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SalesRepSelector = ({ sellers, selectedSellerId, onChange, canChange, className }) => {
    if (!sellers || sellers.length === 0) return null;

    if (!canChange) {
        const current = sellers.find(s => s.id === selectedSellerId);
        return (
            <div className={cn("flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50", className)}>
                <UserCircle2 className="h-4 w-4 text-blue-400" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 leading-none">Sold By</span>
                    <span className="text-sm font-medium text-white leading-tight">{current?.full_name || 'Me'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="hidden md:block">
                <UserCircle2 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
                 <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Sales Rep</label>
                 <Select value={selectedSellerId} onValueChange={onChange}>
                    <SelectTrigger className="w-[180px] h-9 bg-slate-900 border-slate-700 text-sm focus:ring-blue-500/20">
                        <SelectValue placeholder="Select Seller" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                        {sellers.map(seller => (
                            <SelectItem key={seller.id} value={seller.id} className="text-slate-200 focus:bg-slate-800 focus:text-white">
                                {seller.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default SalesRepSelector;