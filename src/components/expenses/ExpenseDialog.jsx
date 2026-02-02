import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

const expenseSchema = z.object({
  category_id: z.string({ required_error: "Please select a category." }).uuid({ message: "Invalid category." }),
  amount: z.preprocess(
    (a) => parseFloat(String(a).replace(/,/g, '')),
    z.number().positive({ message: "Amount must be a positive number." })
  ),
  description: z.string().optional(),
  expense_date: z.date({ required_error: "Please select a date." }),
  expense_type: z.enum(['business', 'personal', 'owner']),
  seller_id: z.string().uuid().optional().nullable(),
});

const ExpenseDialog = ({ open, setOpen, expense, categories, onSuccess, defaultType }) => {
  const { toast } = useToast();
  const { user: profile } = useAuth();
  const { activeBusiness, users } = useBusiness();
  const isEditing = !!expense;

  const { register, handleSubmit, control, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_type: defaultType || 'business',
      expense_date: new Date(),
    }
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          category_id: expense.category_id,
          amount: expense.amount,
          description: expense.description || '',
          expense_date: new Date(expense.expense_date),
          expense_type: expense.expense_type,
          seller_id: expense.seller_id || null,
        });
      } else {
        reset({
          category_id: undefined,
          amount: '',
          description: '',
          expense_date: new Date(),
          expense_type: defaultType || 'business',
          seller_id: null,
        });
      }
    }
  }, [expense, open, reset, defaultType]);

  const onSubmit = async (formData) => {
    if (!profile || !activeBusiness) {
      toast({ title: 'Authentication error', variant: 'destructive' });
      return;
    }

    const expenseData = {
      ...formData,
      expense_date: format(formData.expense_date, 'yyyy-MM-dd'),
      business_id: activeBusiness.id,
      recorded_by: profile.id,
    };

    try {
      if (isEditing) {
        await db.database.update('/expenses', expense.id, expenseData);
      } else {
        await db.database.create('/expenses', expenseData);
      }

      toast({ title: `Expense ${isEditing ? 'updated' : 'added'} successfully` });
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast({ title: isEditing ? 'Update failed' : 'Creation failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glassmorphic">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {/* Category Combobox */}
           <div className="space-y-1">
            <Label>Category</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value ? categories.find(cat => cat.id === field.value)?.name : "Select a category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat.id}
                            value={cat.name}
                            onSelect={() => {
                              setValue('category_id', cat.id, { shouldValidate: true });
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === cat.id ? "opacity-100" : "opacity-0")} />
                            {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
             {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...register('amount')} className="bg-background/50" />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Controller
                name="expense_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                  </Popover>
                )}
              />
              {errors.expense_date && <p className="text-xs text-destructive">{errors.expense_date.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Seller / Supplier (Optional)</Label>
            <Controller
              name="seller_id"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value ? (users || []).find(user => user.id === field.value)?.username : "Select a seller..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => field.onChange(null)}>
                          <Check className={cn("mr-2 h-4 w-4", !field.value ? "opacity-100" : "opacity-0")} />
                          None
                        </CommandItem>
                        {(users || []).map((user) => (
                          <CommandItem key={user.id} value={`${user.username} ${user.full_name}`} onSelect={() => field.onChange(user.id)}>
                            <Check className={cn("mr-2 h-4 w-4", field.value === user.id ? "opacity-100" : "opacity-0")} />
                            {user.username} ({user.full_name})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Description (Optional)</Label>
            <Input {...register('description')} className="bg-background/50" />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Expense' : 'Add Expense')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;