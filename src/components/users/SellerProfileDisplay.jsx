import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from '@/contexts/BusinessContext';
import { BarChart3, CircleDollarSign, TrendingDown, ShoppingCart } from 'lucide-react';

const SellerProfileDisplay = ({ user }) => {
  const { sales, products } = useBusiness();

  const stats = useMemo(() => {
    if (!user || !sales || !products) return null;

    const sellerSales = sales.filter(s => s.seller_id === user.id);
    if (sellerSales.length === 0) return { total_net_profit: 0, total_collected: 0, total_due: 0, sales_count: 0 };

    const productMap = new Map(products.map(p => [p.id, p]));
    
    return sellerSales.reduce((acc, sale) => {
        const saleItemsCost = (sale.sale_items || []).reduce((itemSum, item) => {
          const product = productMap.get(item.product_id);
          const cost = product ? product.cost_price * item.quantity : 0;
          return itemSum + cost;
        }, 0);

        acc.total_net_profit += sale.final_amount - saleItemsCost;
        acc.total_collected += sale.amount_paid;
        acc.total_due += sale.final_amount - sale.amount_paid;
        return acc;
    }, { total_net_profit: 0, total_collected: 0, total_due: 0, sales_count: sellerSales.length });

  }, [user, sales, products]);
  
  if (!user) return null;

  const renderStat = (label, value, Icon, colorClass = '') => (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClass || 'text-muted-foreground'}`}/>
      <div>
          <p className="text-xs font-semibold">{label}</p>
          <p className={`font-mono text-sm font-bold ${colorClass}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar_url} alt={user.username} />
          <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold text-lg">{user.full_name || user.username}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize text-xs">{user.role?.replace(/_/g, ' ')}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-semibold mb-3">Sales Performance</h4>
        {stats ? (
          <div className="grid grid-cols-2 gap-4">
            {renderStat('Sales', (stats.sales_count || 0).toLocaleString(), ShoppingCart)}
            {renderStat('Net Profit', `৳${Number(stats.total_net_profit || 0).toLocaleString()}`, BarChart3, 'text-green-500')}
            {renderStat('Collected', `৳${Number(stats.total_collected || 0).toLocaleString()}`, CircleDollarSign)}
            {renderStat('Market Due', `৳${Number(stats.total_due || 0).toLocaleString()}`, TrendingDown, 'text-red-500')}
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground h-[76px] flex items-center justify-center">No sales stats available.</p>
        )}
      </div>
    </div>
  );
};

export default SellerProfileDisplay;