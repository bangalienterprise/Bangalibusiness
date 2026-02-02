import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, User as UserIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import UserHoverCard from '@/components/users/UserHoverCard';

const roleBadgeStyle = {
  owner: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/30',
  admin: 'bg-red-400/20 text-red-400 border-red-400/30 hover:bg-red-400/30',
  manager: 'bg-blue-400/20 text-blue-400 border-blue-400/30 hover:bg-blue-400/30',
  seller: 'bg-green-400/20 text-green-400 border-green-400/30 hover:bg-green-400/30',
};

const SellerSelector = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const { sellers, loading } = useBusiness();
  const { profile } = useAuth();

  const sellerOptions = useMemo(() => {
    let availableSellers = [];
    if(profile?.role === 'owner' || profile?.role === 'admin') {
      availableSellers = sellers || [];
    } else if (profile?.role === 'manager') {
      availableSellers = sellers?.filter(s => s.manager_id === profile.id || s.id === profile.id) || [];
    } else {
      // If user is a seller, they might only see themselves or no selection option is needed
      availableSellers = sellers?.filter(s => s.id === profile.id) || [];
    }
    
    return availableSellers.map(seller => ({
      value: seller.id,
      label: seller.full_name || seller.username,
      ...seller
    }));
  }, [sellers, profile]);

  const selectedSeller = sellerOptions.find(s => s.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
          disabled={loading || disabled}
        >
          {selectedSeller ? (
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedSeller.avatar_url} alt={selectedSeller.label} />
                <AvatarFallback>{selectedSeller.label?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">{selectedSeller.label}</span>
              <Badge className={cn("capitalize text-[10px] ml-2 px-1.5 h-5 hidden sm:inline-flex", roleBadgeStyle[selectedSeller.role])}>
                  {selectedSeller.role}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <UserIcon className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : value === null ? "Unassigned" : "Select seller"}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search seller..." />
          <CommandList>
            <CommandEmpty>No seller found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                  <div className="flex items-center justify-between w-full p-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-muted-foreground"/>
                        </div>
                        <span>Unassigned</span>
                    </div>
                    <Check className={cn("h-4 w-4", value === null ? "opacity-100" : "opacity-0")} />
                  </div>
              </CommandItem>
              {sellerOptions.map((seller) => (
                <CommandItem
                  key={seller.value}
                  value={`${seller.label} ${seller.email}`}
                  onSelect={() => {
                    onChange(seller.value);
                    setOpen(false);
                  }}
                  className="!p-0 cursor-pointer"
                >
                    <div className="flex items-center justify-between w-full p-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={seller.avatar_url} alt={seller.label} />
                            <AvatarFallback>{seller.label?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{seller.label}</p>
                                <Badge className={cn("text-[10px] px-1 h-4", roleBadgeStyle[seller.role])}>{seller.role}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{seller.email}</p>
                          </div>
                        </div>
                        <Check
                            className={cn(
                            "h-4 w-4 ml-2 shrink-0",
                            value === seller.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SellerSelector;