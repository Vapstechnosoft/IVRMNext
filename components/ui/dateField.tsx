'use client';

import { Label } from '@/components/ui/label';
import { useEffect, useRef, useState } from 'react';
import { CalendarYear } from './calendar_year';
import { FormError } from './extension/field';
// adjust import path as per your project

interface DateFieldProps {
    field: any;
    fieldState: any;
    label: string;
    placeholder?: string;
}

export const DateField: React.FC<DateFieldProps> = ({ field, fieldState, label, placeholder }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className='relative mt-4' ref={ref}>
            <Label>
                {label} <span className='text-red-500'>*</span>
            </Label>
            <input
                readOnly
                value={field.value ?? ''}
                placeholder={placeholder}
                onClick={() => setOpen(true)}
                className='w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-sm'
            />
            {open && (
                <div className='absolute z-50 mt-2'>
                    <div className='rounded-md bg-white shadow-lg'>
                        <CalendarYear
                            selected={field.value ? new Date(field.value) : undefined}
                            onDayClick={(day: Date) => {
                                field.onChange(day.toISOString().split('T')[0]);
                                setOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
            {fieldState?.error && <FormError>{fieldState.error.message}</FormError>}
        </div>
    );
};
