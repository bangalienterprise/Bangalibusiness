import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, User, Briefcase, Store, Users } from 'lucide-react';

const DemoLoginPanel = () => {
    const { loginWithDemoCredentials } = useAuth();

    const roles = [
        { id: 'admin', label: 'Admin', icon: Shield, color: 'text-red-400', desc: 'System access' },
        { id: 'owner', label: 'Owner', icon: Briefcase, color: 'text-blue-400', desc: 'Full business control' },
        { id: 'manager', label: 'Manager', icon: Users, color: 'text-purple-400', desc: 'Team & Operations' },
        { id: 'seller', label: 'Seller', icon: Store, color: 'text-green-400', desc: 'Sales & Orders' },
    ];

    return (
        <Card className="w-full max-w-md mx-auto mt-8 border-dashed border-2 bg-slate-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Demo Mode Access</CardTitle>
                <CardDescription>Instant login for testing purposes</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                    <Button
                        key={role.id}
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-slate-800 border-slate-700"
                        onClick={() => loginWithDemoCredentials(role.id)}
                    >
                        <role.icon className={`h-5 w-5 ${role.color}`} />
                        <span className="font-semibold">{role.label}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{role.desc}</span>
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
};

export default DemoLoginPanel;