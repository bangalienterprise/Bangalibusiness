
import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const InventoryHealth = () => {
  const { business } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ outOfStock: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business?.id) {
      fetchInventoryHealth();
    }
  }, [business]);

  const fetchInventoryHealth = async () => {
    try {
      // Fetch all products to calculate locally or use count queries
      // Using simple fetch for now as database size is unknown but likely manageable for this scope
      const { data: products, error } = await supabase
        .from('products')
        .select('stock_quantity, alert_qty')
        .eq('business_id', business.id);

      if (error) throw error;

      const outOfStock = products.filter(p => (p.stock_quantity || 0) <= 0).length;
      const lowStock = products.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= (p.alert_qty || 5)).length;

      setStats({ outOfStock, lowStock });
    } catch (error) {
      console.error('Error fetching inventory health:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <div className="h-5 w-1 bg-red-500 rounded-full"></div> Inventory Health
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-slate-200 font-medium">Out of Stock</span>
          </div>
          <span className="text-2xl font-bold text-red-500">{loading ? '-' : stats.outOfStock}</span>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-slate-200 font-medium">Low Stock</span>
          </div>
          <span className="text-2xl font-bold text-orange-500">{loading ? '-' : stats.lowStock}</span>
        </div>

        <Button 
            variant="ghost" 
            className="w-full text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 mt-auto"
            onClick={() => navigate('/retail/products')}
        >
            Manage Inventory <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default InventoryHealth;
