'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormError, Label } from './extension/field';

interface DateFieldProps {
    field: any;
    fieldState: any;
    label: string;
    placeholder?: string;
    fromDate?: Date;
    toDate?: Date;
}

export const DateField: React.FC<DateFieldProps> = ({ field, fieldState, label, placeholder = 'Pick a date', fromDate, toDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(field.value ? new Date(field.value) : null);

    useEffect(() => {
        if (field.value) {
            setSelectedDate(new Date(field.value));
        }
    }, [field.value]);

    const handleSelect = (date: Date | undefined) => {
        if (!date) return;
        if (fromDate && date < fromDate) return; // ✅ Prevent selecting dates before `fromDate`
        setSelectedDate(date);
        field.onChange(date.toISOString());
        setIsOpen(false);
    };

    return (
        <div className='mt-5 flex flex-col gap-1.5'>
            <Label htmlFor={field.name}>
                {label}
                <span className='ml-1 text-red-500'>*</span>
            </Label>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant='outline'
                        className={cn('w-full justify-between font-normal', !selectedDate && 'text-muted-foreground')}>
                        {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : <span>{placeholder}</span>}
                        <Calendar className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className='flex w-auto items-start p-0' align='start'>
                    <CalendarYear
                        mode='single'
                        captionLayout='buttons'
                        selected={selectedDate ?? undefined}
                        onSelect={handleSelect}
                        onDayClick={() => setIsOpen(false)}
                        fromDate={fromDate}
                    />
                </PopoverContent>
            </Popover>

            {fieldState?.error && <FormError>{fieldState.error.message}</FormError>}
        </div>
    );
};
