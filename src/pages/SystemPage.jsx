import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Server, Database, Activity, CheckCircle, AlertCircle, Clock, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const SystemPage = () => {
    const { toast } = useToast();
    const [systemStatus, setSystemStatus] = useState('checking');
    const [dbStatus, setDbStatus] = useState('checking');
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const checkSystem = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Check DB connection by a simple query
            const { error: dbError } = await supabase.from('roles').select('role_name', { count: 'exact', head: true });
            if (dbError) throw new Error(`Database check failed: ${dbError.message}`);
            setDbStatus('ok');

            // 2. Fetch API logs (deletion requests as proxy)
            const { data: logsData, error: logsError } = await supabase
                .from('deletion_requests')
                .select('requested_at, item_type, status, user_id')
                .order('requested_at', { ascending: false })
                .limit(20);
            
            if (logsError) throw new Error(`Could not fetch API logs: ${logsError.message}`);

            if (logsData && logsData.length > 0) {
                const userIds = [...new Set(logsData.map(log => log.user_id).filter(id => id))];
                if (userIds.length > 0) {
                    const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, username')
                        .in('id', userIds);

                    if (profilesError) throw new Error(`Could not fetch user profiles for logs: ${profilesError.message}`);

                    const profilesMap = new Map(profilesData.map(p => [p.id, p.username]));
                    const enrichedLogs = logsData.map(log => ({
                        ...log,
                        username: profilesMap.get(log.user_id) || 'Unknown User'
                    }));
                    setApiLogs(enrichedLogs);
                } else {
                    setApiLogs(logsData.map(log => ({...log, username: 'Unknown User'})));
                }
            } else {
                setApiLogs([]);
            }
            
            setSystemStatus('ok');

        } catch (error) {
            console.error("System check failed:", error);
            setSystemStatus('error');
            setDbStatus('error');
            toast({
                title: "System Check Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        checkSystem();
    }, [checkSystem]);

    const StatusIndicator = ({ status }) => {
        if (status === 'checking') {
            return <Badge variant="secondary"><Clock className="mr-2 h-3 w-3 animate-spin"/>Checking...</Badge>;
        }
        if (status === 'ok') {
            return <Badge className="bg-green-500/20 text-green-700"><CheckCircle className="mr-2 h-3 w-3"/>Operational</Badge>;
        }
        return <Badge variant="destructive"><AlertCircle className="mr-2 h-3 w-3"/>Error</Badge>;
    };
    
    return (
        <>
            <Helmet>
                <title>System Status - Bangali Enterprise</title>
                <meta name="description" content="Monitor system health and logs." />
            </Helmet>
            <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">System Status</h1>
                    <p className="text-muted-foreground">Monitor system health, services, and recent API activity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">Core Services</CardTitle>
                            <Server className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                           <div className="flex justify-between items-center">
                               <p className="font-medium">Frontend Application</p>
                               <StatusIndicator status={systemStatus} />
                           </div>
                           <div className="flex justify-between items-center">
                               <p className="font-medium">Supabase Database</p>
                               <StatusIndicator status={dbStatus} />
                           </div>
                           <div className="flex justify-between items-center">
                               <p className="font-medium">Supabase Auth</p>
                               <StatusIndicator status={dbStatus} />
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center"><Code className="mr-3 h-5 w-5"/>Configuration</CardTitle>
                        </CardHeader>
                         <CardContent className="text-sm space-y-2 pt-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Supabase URL:</span>
                                <span>{supabase.supabaseUrl.split('.')[0]}.supabase.co</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Region:</span>
                                <span>ap-southeast-1 (Singapore)</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Project Version:</span>
                                <span>2024.11.15</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center"><Activity className="mr-3 h-5 w-5"/>Recent API Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">Showing recent deletion requests as a proxy for API calls.</p>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <div className="space-y-4">
                                {loading ? <p className="text-muted-foreground">Loading logs...</p> 
                                : apiLogs.length > 0 ? apiLogs.map(log => (
                                    <div key={log.requested_at + log.user_id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                             <Badge variant={log.status === 'approved' ? 'default' : log.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize w-20 justify-center">{log.status}</Badge>
                                             <p><span className="font-semibold">{log.username}</span> requested to delete a <span className="font-mono">{log.item_type}</span> record.</p>
                                        </div>
                                        <p className="text-muted-foreground text-xs whitespace-nowrap">{formatDistanceToNow(new Date(log.requested_at), { addSuffix: true })}</p>
                                    </div>
                                )) : <p className="text-muted-foreground">No recent activity found.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
};

export default SystemPage;