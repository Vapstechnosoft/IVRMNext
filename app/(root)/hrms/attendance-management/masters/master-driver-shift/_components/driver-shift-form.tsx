'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Save, X } from 'lucide-react';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

export type DriverShiftForm = {
    shift: string;
    driver: string;
    fromDate: string;
    toDate: string;
    remarks?: string;
    saturdayOff: boolean;
    sundayWorking: boolean;
};

interface DriverShiftFormProps {
    editingShift: DriverShiftForm | null;
    onSubmit: (data: DriverShiftForm) => void;
    onCancel: () => void;
}

export function DriverShiftForm({ editingShift, onSubmit, onCancel }: DriverShiftFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<DriverShiftForm>({
        mode: 'onChange',
        defaultValues: { saturdayOff: false, sundayWorking: false }
    });

    // Update form when editingShift changes
    React.useEffect(() => {
        if (editingShift) {
            reset(editingShift);
        } else {
            reset({ saturdayOff: false, sundayWorking: false } as any);
        }
    }, [editingShift, reset]);

    const handleFormSubmit: SubmitHandler<DriverShiftForm> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='shift'>
                    Shift <span className='text-red-500'>*</span>
                </label>
                <Select onValueChange={(v) => setValue('shift', v)}>
                    <SelectTrigger id='shift'>
                        <SelectValue placeholder='Select Shift' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Morning Shift'>Morning Shift</SelectItem>
                        <SelectItem value='Afternoon Shift'>Afternoon Shift</SelectItem>
                        <SelectItem value='Evening Shift'>Evening Shift</SelectItem>
                        <SelectItem value='Night Shift'>Night Shift</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='driver'>
                    Driver <span className='text-red-500'>*</span>
                </label>
                <Select onValueChange={(v) => setValue('driver', v)}>
                    <SelectTrigger id='driver'>
                        <SelectValue placeholder='Select Driver' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Arun A'>Arun A</SelectItem>
                        <SelectItem value='Arun R'>Arun R</SelectItem>
                        <SelectItem value='Ashok R'>Ashok R</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='fromDate'>
                    From Date <span className='text-red-500'>*</span>
                </label>
                <InputText
                    id='fromDate'
                    type='date'
                    {...register('fromDate', { required: 'Required' })}
                    error={errors.fromDate?.message}
                />
            </div>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='toDate'>
                    To Date <span className='text-red-500'>*</span>
                </label>
                <InputText id='toDate' type='date' {...register('toDate', { required: 'Required' })} error={errors.toDate?.message} />
            </div>
            <div className='space-y-2 md:col-span-2'>
                <label className='font-medium text-sm' htmlFor='remarks'>
                    Remarks
                </label>
                <InputText id='remarks' placeholder='Enter Remarks' {...register('remarks')} />
            </div>
            <div className='flex items-center gap-8'>
                <div className='flex items-center gap-2 text-sm'>
                    <Checkbox checked={watch('saturdayOff')} onCheckedChange={(v) => setValue('saturdayOff', Boolean(v))} />
                    <span>Saturday Off Flag</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                    <Checkbox checked={watch('sundayWorking')} onCheckedChange={(v) => setValue('sundayWorking', Boolean(v))} />
                    <span>Sunday Working Flag</span>
                </div>
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
