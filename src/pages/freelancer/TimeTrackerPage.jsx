import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Square, Clock } from 'lucide-react';

const TimeTrackerPage = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const loadEntries = async () => {
            if (user?.business_id) {
                const { data } = await timeTrackingService.getTimeEntries(user.business_id, user.id);
                setEntries(data || []);
            }
        };
        loadEntries();
    }, [user]);

    useEffect(() => {
        let interval;
        if (isTracking) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTracking, startTime]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const toggleTimer = async () => {
        if (isTracking) {
            // Stop
            await timeTrackingService.createTimeEntry(user.business_id, {
                user_id: user.id,
                description: description || 'No Description',
                start_time: new Date(startTime).toISOString(),
                end_time: new Date().toISOString(),
                is_running: false
            });
            const { data } = await timeTrackingService.getTimeEntries(user.business_id, user.id);
            setEntries(data || []);
            setIsTracking(false);
            setElapsed(0);
            setDescription("");
        } else {
            // Start
            setStartTime(Date.now());
            setIsTracking(true);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Time Tracker</h1>

            <Card className="bg-muted/50">
                <CardContent className="p-6 flex items-center gap-4">
                    <Input
                        placeholder="What are you working on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-1"
                        disabled={isTracking}
                    />
                    <div className="font-mono text-2xl font-bold w-32 text-center">
                        {formatTime(elapsed)}
                    </div>
                    <Button
                        size="icon"
                        className={`rounded-full h-12 w-12 ${isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={toggleTimer}
                    >
                        {isTracking ? <Square className="fill-white" /> : <Play className="fill-white ml-1" />}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Recent Logs</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{entry.description}</TableCell>
                                    <TableCell className="font-mono">{entry.duration}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimeTrackerPage;