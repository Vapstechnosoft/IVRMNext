'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

export interface Form6AFilters {
    fromDate: Date | undefined;
    toDate: Date | undefined;
}

interface PFForm6AFiltersProps {
    filters: Form6AFilters;
    onDateChange: (key: 'fromDate' | 'toDate', date: Date | undefined) => void;
    onGenerate: () => void;
    onCancel: () => void;
}

export function PFForm6AFilters({ filters, onDateChange, onGenerate, onCancel }: PFForm6AFiltersProps) {
    return (
        <CollapsibleSection
            title='PF FORM 6A'
            description='Generate annual return of PF contributions for the specified period'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Date Range Selection */}
            <div className='flex items-center justify-center gap-6'>
                {/* From Date */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>From :</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className={cn(
                                    'w-[200px] justify-start text-left font-normal',
                                    !filters.fromDate && 'text-muted-foreground'
                                )}>
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : '17-09-2025'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                            <CalendarYear
                                mode='single'
                                selected={filters.fromDate}
                                onDayClick={(day) => onDateChange('fromDate', day)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* To Date */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>To :</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className={cn('w-[200px] justify-start text-left font-normal', !filters.toDate && 'text-muted-foreground')}>
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : '17-09-2025'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                            <CalendarYear
                                mode='single'
                                selected={filters.toDate}
                                onDayClick={(day) => onDateChange('toDate', day)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button onClick={onGenerate} className='bg-blue-600 hover:bg-blue-700'>
                    GENERATE
                </Button>
                <Button variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </CollapsibleSection>
    );
}
