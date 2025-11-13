'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { ApplyLeave } from './columns';

interface ApplyLeaveFormProps {
    defaultEmployee: {
        name: string;
        designation: string;
        doj: string;
    };
    onSubmit: (data: ApplyLeave) => void;
    onCancel: () => void;
}

export function ApplyLeaveForm({ defaultEmployee, onSubmit, onCancel }: ApplyLeaveFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ApplyLeave>({
        defaultValues: {
            employeeName: defaultEmployee.name,
            designation: defaultEmployee.designation,
            doj: defaultEmployee.doj,
            leaveType: '',
            fromDate: '',
            toDate: '',
            numDays: 0,
            reason: ''
        }
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    const todayISO = new Date().toISOString().slice(0, 10);

    // Auto-calculate number of days and validate date sequence
    useEffect(() => {
        if (!fromDate || !toDate) {
            setValue('numDays', 0);
            return;
        }
        const start = new Date(fromDate);
        const end = new Date(toDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setValue('numDays', 0);
            return;
        }
        if (end < start) {
            setValue('numDays', 0);
            return;
        }
        const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setValue('numDays', diff);
    }, [fromDate, toDate, setValue]);

    const handleFormSubmit: SubmitHandler<ApplyLeave> = (data) => {
        // Validate dates are not in the past
        if (data.fromDate < todayISO || data.toDate < todayISO) {
            return;
        }
        if (new Date(data.toDate) < new Date(data.fromDate)) {
            return;
        }
        if (!data.leaveType) {
            return;
        }
        if (!data.reason.trim()) {
            return;
        }
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            {/* Read-only employee details */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div>
                    <label htmlFor='employee-name-input' className='font-medium text-sm'>
                        Employee Name
                    </label>
                    <InputText id='employee-name-input' readOnly {...register('employeeName')} />
                </div>
                <div>
                    <label htmlFor='designation-input' className='font-medium text-sm'>
                        Designation
                    </label>
                    <InputText id='designation-input' readOnly {...register('designation')} />
                </div>
                <div>
                    <label htmlFor='doj-input' className='font-medium text-sm'>
                        DOJ
                    </label>
                    <InputText id='doj-input' type='date' readOnly {...register('doj')} />
                </div>
            </div>

            {/* Leave inputs */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div>
                    <label htmlFor='leave-type-select' className='font-medium text-sm'>
                        Leave Type *
                    </label>
                    <Select value={watch('leaveType')} onValueChange={(v) => setValue('leaveType', v)}>
                        <SelectTrigger id='leave-type-select'>
                            <SelectValue placeholder='Select Leave Type' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                            <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                            <SelectItem value='Earned Leave'>Earned Leave</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.leaveType && <p className='mt-1 text-red-500 text-xs'>Leave Type is required</p>}
                </div>
                <div>
                    <label htmlFor='from-date-input' className='font-medium text-sm'>
                        From Date *
                    </label>
                    <InputText id='from-date-input' type='date' {...register('fromDate', { required: true })} min={todayISO} />
                    {errors.fromDate && <p className='mt-1 text-red-500 text-xs'>From Date is required</p>}
                </div>
                <div>
                    <label htmlFor='to-date-input' className='font-medium text-sm'>
                        To Date *
                    </label>
                    <InputText id='to-date-input' type='date' {...register('toDate', { required: true })} min={todayISO} />
                    {errors.toDate && <p className='mt-1 text-red-500 text-xs'>To Date is required</p>}
                </div>
                <div>
                    <label htmlFor='num-days-input' className='font-medium text-sm'>
                        No. of Days
                    </label>
                    <InputText id='num-days-input' readOnly {...register('numDays', { valueAsNumber: true })} />
                </div>
                <div className='md:col-span-3'>
                    <label htmlFor='reason-textarea' className='font-medium text-sm'>
                        Reason *
                    </label>
                    <textarea
                        id='reason-textarea'
                        {...(register as any)('reason', { required: true, maxLength: 255 })}
                        maxLength={255}
                        placeholder='Enter reason (max 255 chars)'
                        className='w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        rows={3}
                    />
                    {errors.reason && <p className='mt-1 text-red-500 text-xs'>Reason is required</p>}
                </div>
            </div>

            <div className='flex gap-2'>
                <Button type='submit'>Submit</Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
