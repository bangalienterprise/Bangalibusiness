import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const DemoLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Redirect handled by AuthContext/Effect
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Demo Login Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ These accounts are for testing/demo purposes only.
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Owner</h3>
            <Button className="w-full" onClick={() => handleLogin('demo.owner@bangali-enterprise.test', 'DemoOwner@2026!')}>
              Login as Owner
            </Button>
            <p className="text-xs text-muted-foreground">Access to everything</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Manager</h3>
            <Button className="w-full" variant="secondary" onClick={() => handleLogin('demo.manager@bangali-enterprise.test', 'DemoManager@2026!')}>
              Login as Manager
            </Button>
            <p className="text-xs text-muted-foreground">Access to sales, inventory, team</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Seller</h3>
            <Button className="w-full" variant="outline" onClick={() => handleLogin('demo.seller@bangali-enterprise.test', 'DemoSeller@2026!')}>
              Login as Seller
            </Button>
            <p className="text-xs text-muted-foreground">Access to own sales only</p>
          </div>

          <div className="pt-4 border-t">
            <Button variant="link" className="w-full" onClick={() => navigate('/login')}>
              Back to Regular Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoLoginPage;