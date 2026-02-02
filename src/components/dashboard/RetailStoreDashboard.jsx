import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, TrendingUp, AlertTriangle, Package, ArrowUpRight, Plus, FileText, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import PermissionGatedButton from '@/components/team/PermissionGatedButton';
import { PERMISSIONS } from '@/lib/rolePermissions';
import { usePermission } from '@/hooks/usePermission';

const RetailStoreDashboard = ({ stats }) => {
  const { hasPermission } = usePermission();

  // Mock data (simplified for brevity)
  const recentOrders = stats?.recentOrders || [];
  const lowStock = [
    { id: 'P01', name: 'Premium Cotton Saree', stock: 3 },
    { id: 'P05', name: 'Organic Mustard Oil', stock: 5 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hasPermission(PERMISSIONS.CAN_VIEW_REPORTS) ? (
            <Card className="border-l-4 border-l-blue-500 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{stats?.revenue?.toLocaleString() || '0'}</div>
                </CardContent>
            </Card>
        ) : (
             <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex items-center justify-center h-full text-muted-foreground gap-2 pt-6">
                    <Lock className="h-4 w-4" /> Reports Restricted
                </CardContent>
            </Card>
        )}
        
        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders || 0}</div>
          </CardContent>
        </Card>
        
        {hasPermission(PERMISSIONS.CAN_VIEW_CUSTOMER_DATA) ? (
            <Card className="border-l-4 border-l-purple-500 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
                    <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.customers || 0}</div>
                </CardContent>
            </Card>
        ) : (
            <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex items-center justify-center h-full text-muted-foreground gap-2 pt-6">
                    <Lock className="h-4 w-4" /> Data Hidden
                </CardContent>
            </Card>
        )}

        <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.products || 0}</div>
            </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      {hasPermission(PERMISSIONS.CAN_VIEW_REPORTS) && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-md">
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.monthlyData || []}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            
            <Card className="col-span-3 shadow-md">
                <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.categoryData || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </div>
      )}

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {/* Recent Orders - Visible to anyone with order view permission */}
         {hasPermission(PERMISSIONS.CAN_VIEW_ORDERS) && (
            <Card className="col-span-2 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link to="/orders"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentOrders.map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{order.customer}</p>
                                    <p className="text-xs text-muted-foreground">{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">৳{order.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
         )}

         {/* Quick Actions */}
         <div className="space-y-6">
             <Card className="shadow-md">
                 <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-2 gap-2">
                     <PermissionGatedButton permission={PERMISSIONS.CAN_MANAGE_STOCK} variant="outline" className="w-full justify-start h-auto py-3">
                         <Plus className="mr-2 h-4 w-4 text-blue-500"/> Add Product
                     </PermissionGatedButton>
                     <PermissionGatedButton permission={PERMISSIONS.CAN_SELL} variant="outline" className="w-full justify-start h-auto py-3">
                         <ShoppingCart className="mr-2 h-4 w-4 text-green-500"/> New Order
                     </PermissionGatedButton>
                     <PermissionGatedButton permission={PERMISSIONS.CAN_VIEW_REPORTS} variant="outline" className="w-full justify-start h-auto py-3">
                         <FileText className="mr-2 h-4 w-4 text-orange-500"/> Reports
                     </PermissionGatedButton>
                 </CardContent>
             </Card>
             
             {hasPermission(PERMISSIONS.CAN_MANAGE_STOCK) && (
                <Card className="shadow-md border-red-900/20 bg-red-900/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-red-400 flex items-center"><AlertTriangle className="mr-2 h-4 w-4"/> Low Stock Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lowStock.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-red-950/30 rounded border border-red-900/30">
                                    <span>{item.name}</span>
                                    <span className="font-bold text-red-400">{item.stock} left</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
             )}
         </div>
      </div>
    </div>
  );
};

export default RetailStoreDashboard;