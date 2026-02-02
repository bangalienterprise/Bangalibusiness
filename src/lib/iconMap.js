import React from 'react';
import {
  Users,
  Car,
  Wrench,
  Building,
  Paperclip,
  Landmark,
  Wallet,
  Hammer,
  ShoppingBag,
  Gift,
  MoreHorizontal,
  CircleDollarSign,
  HelpCircle
} from 'lucide-react';

const iconMap = {
  'Staff Salary': Users,
  'Transportation': Car,
  'Vehicle Maintenance': Wrench,
  'Office Rent': Building,
  'Office Supplies': Paperclip,
  'Deposits': Landmark,
  'Labor Cost': Hammer,
  'Office Stuff Cost': ShoppingBag,
  'Gift Card': Gift,
  'Miscellaneous': MoreHorizontal,
  'Cash Deposit': Wallet,
  'Bank Deposit': Landmark,
  'Utilities': CircleDollarSign,
  'Marketing': CircleDollarSign,
  'Office Cost': Building,
  'Other': HelpCircle,
};

export const getCategoryIcon = (categoryName) => {
  const IconComponent = iconMap[categoryName] || HelpCircle;
  return <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />;
};