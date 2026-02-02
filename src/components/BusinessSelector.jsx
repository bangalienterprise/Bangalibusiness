
import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building, ChevronDown, Check } from 'lucide-react';

const BusinessSelector = () => {
  const { accessibleBusinesses, currentBusiness, selectBusiness } = useBusiness();

  if (accessibleBusinesses.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <div className="flex items-center truncate">
            <Building className="mr-2 h-4 w-4 opacity-50" />
            <span className="truncate">{currentBusiness?.name || 'Select Business'}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accessibleBusinesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onSelect={() => selectBusiness(business.id)}
            className="justify-between"
          >
            <span>{business.name}</span>
            {currentBusiness?.id === business.id && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BusinessSelector;
