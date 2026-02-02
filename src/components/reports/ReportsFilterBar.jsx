import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus as CalendarIcon, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DATE_PRESETS, getDateRangeFromPreset } from '@/lib/dateUtils';

const ReportsFilterBar = ({ 
    dateRange, 
    setDateRange, 
    filters, 
    setFilters, 
    filterOptions = {},
    loading 
}) => {
    const [selectedPreset, setSelectedPreset] = useState(DATE_PRESETS.LAST_30_DAYS);

    const handlePresetChange = (value) => {
        setSelectedPreset(value);
        if (value !== DATE_PRESETS.CUSTOM) {
            setDateRange(getDateRangeFromPreset(value));
        }
    };

    const clearFilters = () => {
        setFilters({});
        handlePresetChange(DATE_PRESETS.LAST_30_DAYS);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-6">
            {/* Date Range Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400">Date Range</label>
                <div className="flex gap-2">
                     <Select value={selectedPreset} onValueChange={handlePresetChange} disabled={loading}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={DATE_PRESETS.TODAY}>Today</SelectItem>
                            <SelectItem value={DATE_PRESETS.LAST_7_DAYS}>Last 7 Days</SelectItem>
                            <SelectItem value={DATE_PRESETS.LAST_30_DAYS}>Last 30 Days</SelectItem>
                            <SelectItem value={DATE_PRESETS.THIS_MONTH}>This Month</SelectItem>
                            <SelectItem value={DATE_PRESETS.LAST_MONTH}>Last Month</SelectItem>
                            <SelectItem value={DATE_PRESETS.CUSTOM}>Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedPreset === DATE_PRESETS.CUSTOM && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>

            {/* Dynamic Filters */}
            {filterOptions.sellers && (
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400">Staff</label>
                    <Select 
                        value={filters.sellerId || "all"} 
                        onValueChange={(val) => setFilters(prev => ({ ...prev, sellerId: val === "all" ? null : val }))}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Staff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            {filterOptions.sellers.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.full_name || s.username}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            {/* Clear Button */}
            <div className="flex items-end ml-auto">
                 <Button variant="ghost" size="sm" onClick={clearFilters} disabled={loading} className="text-slate-400 hover:text-white">
                    <FilterX className="mr-2 h-4 w-4" />
                    Reset Filters
                 </Button>
            </div>
        </div>
    );
};

export default ReportsFilterBar;