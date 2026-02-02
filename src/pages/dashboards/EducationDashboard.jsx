import React from 'react';
import { Helmet } from 'react-helmet';
import { GraduationCap, Users, BookOpen, CalendarCheck } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const EducationDashboard = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Education Dashboard</title></Helmet>
            <h1 className="text-3xl font-bold text-white mb-6">Education Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Students" value="450" icon={Users} trend="+12 this month" color="blue" />
                <StatsCard title="Active Courses" value="18" icon={BookOpen} color="purple" />
                <StatsCard title="Fee Collection" value="85%" icon={GraduationCap} trend="5% pending" color="green" />
                <StatsCard title="Avg Attendance" value="92%" icon={CalendarCheck} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Student Attendance & Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead className="text-slate-400">Student Name</TableHead>
                                    <TableHead className="text-slate-400">Class</TableHead>
                                    <TableHead className="text-slate-400">Attendance</TableHead>
                                    <TableHead className="text-slate-400 text-right">Fee Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { name: "Rahim Ahmed", class: "Class 10", att: "95%", fee: "Paid" },
                                    { name: "Karim Uddin", class: "Class 9", att: "88%", fee: "Due" },
                                    { name: "Salma Begum", class: "Class 10", att: "92%", fee: "Paid" },
                                    { name: "Nusrat Jahan", class: "Class 8", att: "90%", fee: "Paid" },
                                ].map((student, i) => (
                                    <TableRow key={i} className="border-slate-800">
                                        <TableCell className="font-medium text-white">{student.name}</TableCell>
                                        <TableCell className="text-slate-400">{student.class}</TableCell>
                                        <TableCell className="text-green-400 font-bold">{student.att}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={student.fee === 'Paid' ? 'outline' : 'destructive'} className={student.fee === 'Paid' ? 'text-green-400 border-green-900' : ''}>
                                                {student.fee}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { time: "09:00 AM", subject: "Mathematics", class: "Class 10" },
                            { time: "10:30 AM", subject: "Physics", class: "Class 9" },
                            { time: "12:00 PM", subject: "English", class: "Class 8" },
                            { time: "02:00 PM", subject: "Chemistry", class: "Class 10" },
                        ].map((cls, i) => (
                            <div key={i} className="flex gap-4 items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                                <div className="text-xs font-bold text-slate-400 w-16 text-center bg-slate-900 p-1 rounded">{cls.time}</div>
                                <div>
                                    <p className="font-bold text-sm">{cls.subject}</p>
                                    <p className="text-xs text-slate-500">{cls.class}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EducationDashboard;