import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Plus, Trash2, PackagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const DamageDialog = ({ open, onOpenChange, damage, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [categories] = useState(['Beverage', 'Snacks', 'Candy']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [list, setList] = useState([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [currentReason, setCurrentReason] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { toast } = useToast();
  const { profile } = useAuth();
  const { addNotification } = useNotifications();
  const isEditing = !!damage;

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(storedProducts);

    if (isEditing && damage) {
      setList([{ productId: damage.productId, quantity: damage.quantity, reason: damage.reason }]);
      setDate(damage.date);
    } else {
      setList([]);
      setDate(new Date().toISOString().split('T')[0]);
    }
    setCurrentProduct('');
    setCurrentQuantity('');
    setCurrentReason('');
    setSelectedCategory('All');
  }, [damage, open, isEditing]);

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  const handleAddToList = () => {
    if(!currentProduct || !currentQuantity || !currentReason) {
      toast({ title: "Missing details", description: "Please select product, quantity, and reason.", variant: "destructive" });
      return;
    }
    setList([...list, { productId: currentProduct, quantity: parseInt(currentQuantity), reason: currentReason }]);
    setCurrentProduct('');
    setCurrentQuantity('');
    setCurrentReason('');
    toast({ title: "Product added to damage list" });
  }

  const handleRemoveFromList = (productId) => {
    setList(list.filter(item => item.productId !== productId));
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if(list.length === 0) {
      toast({ title: "Empty list", variant: "destructive" });
      return;
    }

    let damages = JSON.parse(localStorage.getItem('damages') || '[]');
    let allProducts = JSON.parse(localStorage.getItem('products') || '[]');

    if (isEditing) {
      const item = list[0];
      const product = products.find(p => p.id === item.productId);
      const damageIndex = damages.findIndex(d => d.id === damage.id);
      const oldDamage = damages[damageIndex];
      const oldQuantity = oldDamage.quantity;

      damages[damageIndex] = { ...oldDamage, productId: product.id, productName: product.name, quantity: item.quantity, reason: item.reason, lossAmount: item.quantity * parseFloat(product.costPrice), date: date };
      
      const productIndex = allProducts.findIndex(p => p.id === oldDamage.productId);
      if(productIndex > -1) {
          allProducts[productIndex].stock += oldQuantity;
          const newProdIndex = allProducts.findIndex(p => p.id === product.id);
          if (newProdIndex > -1) allProducts[newProdIndex].stock -= item.quantity;
      }
      toast({ title: 'Damage record updated' });
      addNotification({ title: 'Damage Record Edited', message: `A damage record for ${product.name} was edited.` });
    } else {
      list.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const newQuantity = item.quantity;
        const newDamage = { id: `${Date.now()}-${product.id}`, productId: product.id, productName: product.name, quantity: newQuantity, reason: item.reason, lossAmount: newQuantity * parseFloat(product.costPrice), date: date, status: 'Damaged' };
        damages.push(newDamage);

        const productIndex = allProducts.findIndex(p => p.id === product.id);
        allProducts[productIndex].stock = Math.max(0, parseInt(allProducts[productIndex].stock) - newQuantity);
      });
      toast({ title: 'Damage recorded' });
      addNotification({ title: 'New Damage Recorded', message: `${list.length} item(s) reported as damaged.` });
    }
    
    localStorage.setItem('damages', JSON.stringify(damages));
    localStorage.setItem('products', JSON.stringify(allProducts));
    
    onSuccess();
    onOpenChange(false);
  };

  const totalLoss = list.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    return total + (product ? (item.quantity || 0) * product.costPrice : 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphic max-w-3xl">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Damage Record' : 'Record Damaged Products'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Side: Product Selection */}
          <div className="space-y-4">
              <h3 className="font-semibold text-lg">Select Products</h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['All', ...categories].map(cat => ( <Button key={cat} type="button" variant="ghost" onClick={() => setSelectedCategory(cat)} className={cn('px-3 py-1 h-auto rounded-full text-sm', selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary')}>{cat}</Button>))}
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={currentProduct} onValueChange={setCurrentProduct}><SelectTrigger className="bg-background/50"><SelectValue placeholder="Choose a product" /></SelectTrigger><SelectContent>{filteredProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="Damaged quantity" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input placeholder="e.g., Expired, Broken" value={currentReason} onChange={(e) => setCurrentReason(e.target.value)} className="bg-background/50" />
              </div>
              <Button type="button" onClick={handleAddToList} className="w-full bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2"/>Add to Damage List</Button>
          </div>

          {/* Right Side: List */}
          <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border">
             <h3 className="font-semibold text-lg flex items-center gap-2"><PackagePlus className="h-5 w-5 text-destructive"/> Damage List</h3>
             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {list.length > 0 ? list.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between items-center bg-secondary/50 p-2 rounded-md">
                      <div>
                        <p className="font-medium">{product?.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} | {item.reason}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFromList(item.productId)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  );
                }) : (
                  <p className="text-muted-foreground text-center py-8">List is empty</p>
                )}
             </div>
             <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Loss:</span>
                  <span className="font-bold text-destructive">৳{totalLoss.toFixed(2)}</span>
                </div>
             </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
            <div className="w-full flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label>Date of Damage</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background/50" required />
              </div>
              <div className="flex-1 flex items-end gap-2">
                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full">Cancel</Button>
                 <Button type="button" onClick={handleSubmit} className="w-full bg-destructive hover:bg-destructive/90">{isEditing ? 'Update Record' : 'Confirm Damage'}</Button>
              </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DamageDialog;