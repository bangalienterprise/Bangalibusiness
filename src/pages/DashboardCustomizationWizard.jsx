import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useToast } from "@/components/ui/use-toast";

const MODULES = [
  { id: 'sales', title: 'Sales Tracking', description: 'Monitor daily revenue, orders, and sales trends.' },
  { id: 'products', title: 'Product Inventory', description: 'Track stock levels, top products, and low stock alerts.' },
  { id: 'customers', title: 'Customer CRM', description: 'Manage customer profiles, purchase history, and interactions.' },
  { id: 'expenses', title: 'Expense Management', description: 'Track business spending, categories, and receipts.' },
  { id: 'team', title: 'Team Performance', description: 'View staff activity, sales targets, and productivity.' },
  { id: 'analytics', title: 'Advanced Analytics', description: 'Deep dive into growth metrics and forecasts.' }
];

const DashboardCustomizationWizard = () => {
  const [selectedModules, setSelectedModules] = useState(MODULES.map(m => m.id));
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { business } = useBusiness();
  const { toast } = useToast();

  const toggleModule = (id) => {
    setSelectedModules(prev => 
        prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
      setSaving(true);
      try {
        const { error } = await supabase
            .from('user_dashboard_preferences')
            .upsert({
                user_id: user.id,
                business_id: business.id,
                selected_modules: selectedModules,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, business_id' });

        if (error) throw error;
        
        toast({ title: "Setup Complete", description: "Your dashboard is ready!" });
        navigate('/dashboard');

      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Failed to save preferences." });
      } finally {
        setSaving(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 mb-4">
                    <LayoutDashboard className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Personalize Your Dashboard</h1>
                <p className="text-gray-400 max-w-lg mx-auto">Select the modules you want to see on your home screen. You can always change this later.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map((module) => (
                    <Card 
                        key={module.id} 
                        className={`border-2 cursor-pointer transition-all rounded-[2rem] ${selectedModules.includes(module.id) ? 'border-primary bg-primary/5' : 'border-gray-800 bg-gray-900/50 opacity-80 hover:opacity-100'}`}
                        onClick={() => toggleModule(module.id)}
                    >
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold text-white">{module.title}</CardTitle>
                            {selectedModules.includes(module.id) && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-gray-400">{module.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-14 px-8 rounded-full text-lg font-black tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                    {saving ? "Setting up..." : <>Launch Dashboard <ArrowRight className="ml-2" /></>}
                </Button>
            </div>
        </div>
    </div>
  );
};

export default DashboardCustomizationWizard;