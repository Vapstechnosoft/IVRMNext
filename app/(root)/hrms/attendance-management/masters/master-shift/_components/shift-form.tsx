'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { RefreshCw, Save, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { MasterShift } from './columns';

export type MasterShiftFormData = {
    shiftName: string;
    startTime: string;
    endTime: string;
    remarks?: string;
    specificDay: boolean;
};

interface ShiftFormProps {
    editingShift: MasterShift | null;
    onSubmit: (data: MasterShiftFormData) => void;
    onCancel: () => void;
}

export function ShiftForm({ editingShift, onSubmit, onCancel }: ShiftFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<MasterShiftFormData>({
        mode: 'onChange',
        defaultValues: editingShift
            ? {
                  shiftName: editingShift.shiftName,
                  startTime: editingShift.startTime,
                  endTime: editingShift.endTime,
                  remarks: editingShift.remarks,
                  specificDay: editingShift.specificDay
              }
            : { specificDay: false }
    });

    const startTime = watch('startTime');

    const handleFormSubmit: SubmitHandler<MasterShiftFormData> = async (data) => {
        // Validate that end time is after start time
        if (data.startTime && data.endTime) {
            const start = new Date(`2000-01-01T${data.startTime}:00`);
            const end = new Date(`2000-01-01T${data.endTime}:00`);

            if (end <= start) {
                toast.error('End time must be after start time');
                return;
            }
        }

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
                <label className='font-medium text-sm'>
                    Shift Name <span className='text-red-500'>*</span>
                </label>
                <InputText
                    placeholder='Enter Name'
                    {...register('shiftName', { required: 'Required' })}
                    error={errors.shiftName?.message}
                />
            </div>

            <div className='space-y-2'>
                <label className='font-medium text-sm'>Remarks</label>
                <InputText placeholder='Enter Remarks' {...register('remarks')} />
            </div>

            <div className='space-y-2'>
                <label className='font-medium text-sm'>
                    Shift Start Time <span className='text-red-500'>*</span>
                </label>
                <input
                    type='time'
                    {...register('startTime', {
                        required: 'Start time is required'
                    })}
                    className={`w-full rounded-md border px-3 py-2 ${errors.startTime ? 'border-red-500' : 'border-input'}`}
                />
                {errors.startTime && <div className='mt-1 text-red-500 text-sm'>{errors.startTime.message}</div>}
            </div>

            <div className='space-y-2'>
                <label className='font-medium text-sm'>
                    Shift End Time <span className='text-red-500'>*</span>
                </label>
                <input
                    type='time'
                    {...register('endTime', {
                        required: 'End time is required'
                    })}
                    min={startTime || undefined}
                    className={`w-full rounded-md border px-3 py-2 ${errors.endTime ? 'border-red-500' : 'border-input'}`}
                />
                {errors.endTime && <div className='mt-1 text-red-500 text-sm'>{errors.endTime.message}</div>}
            </div>

            <div className='flex items-center gap-8'>
                <label className='flex items-center gap-2 text-sm'>
                    <Checkbox checked={watch('specificDay')} onCheckedChange={(v) => setValue('specificDay', Boolean(v))} /> Specific Day
                </label>
            </div>

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
