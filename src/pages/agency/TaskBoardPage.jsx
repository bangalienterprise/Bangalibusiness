import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';

const TaskBoardPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Tasks - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" /> My Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        You have no pending tasks.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TaskBoardPage;