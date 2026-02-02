
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle2, XCircle, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentsPage = () => {
    const { business } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (business?.id) fetchAppointments();
    }, [business]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*, customer:contacts(name, phone), service:items(name)')
                .eq('business_id', business.id)
                .order('appointment_date', { ascending: true });
            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Appointments - Service</title></Helmet>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Appointments</h1>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Plus className="mr-2 h-4 w-4" /> Schedule</Button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="border-slate-800">
                            <TableHead className="text-slate-400">Date & Time</TableHead>
                            <TableHead className="text-slate-400">Customer</TableHead>
                            <TableHead className="text-slate-400">Service</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto text-indigo-500" /></TableCell></TableRow>
                        ) : appointments.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500">No appointments scheduled.</TableCell></TableRow>
                        ) : (
                            appointments.map(appt => (
                                <TableRow key={appt.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="text-white font-medium">
                                        {format(new Date(appt.appointment_date), 'MMM dd, h:mm a')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-slate-200">{appt.customer?.name}</div>
                                        <div className="text-xs text-slate-500">{appt.customer?.phone}</div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">{appt.service?.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {appt.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AppointmentsPage;
