'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ICalendarEvent } from '@/types/alumni/alumni-dashboard';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarSectionProps {
    events: ICalendarEvent[];
}

export default function CalendarSection({ events }: CalendarSectionProps) {
    return (
        <Card className='h-full'>
            <CardHeader className='border-b bg-muted/20'>
                <CardTitle className='flex items-center text-lg'>
                    <CalendarIcon className='mr-2 h-5 w-5 text-primary' />
                    Upcoming Events
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                {events.length === 0 ? (
                    <div className='flex h-48 flex-col items-center justify-center text-muted-foreground'>
                        <CalendarIcon className='mb-2 h-12 w-12 opacity-20' />
                        <p>No events found</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {events.map((event, idx) => (
                            <div key={idx} className='group relative pl-8 before:absolute before:left-0 before:top-1 before:h-4 before:w-4 before:rounded-full before:bg-primary/20 before:transition-colors hover:before:bg-primary'>
                                <div className='flex flex-col space-y-1'>
                                    <span className='text-xs font-semibold text-primary uppercase tracking-wider'>
                                        {format(new Date(event.coeE_EStartDate), 'MMMM')}
                                    </span>
                                    <h4 className='font-bold text-base group-hover:text-primary transition-colors'>
                                        {event.coemE_EventName}
                                    </h4>
                                    <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                                        <div className='flex items-center'>
                                            <CalendarIcon className='mr-1 h-3 w-3' />
                                            {format(new Date(event.coeE_EStartDate), 'dd MMM yyyy')}
                                            {event.coeE_EEndDate && event.coeE_EEndDate !== event.coeE_EStartDate && (
                                                <> - {format(new Date(event.coeE_EEndDate), 'dd MMM yyyy')}</>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
