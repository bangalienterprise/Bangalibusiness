import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const EducationOwnerDashboard = () => {
    const { toast } = useToast();

    const handleFeatureClick = (feature) => {
        toast({
            title: "Coming Soon",
            description: `${feature} module is currently under development.`
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">245</div>
                        <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">12</div>
                        <p className="text-xs text-blue-400 mt-1">3 new this semester</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Attendance Rate</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">94%</div>
                        <p className="text-xs text-orange-400 mt-1">Today's average</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Avg. Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">B+</div>
                        <p className="text-xs text-green-400 mt-1">Improved by 5%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1,2,3,4,5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            S{i}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Student Name {i}</p>
                                            <p className="text-xs text-gray-400">Enrolled in: Advanced Physics</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                         <Button onClick={() => handleFeatureClick('Add Student')} className="w-full justify-start text-left h-12 rounded-xl" variant="outline">
                            <Users className="mr-2 h-4 w-4" /> Register New Student
                         </Button>
                         <Button onClick={() => handleFeatureClick('New Course')} className="w-full justify-start text-left h-12 rounded-xl" variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" /> Create Course
                         </Button>
                         <Button onClick={() => handleFeatureClick('Mark Attendance')} className="w-full justify-start text-left h-12 rounded-xl" variant="outline">
                            <Calendar className="mr-2 h-4 w-4" /> Mark Attendance
                         </Button>
                         <Button onClick={() => handleFeatureClick('Grade Report')} className="w-full justify-start text-left h-12 rounded-xl" variant="outline">
                            <GraduationCap className="mr-2 h-4 w-4" /> Generate Report
                         </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EducationOwnerDashboard;