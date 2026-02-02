import React, { useMemo } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from '@/contexts/BusinessContext';
import { BarChart3, CircleDollarSign, TrendingDown, Mail, ShoppingCart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleBadgeStyle = {
  owner: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/30',
  admin: 'bg-red-400/20 text-red-400 border-red-400/30 hover:bg-red-400/30',
  manager: 'bg-blue-400/20 text-blue-400 border-blue-400/30 hover:bg-blue-400/30',
  seller: 'bg-green-400/20 text-green-400 border-green-400/30 hover:bg-green-400/30',
};

const statusStyle = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
}

const UserHoverCard = ({ user, children }) => {
  const { sales, products, users: allUsers } = useBusiness();

  const stats = useMemo(() => {
    if (!user || !sales || !products) return null;

    const isManager = user.role === 'manager';
    const teamMemberIds = isManager ? allUsers.filter(u => u.manager_id === user.id).map(u => u.id) : [];
    if(isManager || user.role === 'seller' || user.role === 'owner') teamMemberIds.push(user.id);

    const relevantSales = sales.filter(s => teamMemberIds.includes(s.seller_id));
    if (relevantSales.length === 0) return { total_net_profit: 0, total_collected: 0, total_due: 0, sales_count: 0 };
    
    const productMap = new Map(products.map(p => [p.id, p]));

    const totals = relevantSales.reduce((acc, sale) => {
        const saleItemsCost = (sale.sale_items || []).reduce((itemSum, item) => {
            const product = productMap.get(item.product_id);
            const cost = product ? product.cost_price * item.quantity : 0;
            return itemSum + cost;
        }, 0);
        acc.total_net_profit += sale.final_amount - saleItemsCost;
        acc.total_collected += sale.amount_paid;
        acc.total_due += sale.final_amount - sale.amount_paid;
        return acc;
    }, { total_net_profit: 0, total_collected: 0, total_due: 0, sales_count: relevantSales.length });

    return { ...totals, teamSize: isManager ? teamMemberIds.length -1 : undefined };

  }, [user, sales, products, allUsers]);

  if (!user) return <>{children}</>;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">{user.full_name || user.username}</h4>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <div className="flex items-center gap-2 pt-1">
              <Badge className={cn("capitalize", roleBadgeStyle[user.role])}>{user.role?.replace(/_/g, ' ')}</Badge>
              {user.status && <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", statusStyle[user.status])}></span>
                  <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
              </div>}
            </div>
            
          </div>
        </div>
         <div className="flex items-center pt-2 mt-2 border-t border-border">
              <Mail className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                {user.email || 'No email available'}
              </span>
            </div>
        {stats ? (
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                {stats.teamSize !== undefined && (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground"/>
                        <div>
                            <p className="font-semibold">Team Size</p>
                            <p className="font-mono">{stats.teamSize}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">{stats.teamSize !== undefined ? 'Team Sales' : 'Total Sales'}</p>
                        <p className="font-mono">{stats.sales_count.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">Net Profit</p>
                        <p className="font-mono text-green-500">৳{stats.total_net_profit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">Collected</p>
                        <p className="font-mono">৳{stats.total_collected?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">Market Due</p>
                        <p className="font-mono text-red-500">৳{stats.total_due?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>
        ) : (
             <p className='text-center text-sm text-muted-foreground mt-4'>No sales stats available.</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;