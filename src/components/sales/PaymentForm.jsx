import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Banknote, Wallet } from 'lucide-react';

const PaymentForm = ({ total = 0, onComplete, onCancel }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [change, setChange] = useState(0);

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    setChange(Math.max(0, paid - total));
  }, [amountPaid, total]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onComplete) {
      onComplete({
        amountPaid: parseFloat(amountPaid) || 0,
        paymentMethod,
        change,
        due: Math.max(0, total - (parseFloat(amountPaid) || 0))
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-400" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total-amount" className="text-slate-400">Total Amount</Label>
            <div className="text-3xl font-bold text-blue-400">৳{total.toFixed(2)}</div>
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method" className="bg-slate-950 border-slate-700">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">
                  <div className="flex items-center gap-2"><Banknote className="h-4 w-4" /> Cash</div>
                </SelectItem>
                <SelectItem value="Card">
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Card</div>
                </SelectItem>
                <SelectItem value="Mobile Banking">
                  <div className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Mobile Banking</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount-paid">Amount Paid</Label>
            <Input
              id="amount-paid"
              type="number"
              placeholder="0.00"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="bg-slate-950 border-slate-700 text-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-xs text-slate-500">Change Return</div>
              <div className="text-xl font-bold text-green-500">৳{change.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-xs text-slate-500">Due Amount</div>
              <div className="text-xl font-bold text-red-500">
                ৳{Math.max(0, total - (parseFloat(amountPaid) || 0)).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 border-slate-700" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500">
              Confirm Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;