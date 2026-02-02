import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TeamManagementPage from '@/pages/TeamManagement';

const TeamSettings = () => {
    // Reusing the existing powerful TeamManagementPage component
    // Wrapping it to fit the settings context structure if needed
    return (
        <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage access and permissions for your team.</CardDescription>
                </CardHeader>
                <CardContent>
                   <TeamManagementPage /> 
                </CardContent>
            </Card>
        </div>
    );
};

export default TeamSettings;