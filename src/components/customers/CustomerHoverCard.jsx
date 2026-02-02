import React, { useMemo } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, ShoppingBag, CircleDollarSign, TrendingDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useBusiness } from '@/contexts/BusinessContext';

const CustomerHoverCard = ({ customer, children }) => {
  const { sales, loading } = useBusiness();

  const stats = useMemo(() => {
    if (!sales || sales.length === 0 || !customer) return { total_spent: 0, total_due: 0, purchase_count: 0 };
    
    const customerSales = sales.filter(s => s.customer_id === customer.id);
    
    return customerSales.reduce((acc, sale) => {
        acc.total_spent += sale.amount_paid || 0;
        acc.total_due += (sale.final_amount - sale.amount_paid) || 0;
        return acc;
    }, { total_spent: 0, total_due: 0, purchase_count: customerSales.length });

  }, [sales, customer]);

  if (!customer) return <>{children}</>;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarFallback>{customer.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">{customer.name}</h4>
             <div className="flex items-center pt-1">
              <Badge variant="secondary">Customer</Badge>
            </div>
            <div className="flex items-center pt-2 text-xs text-muted-foreground gap-2">
              <Mail className="h-3 w-3" /> {customer.email || 'No email'}
            </div>
             <div className="flex items-center text-xs text-muted-foreground gap-2">
              <Phone className="h-3 w-3" /> {customer.phone || 'No phone'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground gap-2">
              <MapPin className="h-3 w-3" /> {customer.address || 'No address'}
            </div>
          </div>
        </div>
        {loading ? <p className="text-xs text-center mt-4">Loading stats...</p> : (
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-secondary/50">
                    <ShoppingBag className="h-4 w-4 mb-1 text-muted-foreground"/>
                    <p className="font-semibold">{stats.purchase_count}</p>
                    <p className="text-muted-foreground">Purchases</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-secondary/50">
                    <CircleDollarSign className="h-4 w-4 mb-1 text-muted-foreground"/>
                    <p className="font-mono font-semibold">৳{stats.total_spent.toLocaleString()}</p>
                    <p className="text-muted-foreground">Spent</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-secondary/50">
                    <TrendingDown className="h-4 w-4 mb-1 text-red-500"/>
                    <p className="font-mono font-semibold text-red-500">৳{stats.total_due.toLocaleString()}</p>
                    <p className="text-muted-foreground">Due</p>
                </div>
            </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default CustomerHoverCard;