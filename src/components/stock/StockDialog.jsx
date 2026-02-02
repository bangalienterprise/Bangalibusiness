import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { addStock } from '@/lib/database';
import { Plus, Trash2, PackagePlus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const StockDialog = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeBusiness, products, productCategories } = useBusiness();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [cart, setCart] = useState([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentCostPrice, setCurrentCostPrice] = useState('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productCategories) {
        setCategories(['All', ...productCategories.map(c => c.name)]);
    }
  }, [productCategories]);
  
  useEffect(() => {
    // Reset state when dialog opens
    if (open) {
      setCart([]);
      setCurrentProduct('');
      setCurrentQuantity(1);
      setCurrentCostPrice('');
      setSelectedCategory('All');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);
  
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === 'All') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Update cost price when product is selected
  useEffect(() => {
    if (currentProduct) {
        const prod = products.find(p => p.id === currentProduct);
        if (prod) {
            setCurrentCostPrice(prod.cost_price);
        }
    }
  }, [currentProduct, products]);

  const handleAddToCart = () => {
    if(!currentProduct || !currentQuantity || currentQuantity <= 0) {
      toast({ title: "Missing details", description: "Please select a product and a valid quantity.", variant: "destructive" });
      return;
    }
    
    const productDetails = products.find(p => p.id === currentProduct);
    if (!productDetails) return;

    const cost = parseFloat(currentCostPrice) || productDetails.cost_price;

    const existingCartItemIndex = cart.findIndex(item => item.productId === currentProduct);
    if (existingCartItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingCartItemIndex].quantity += parseInt(currentQuantity);
      // Update cost price if changed? Usually FIFO/LIFO matters, but here we just update the entry
      updatedCart[existingCartItemIndex].costPrice = cost; 
      setCart(updatedCart);
    } else {
      setCart([...cart, { 
          productId: productDetails.id, 
          name: productDetails.name, 
          quantity: parseInt(currentQuantity), 
          costPrice: cost 
      }]);
    }
    
    setCurrentProduct('');
    setCurrentQuantity(1);
    setCurrentCostPrice('');
    toast({ title: "Product added to list" });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalCost = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  }, [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if(cart.length === 0) {
      toast({ title: "Empty list", description: "Please add products to the list first.", variant: "destructive" });
      setLoading(false);
      return;
    }
    
    try {
        await addStock({
            business_id: activeBusiness.id,
            added_by: user.id,
            entry_date: date,
            total_cost: totalCost,
            items: cart.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                cost_price: item.costPrice,
                total_cost: item.quantity * item.costPrice
            }))
        });
        
        toast({ title: 'Stock Added!', description: `${cart.length} item(s) have been added to stock.` });
        onSuccess();
        onOpenChange(false);
    } catch (error) {
        console.error("Stock submission error:", error);
        toast({ title: 'Stock Addition Failed', description: error.message, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Stock Entry (Purchase)</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Products</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                {categories.map(cat => (<Button key={cat} type="button" variant={selectedCategory === cat ? 'default' : 'ghost'} onClick={() => setSelectedCategory(cat)} className='px-3 py-1 h-auto rounded-full text-sm whitespace-nowrap'>{cat}</Button>))}
            </div>
            <div className="space-y-2">
                <Label>Product</Label>
                <Select value={currentProduct} onValueChange={setCurrentProduct}>
                    <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {filteredProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="1" min="1" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Cost Price (Per Unit)</Label>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" value={currentCostPrice} onChange={(e) => setCurrentCostPrice(e.target.value)} />
                </div>
            </div>
            <Button type="button" onClick={handleAddToCart} className="w-full"><Plus className="h-4 w-4 mr-2"/>Add to List</Button>
          </div>
          
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border flex flex-col">
            <h3 className="font-semibold text-lg flex items-center gap-2"><PackagePlus className="h-5 w-5 text-primary"/> Stock Addition List</h3>
            <ScrollArea className="flex-1 h-48 border rounded-md bg-background">
                <div className="p-2 space-y-2">
                {cart.length > 0 ? cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-secondary/20 p-2 rounded-md border">
                        <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} | Cost: ৳{Number(item.costPrice).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold">৳{(item.quantity * item.costPrice).toFixed(2)}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)} className="h-6 w-6 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    </div>
                )) : <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50"><PackagePlus className="h-8 w-8 mb-2"/><p>List is empty</p></div>}
                </div>
            </ScrollArea>
             <div className="pt-4 border-t flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-bold text-primary font-mono">৳{totalCost.toFixed(2)}</span>
             </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
            <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <Label>Entry Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="flex-shrink-0 flex items-end gap-2 w-full sm:w-auto">
                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full" disabled={loading}>Cancel</Button>
                 <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Confirm & Add Stock' : 'Confirm & Add Stock'}</Button>
              </div>
            </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockDialog;