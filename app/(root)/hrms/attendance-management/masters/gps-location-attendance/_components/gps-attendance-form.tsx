'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, RefreshCw, Save, X } from 'lucide-react';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

export type GPSForm = {
    employeeName: string;
    designation?: string;
    date: string;
    clientName: string;
    salesLead: string;
    remarks?: string;
    punchFlag: boolean;
    location: string;
};

interface GPSAttendanceFormProps {
    onSubmit: (data: GPSForm) => void;
    onCancel: () => void;
}

export function GPSAttendanceForm({ onSubmit, onCancel }: GPSAttendanceFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<GPSForm>({
        mode: 'onChange',
        defaultValues: { punchFlag: false }
    });

    const handleFormSubmit: SubmitHandler<GPSForm> = (data) => {
        onSubmit(data);
        reset({ punchFlag: false } as any);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                <div className='space-y-2 md:col-span-2'>
                    <label className='font-medium text-sm' htmlFor='employeeName'>
                        Employee Name <span className='text-red-500'>*</span>
                    </label>
                    <InputText
                        id='employeeName'
                        placeholder='Employee Name'
                        {...register('employeeName', { required: 'Required' })}
                        error={errors.employeeName?.message}
                    />
                </div>
                <div className='space-y-2'>
                    <label className='font-medium text-sm' htmlFor='designation'>
                        Designation
                    </label>
                    <InputText id='designation' placeholder='Designation' {...register('designation')} />
                </div>
                <div className='space-y-2'>
                    <label className='font-medium text-sm' htmlFor='date'>
                        Date <span className='text-red-500'>*</span>
                    </label>
                    <InputText id='date' type='date' {...register('date', { required: 'Required' })} error={errors.date?.message} />
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                <div className='space-y-2 md:col-span-2'>
                    <label className='font-medium text-sm' htmlFor='clientName'>
                        Client Name <span className='text-red-500'>*</span>
                    </label>
                    <Select onValueChange={(v) => setValue('clientName', v)}>
                        <SelectTrigger id='clientName'>
                            <SelectValue placeholder='Select or Search Client Name' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Client A'>Client A</SelectItem>
                            <SelectItem value='Client B'>Client B</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='space-y-2 md:col-span-2'>
                    <label className='font-medium text-sm' htmlFor='salesLead'>
                        Sales Lead
                    </label>
                    <Select onValueChange={(v) => setValue('salesLead', v)}>
                        <SelectTrigger id='salesLead'>
                            <SelectValue placeholder='Select or Search Sales Lead' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Lead 1'>Lead 1</SelectItem>
                            <SelectItem value='Lead 2'>Lead 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='space-y-2'>
                <span className='font-medium text-sm'>Location</span>
                <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 opacity-70' />
                    <InputText placeholder='Address or coordinates' className='flex-1' {...register('location')} />
                </div>
            </div>

            <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <label className='font-medium text-sm' htmlFor='remarks'>
                        Remarks
                    </label>
                    <InputText id='remarks' placeholder='Enter Remarks' {...register('remarks')} />
                </div>
                <div className='flex items-center gap-2 pt-6 text-sm md:pt-0'>
                    <Checkbox checked={watch('punchFlag')} onCheckedChange={(v) => setValue('punchFlag', Boolean(v))} />
                    <span>Punch Flag</span>
                </div>
            </div>

            <div className='flex justify-center gap-4 border-t pt-6'>
                <Button type='button' variant='outline' onClick={() => reset({ punchFlag: false } as any)}>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? (
                        <div className='flex items-center'>
                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> Saving...
                        </div>
                    ) : (
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' /> Save
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}

