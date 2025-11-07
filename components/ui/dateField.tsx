'use client';

import { Label } from '@/components/ui/label';
import { useEffect, useRef, useState } from 'react';
import { CalendarYear } from './calendar_year';
import { FormError } from './extension/field';

interface DateFieldProps {
    field: any;
    fieldState: any;
    label: string;
    placeholder?: string;
    fromDate?: Date;
}

export const DateField: React.FC<DateFieldProps> = ({ field, fieldState, label, placeholder, fromDate }) => {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(field.value ? new Date(field.value) : null);
    const ref = useRef<HTMLDivElement | null>(null);

    // ✅ Format date without timezone issue
    const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // ✅ Keep local state synced with field value
    useEffect(() => {
        if (field.value) {
            setSelectedDate(new Date(field.value));
        }
    }, [field.value]);

    // ✅ Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDayClick = (day: Date) => {
        if (fromDate && day < fromDate) return; // restrict earlier dates
        setSelectedDate(day);
        field.onChange(formatDateLocal(day));
        setOpen(false);
    };

    return (
        <div className='relative mt-4' ref={ref}>
            <Label>
                {label} <span className='text-red-500'>*</span>
            </Label>
            <input
                readOnly
                value={selectedDate ? formatDateLocal(selectedDate) : ''}
                placeholder={placeholder}
                onClick={() => setOpen(true)}
                className='w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-sm'
            />
            {open && (
                <div className='absolute z-50 mt-2 rounded-md bg-white shadow-lg'>
                    <CalendarYear selected={selectedDate ?? undefined} onDayClick={handleDayClick} fromDate={fromDate} />
                </div>
            )}
            {fieldState?.error && <FormError>{fieldState.error.message}</FormError>}
        </div>
    );
};
