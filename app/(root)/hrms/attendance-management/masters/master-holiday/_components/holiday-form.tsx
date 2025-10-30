'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, Save, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { MasterHoliday } from './columns';

export type HolidayFormData = Record<string, never>;

interface HolidayFormProps {
    editingHoliday: MasterHoliday | null;
    onSubmit: (data: HolidayFormData) => void;
    onCancel: () => void;
}

export function HolidayForm({ editingHoliday, onSubmit, onCancel }: HolidayFormProps) {
    const {
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<HolidayFormData>({
        mode: 'onChange',
        defaultValues: (editingHoliday as any) || {}
    });

    const handleFormSubmit: SubmitHandler<HolidayFormData> = async (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* TODO: Add form fields */}

            <div className='flex justify-center gap-4 border-t pt-6 md:col-span-2'>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? (
                        <div className='flex items-center'>
                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </div>
                    ) : (
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}
