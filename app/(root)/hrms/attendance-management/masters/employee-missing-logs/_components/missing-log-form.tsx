'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Save, Upload, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { MissingLog } from './columns';

export type MissingLogFormData = {
    employeeName: string;
    date: string;
    time: string;
    inOut: 'IN' | 'OUT';
    file?: string;
    remarks?: string;
};

interface MissingLogFormProps {
    editingMissingLog: MissingLog | null;
    onSubmit: (data: MissingLogFormData) => void;
    onCancel: () => void;
}

export function MissingLogForm({ editingMissingLog, onSubmit, onCancel }: MissingLogFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<MissingLogFormData>({
        mode: 'onChange',
        defaultValues: editingMissingLog
            ? {
                  employeeName: editingMissingLog.employeeName,
                  date: editingMissingLog.date,
                  time: editingMissingLog.time,
                  inOut: editingMissingLog.inOut,
                  file: editingMissingLog.file,
                  remarks: editingMissingLog.remarks
              }
            : {}
    });

    const handleFormSubmit: SubmitHandler<MissingLogFormData> = async (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
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
                <label className='font-medium text-sm' htmlFor='date'>
                    Date <span className='text-red-500'>*</span>
                </label>
                <InputText id='date' type='date' {...register('date', { required: 'Required' })} error={errors.date?.message} />
            </div>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='time'>
                    Time <span className='text-red-500'>*</span>
                </label>
                <InputText id='time' type='time' {...register('time', { required: 'Required' })} error={errors.time?.message} />
            </div>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='inOut'>
                    Input/Output <span className='text-red-500'>*</span>
                </label>
                <Select onValueChange={(v) => setValue('inOut', v as 'IN' | 'OUT')}>
                    <SelectTrigger id='inOut'>
                        <SelectValue placeholder='Select' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='IN'>IN</SelectItem>
                        <SelectItem value='OUT'>OUT</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className='space-y-2'>
                <label className='font-medium text-sm' htmlFor='upload'>
                    Upload
                </label>
                <Button type='button' variant='outline' size='sm'>
                    <Upload className='mr-2 h-4 w-4' /> Choose File
                </Button>
            </div>
            <div className='space-y-2 md:col-span-2'>
                <label className='font-medium text-sm' htmlFor='remarks'>
                    Remarks
                </label>
                <InputText id='remarks' placeholder='Remarks' {...register('remarks')} />
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
