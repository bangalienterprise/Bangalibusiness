import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const BusinessTypeConfigurator = () => {
    // Mock data for display
    const types = [
        { id: 'retail', name: 'Retail Store', active: true, modules: ['POS', 'Stock', 'Suppliers'] },
        { id: 'service', name: 'Service Provider', active: true, modules: ['Calendar', 'Staff', 'Services'] },
        { id: 'agency', name: 'Agency', active: true, modules: ['Projects', 'Tasks', 'Proposals'] },
        { id: 'freelancer', name: 'Freelancer', active: true, modules: ['Time', 'Invoices', 'Portfolio'] },
        { id: 'education', name: 'Education', active: true, modules: ['Students', 'Courses', 'Attendance'] },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registered Business Types</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Active Modules</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {types.map((type) => (
                            <TableRow key={type.id}>
                                <TableCell className="font-medium">{type.name}</TableCell>
                                <TableCell>
                                    <Badge variant={type.active ? "default" : "secondary"}>
                                        {type.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {type.modules.map(m => (
                                            <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default BusinessTypeConfigurator;