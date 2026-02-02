import React from 'react';
import { Helmet } from 'react-helmet';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/lib/rolePermissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Users, FileText, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
    const { hasPermission, userRole } = usePermission();

    const sections = [
        {
            title: 'Sales & Orders',
            icon: ShoppingCart,
            permission: PERMISSIONS.CAN_SELL,
            link: '/sales',
            description: 'Process new sales and manage orders.'
        },
        {
            title: 'Inventory',
            icon: Package,
            permission: PERMISSIONS.CAN_MANAGE_STOCK,
            link: '/stock',
            description: 'Update stock levels and manage suppliers.'
        },
        {
            title: 'Team Management',
            icon: Users,
            permission: PERMISSIONS.CAN_MANAGE_TEAM,
            link: '/team',
            description: 'Invite and manage other staff members.'
        },
        {
            title: 'Reports',
            icon: FileText,
            permission: PERMISSIONS.CAN_VIEW_REPORTS,
            link: '/reports',
            description: 'View financial performance and analytics.'
        }
    ];

    return (
        <div className="space-y-6">
            <Helmet><title>Manager Dashboard</title></Helmet>
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Access your permitted tools below.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary border border-primary/20">
                    <ShieldAlert className="h-3 w-3" /> Role: {userRole?.toUpperCase() || 'MANAGER'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sections.map(section => {
                    const allowed = hasPermission(section.permission);
                    return (
                        <Card key={section.title} className={allowed ? 'hover:shadow-lg transition-all' : 'opacity-70 bg-muted/50 border-dashed'}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
                                {allowed ? <section.icon className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mt-2 min-h-[40px]">{section.description}</p>
                                {allowed ? (
                                    <Link to={section.link}>
                                        <Button className="w-full mt-4" size="sm">
                                            Open {section.title} <ArrowRight className="ml-2 h-3 w-3" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled variant="outline" className="w-full mt-4" size="sm">
                                        Access Restricted
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {!hasPermission(PERMISSIONS.CAN_VIEW_REPORTS) && (
                <Card className="bg-orange-500/5 border-orange-500/20">
                    <CardContent className="flex items-center gap-4 p-4">
                        <Lock className="h-5 w-5 text-orange-500" />
                        <div>
                            <h4 className="font-semibold text-orange-700 dark:text-orange-400">Limited Access</h4>
                            <p className="text-sm text-muted-foreground">You have limited permissions on this account. Contact the business owner to request access to restricted features.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ManagerDashboard;