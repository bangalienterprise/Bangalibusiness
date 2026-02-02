
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Calendar, Loader2 } from 'lucide-react';

const ProjectBoardPage = () => {
    const { business } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (business?.id) fetchProjects();
    }, [business]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*, client:contacts(name)')
                .eq('business_id', business.id);
            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Projects - Agency</title></Helmet>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Project Board</h1>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white"><Plus className="mr-2 h-4 w-4" /> New Project</Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-orange-500" /></div>
                ) : projects.length === 0 ? (
                    <Card className="bg-slate-900 border-slate-800 p-10 text-center text-slate-500">No active projects found.</Card>
                ) : (
                    projects.map(project => (
                        <Card key={project.id} className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-colors">
                            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                    <p className="text-slate-400 text-sm">Client: {project.client?.name || 'Private'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-orange-500 font-bold">৳{project.budget?.toLocaleString()}</div>
                                        <div className="text-xs text-slate-500">Budget</div>
                                    </div>
                                    <Badge className={project.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                                        {project.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectBoardPage;
