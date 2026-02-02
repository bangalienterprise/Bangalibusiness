import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";

const BookingCalendarPage = () => {
    const [date, setDate] = React.useState(new Date());

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Booking Calendar - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Booking Calendar</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> New Booking</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" /> Schedule for {date?.toDateString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="h-96 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                            No bookings scheduled for this day.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BookingCalendarPage;