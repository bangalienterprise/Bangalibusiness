import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, CheckCircle, ArrowUpCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const BillingSettings = ({ initialData }) => {
    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>You are currently on the <span className="text-white font-medium">{initialData?.plan} Plan</span></CardDescription>
                        </div>
                        <Badge className="bg-blue-600 hover:bg-blue-500">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-white">${initialData?.price}</span>
                        <span className="text-slate-400">/ month</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-6">Renews automatically on {new Date(initialData?.renewalDate).toLocaleDateString()}</p>
                    
                    <div className="flex gap-3">
                        <Button className="bg-white text-slate-900 hover:bg-slate-200">
                            <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade Plan
                        </Button>
                        <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                            Cancel Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your saved cards and payment details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {initialData?.paymentMethods?.map(method => (
                        <div key={method.id} className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950/30">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-14 bg-slate-800 rounded flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{method.type} ending in {method.last4}</p>
                                    <p className="text-xs text-slate-500">Expires {method.expiry}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950/20">Remove</Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500">
                        + Add New Payment Method
                    </Button>
                </CardContent>
            </Card>

            {/* Billing History */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400">Date</TableHead>
                                <TableHead className="text-slate-400">Description</TableHead>
                                <TableHead className="text-slate-400">Amount</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-right text-slate-400">Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData?.history?.map(item => (
                                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="text-slate-300">{new Date(item.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-white font-medium">{item.description}</TableCell>
                                    <TableCell className="text-slate-300">${item.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/20">
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Download className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default BillingSettings;