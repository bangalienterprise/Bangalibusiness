import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DamageSummary = () => {
    return (
        <Card>
            <CardHeader><CardTitle>Damage Summary</CardTitle></CardHeader>
            <CardContent>
                <p>Mock Data: No damages recorded.</p>
            </CardContent>
        </Card>
    );
};
export default DamageSummary;