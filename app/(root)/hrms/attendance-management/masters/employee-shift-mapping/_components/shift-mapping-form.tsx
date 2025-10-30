'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, Save, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { EmployeeShiftMapping } from './columns';

export type ShiftMappingFormData = Record<string, never>;

interface ShiftMappingFormProps {
    editingShiftMapping: EmployeeShiftMapping | null;
    onSubmit: (data: ShiftMappingFormData) => void;
    onCancel: () => void;
}

export function ShiftMappingForm({ editingShiftMapping, onSubmit, onCancel }: ShiftMappingFormProps) {
    const {
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<ShiftMappingFormData>({
        mode: 'onChange',
        defaultValues: (editingShiftMapping as any) || {}
    });

    const handleFormSubmit: SubmitHandler<ShiftMappingFormData> = async (data) => {
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
