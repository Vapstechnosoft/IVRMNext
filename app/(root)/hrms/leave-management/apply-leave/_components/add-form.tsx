'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplyLeave, useLeaveHistory } from '@/hooks/hrms/leave-management/useApplyLeave';
import { useMasterLeaveDropdowns } from '@/hooks/hrms/leave-management/useMasters';
import { Check, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { ApplyLeave } from './columns';

interface AddApplyLeaveFormProps {
    onSuccess?: () => void;
    className?: string;
    defaultEmployee: {
        name: string;
        designation: string;
        doj: string;
        email?: string;
        phone?: string;
    };
}

export default function AddApplyLeaveForm({ onSuccess, className = '', defaultEmployee }: AddApplyLeaveFormProps) {
    const { refetchAll } = useLeaveHistory();
    const { mutate: applyLeave, isPending } = useApplyLeave();
    const { data: dropdownData, isLoading: isDropdownLoading } = useMasterLeaveDropdowns();

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ApplyLeave & { contactNumber: string; dateReportingBack: string; file?: FileList }>({
        mode: 'onChange',
        defaultValues: {
            employeeName: defaultEmployee.name,
            designation: defaultEmployee.designation,
            doj: defaultEmployee.doj,
            leaveType: '',
            fromDate: '',
            toDate: '',
            numDays: 0,
            reason: '',
            contactNumber: '',
            dateReportingBack: ''
        }
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');

    // Calculate number of days when dates change
    useEffect(() => {
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setValue('numDays', diffDays);
            } else {
                setValue('numDays', 0);
            }
        } else {
            setValue('numDays', 0);
        }
    }, [fromDate, toDate, setValue]);

    const todayISO = new Date().toISOString().slice(0, 10);

    const onSubmit: SubmitHandler<ApplyLeave & { contactNumber: string; dateReportingBack: string; file?: FileList }> = async (data) => {
        if (!data.reason?.trim()) {
            return;
        }
        if (!data.contactNumber?.trim()) {
            return;
        }
        if (!data.dateReportingBack) {
            return;
        }
        // Convert to ApplyLeave format
        const leaveData: ApplyLeave = {
            employeeName: data.employeeName,
            designation: data.designation,
            doj: data.doj,
            leaveType: data.leaveType || '',
            fromDate: data.fromDate || '',
            toDate: data.toDate || '',
            numDays: data.numDays || 0,
            reason: data.reason,
            contactNumber: data.contactNumber,
            dateReportingBack: data.dateReportingBack,
            file: data.file
        };
        applyLeave(
            { data: leaveData },
            {
                onSuccess: () => {
                    handleReset();
                    refetchAll();
                    onSuccess?.();
                }
            }
        );
    };

    const handleReset = () => {
        reset({
            employeeName: defaultEmployee.name,
            designation: defaultEmployee.designation,
            doj: defaultEmployee.doj,
            leaveType: '',
            fromDate: '',
            toDate: '',
            numDays: 0,
            reason: '',
            contactNumber: '',
            dateReportingBack: ''
        });
        const fileInput = document.getElementById('leave-document-file') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const leaveOptions = dropdownData?.data?.leaveTypes || [];

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>

                {/* Employee Information (Read Only) */}
                <div className='rounded-lg border bg-muted/30 p-4'>
                    <h3 className='mb-3 font-semibold text-sm'>Employee Information</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Employee Name'
                            readOnly
                            disabled
                            {...register('employeeName')}
                            className='cursor-not-allowed bg-muted opacity-70'
                        />
                        <InputText
                            label='Designation'
                            readOnly
                            disabled
                            {...register('designation')}
                            className='cursor-not-allowed bg-muted opacity-70'
                        />
                        <InputText
                            label='Date of Joining'
                            readOnly
                            disabled
                            {...register('doj')}
                            type='date'
                            className='cursor-not-allowed bg-muted opacity-70'
                        />
                    </div>
                </div>

                <div className='space-y-4'>
                    {/* Leave Details Row 1 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <Controller
                            name='leaveType'
                            control={control}
                            rules={{ required: 'Leave Type is required' }}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leaveType' className='mb-2 block font-medium text-sm'>
                                        Leave Name <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        onValueChange={(value) => field.onChange(value)}
                                        value={field.value}
                                        disabled={isDropdownLoading}>
                                        <SelectTrigger id='leaveType' className={errors.leaveType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isDropdownLoading ? 'Loading...' : 'Select Leave'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveOptions.length > 0 ? (
                                                leaveOptions.map((option: any) => (
                                                    <SelectItem key={option.hrmL_Id} value={option.hrmL_LeaveName}>
                                                        {option.hrmL_LeaveName}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    No leave types available
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveType && <FormError>{errors.leaveType.message}</FormError>}
                                </div>
                            )}
                        />
                        <InputText
                            label='From Date'
                            required
                            type='date'
                            id='fromDate'
                            {...register('fromDate', { required: 'From Date is required' })}
                            error={errors.fromDate?.message}
                            min={todayISO}
                        />
                        <InputText
                            label='To Date'
                            required
                            type='date'
                            id='toDate'
                            {...register('toDate', {
                                required: 'To Date is required',
                                validate: (val) => {
                                    if (!val || !fromDate) return true;
                                    return new Date(val) >= new Date(fromDate) || 'To Date must be after From Date';
                                }
                            })}
                            error={errors.toDate?.message}
                            min={fromDate || todayISO}
                        />
                        <InputText
                            label='Total Days'
                            readOnly
                            id='numDays'
                            {...register('numDays')}
                            className='bg-muted/50 font-bold'
                        />
                    </div>

                    {/* Leave Details Row 2 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputTextarea
                            label='Reasons for Leave'
                            required
                            id='reason-textarea'
                            {...register('reason', { required: 'Reasons for Leave is required' })}
                            error={errors.reason?.message}
                            placeholder='Enter reasons for leave'
                            rows={3}
                        />
                        <div className='grid grid-cols-1 gap-4'>
                            <InputText
                                label='Contact Number While on Leave'
                                required
                                id='contact-number-input'
                                type='tel'
                                {...register('contactNumber', { required: 'Contact Number is required' })}
                                error={errors.contactNumber?.message}
                                placeholder='Enter contact number'
                            />
                            <InputText
                                label='Date Reporting Back'
                                required
                                id='date-reporting-back-input'
                                type='date'
                                {...register('dateReportingBack', { required: 'Date Reporting Back is required' })}
                                error={errors.dateReportingBack?.message}
                                min={toDate || todayISO}
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className='space-y-2'>
                        <label htmlFor='leave-document-file' className='font-medium text-sm'>
                            Supporting Document
                        </label>
                        <div className='flex items-center gap-2 rounded-md border p-2'>
                            <input
                                id='leave-document-file'
                                type='file'
                                {...register('file')}
                                className='hidden'
                                accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                            />
                            <Button type='button' variant='secondary' size='sm' onClick={() => document.getElementById('leave-document-file')?.click()}>
                                Choose File
                            </Button>
                            <span className='text-muted-foreground text-sm truncate max-w-[200px]'>
                                {watch('file')?.[0]?.name || 'No file chosen'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-2 pt-4 border-t'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isPending || isSubmitting}>
                        <RotateCcw className='mr-1.5 h-4 w-4' />
                        Reset
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            handleReset();
                            // Optional: Close form logic if needed to be triggered from here, 
                            // typically handled by parent via onSuccess or dedicated onClose
                        }}
                        disabled={isPending || isSubmitting}
                        className='hidden sm:flex'
                    >
                        <X className='mr-2 h-4 w-4' />
                        CANCEL
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting} variant='default'>
                        {isPending || isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Check className='mr-2 h-4 w-4' />
                                APPLY LEAVE
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
