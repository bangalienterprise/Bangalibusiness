import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Papa from 'papaparse';
import { Search, Download, Trash2, Edit, Plus, Activity, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/contexts/BusinessContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ACTION_TYPE_STYLES = {
    INSERT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:red-green-300',
};

const ACTION_TYPE_ICONS = {
    INSERT: <Plus className="h-3 w-3" />,
    UPDATE: <Edit className="h-3 w-3" />,
    DELETE: <Trash2 className="h-3 w-3" />,
};

const ChangeDetail = ({ field, oldValue, newValue }) => (
    <div className="flex items-start text-xs">
        <strong className="w-24 capitalize">{field.replace(/_/g, ' ')}:</strong>
        <div className="flex items-center gap-2">
            <span className="text-red-500 line-through">{JSON.stringify(oldValue)}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-green-500">{JSON.stringify(newValue)}</span>
        </div>
    </div>
);


const ActivityDetailsModal = ({ activity, open, onOpenChange }) => {
    if (!activity) return null;

    const renderChanges = () => {
        if (activity.action !== 'UPDATE' || !activity.record_changes) return <p className="text-sm text-muted-foreground">No changes recorded.</p>;

        const oldData = activity.record_changes.old;
        const newData = activity.record_changes.new;

        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
        const changedFields = Array.from(allKeys).filter(key => oldData[key] !== newData[key]);
        
        if (changedFields.length === 0) return <p className="text-sm text-muted-foreground">No effective changes detected.</p>;

        return (
            <div className="space-y-2">
                {changedFields.map(key => (
                    <ChangeDetail key={key} field={key} oldValue={oldData[key]} newValue={newData[key]} />
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Activity Details</DialogTitle>
                    <DialogDescription>A detailed view of the recorded activity.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                    <p><strong>User:</strong> {activity.user?.username || 'System'}</p>
                    <p><strong>Action:</strong> <Badge className={ACTION_TYPE_STYLES[activity.action]}>{activity.action}</Badge></p>
                    <p><strong>Table:</strong> {activity.table_name}</p>
                    <p><strong>Timestamp:</strong> {format(new Date(activity.timestamp), 'PPP p')}</p>
                    
                    <h4 className="font-semibold pt-4">Changes</h4>
                    {renderChanges()}
                </div>
            </DialogContent>
        </Dialog>
    );
};


const UserActivityLogPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [userFilter, setUserFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { toast } = useToast();
    const { users, activeBusiness } = useBusiness();
    const ITEMS_PER_PAGE = 20;

    const fetchActivities = useCallback(async (isNewSearch = false) => {
        if (!activeBusiness) return;
        setLoading(true);

        const currentPage = isNewSearch ? 1 : page;
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
            .from('activity_log')
            .select('*, user:profiles(id, username, full_name)', { count: 'exact' })
            .eq('business_id', activeBusiness.id)
            .order('timestamp', { ascending: false })
            .range(from, to);

        if (searchTerm) {
            query = query.ilike('details', `%${searchTerm}%`);
        }
        if (dateRange.from) {
            query = query.gte('timestamp', dateRange.from.toISOString());
        }
        if (dateRange.to) {
            query = query.lte('timestamp', dateRange.to.toISOString());
        }
        if (userFilter !== 'all') {
            query = query.eq('user_id', userFilter);
        }
        if (actionFilter !== 'all') {
            query = query.eq('action', actionFilter);
        }

        const { data, error, count } = await query;
        
        if (error) {
            toast({ title: 'Error fetching activities', description: error.message, variant: 'destructive' });
        } else {
            if (isNewSearch) {
                setActivities(data || []);
            } else {
                setActivities(prev => [...prev, ...data]);
            }
            setHasMore(data.length === ITEMS_PER_PAGE && count > currentPage * ITEMS_PER_PAGE);
        }
        setLoading(false);
    }, [activeBusiness, toast, page, searchTerm, dateRange, userFilter, actionFilter]);

    useEffect(() => {
        fetchActivities(true); // isNewSearch = true
    }, [searchTerm, dateRange, userFilter, actionFilter]);
    
    useEffect(() => {
        if (page > 1) {
            fetchActivities(false); // isNewSearch = false
        }
    }, [page]);

    useEffect(() => {
        if (!activeBusiness) return;

        const channel = supabase.channel(`activity-log-business-${activeBusiness.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `business_id=eq.${activeBusiness.id}` }, 
            (payload) => {
                const fetchNewRecord = async () => {
                    const {data, error} = await supabase.from('activity_log').select('*, user:profiles(id, username, full_name)').eq('id', payload.new.id).single();
                    if(!error && data) {
                        setActivities(prev => [data, ...prev]);
                    }
                }
                fetchNewRecord();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeBusiness]);

    const handleDownload = () => {
        if (activities.length === 0) {
            toast({ title: 'No data to export' });
            return;
        }
        const csvData = activities.map(a => ({
            Timestamp: a.timestamp,
            User: a.user?.username || 'N/A',
            Action: a.action,
            Table: a.table_name,
            Details: a.details
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const stats = useMemo(() => {
        return activities.reduce((acc, activity) => {
            if (activity.action === 'INSERT') acc.inserts++;
            if (activity.action === 'UPDATE') acc.updates++;
            if (activity.action === 'DELETE') acc.deletes++;
            return acc;
        }, { inserts: 0, updates: 0, deletes: 0 });
    }, [activities]);

    const handleRowClick = (activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    return (
        <>
            <Helmet><title>User Activity Log - Bangali Enterprise</title></Helmet>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">User Activity Log</h1>
                        <p className="text-muted-foreground">Monitor all actions performed by users in the system.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Activities (Loaded)</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">{activities.length}</p></CardContent></Card>
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Creations</CardTitle><Plus className="h-4 w-4 text-green-500" /></CardHeader><CardContent><p className="text-2xl font-bold text-green-500">{stats.inserts}</p></CardContent></Card>
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Updates</CardTitle><Edit className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><p className="text-2xl font-bold text-blue-500">{stats.updates}</p></CardContent></Card>
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Deletions</CardTitle><Trash2 className="h-4 w-4 text-red-500" /></CardHeader><CardContent><p className="text-2xl font-bold text-red-500">{stats.deletes}</p></CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters & Search</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            <Input placeholder="Search details..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            <Select value={userFilter} onValueChange={setUserFilter}><SelectTrigger><SelectValue placeholder="All Users" /></SelectTrigger><SelectContent><SelectItem value="all">All Users</SelectItem>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.username}</SelectItem>)}</SelectContent></Select>
                            <Select value={actionFilter} onValueChange={setActionFilter}><SelectTrigger><SelectValue placeholder="All Actions" /></SelectTrigger><SelectContent><SelectItem value="all">All Actions</SelectItem><SelectItem value="INSERT">INSERT</SelectItem><SelectItem value="UPDATE">UPDATE</SelectItem><SelectItem value="DELETE">DELETE</SelectItem></SelectContent></Select>
                            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end mb-4">
                            <Button onClick={handleDownload} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!loading && activities.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="h-24 text-center">No activities found.</TableCell></TableRow>
                                    ) : (
                                        activities.map(activity => (
                                            <TableRow key={activity.id} onClick={() => handleRowClick(activity)} className="cursor-pointer">
                                                <TableCell className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{activity.user?.username || 'System'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`flex items-center gap-1 ${ACTION_TYPE_STYLES[activity.action]}`}>
                                                        {ACTION_TYPE_ICONS[activity.action]}
                                                        {activity.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{activity.table_name}</TableCell>
                                                <TableCell className="max-w-xs truncate text-muted-foreground">{activity.details}</TableCell>
                                                <TableCell>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                    {loading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                        {hasMore && !loading && (
                            <div className="text-center mt-4">
                                <Button onClick={() => setPage(p => p + 1)}>Load More</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <ActivityDetailsModal activity={selectedActivity} open={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
    );
};

export default UserActivityLogPage;