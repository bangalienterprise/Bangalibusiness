
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Mail, Calendar, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const StudentListPage = () => {
    const { business } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (business?.id) fetchStudents();
    }, [business]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('business_id', business.id);
            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Students - Education</title></Helmet>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Student Directory</h1>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-emerald-500" /></div>
                ) : students.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-500 bg-slate-900 border border-slate-800 rounded-lg">No students registered yet.</div>
                ) : (
                    students.map(student => (
                        <Card key={student.id} className="bg-slate-900 border-slate-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{student.full_name}</h3>
                                        <p className="text-xs text-slate-500">{student.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="text-emerald-400">{student.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Joined:</span>
                                        <span>{format(new Date(student.enrollment_date), 'MMM yyyy')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentListPage;
