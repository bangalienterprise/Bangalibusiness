import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const AttendancePage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Attendance - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                <Button variant="outline">Mark Today</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" /> Attendance Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        Select a class to view attendance.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendancePage;