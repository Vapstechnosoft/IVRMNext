'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { useApplyLeave, useLeaveHistory } from '@/hooks/hrms/leave-management/useApplyLeave';
import { Check, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
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

    const {
        register,
        handleSubmit,
        reset,
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
            reason: data.reason
        };

        applyLeave(leaveData, {
            onSuccess: () => {
                reset();
                const fileInput = document.getElementById('leave-document-file') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
                refetchAll();
                onSuccess?.();
            }
        });
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                {/* Reasons for Leave */}
                <div className='space-y-2'>
                    <label htmlFor='reason-textarea' className='font-medium text-sm'>
                        Reasons for Leave <span className='text-red-500'>*</span>
                    </label>
                    <InputTextarea
                        id='reason-textarea'
                        {...register('reason', { required: 'Reasons for Leave is required' })}
                        error={errors.reason?.message}
                        placeholder='Enter reasons for leave'
                        rows={4}
                        className='w-full'
                    />
                </div>

                {/* Contact Number While on Leave */}
                <div className='space-y-2'>
                    <label htmlFor='contact-number-input' className='font-medium text-sm'>
                        Contact Number While on Leave <span className='text-red-500'>*</span>
                    </label>
                    <InputText
                        id='contact-number-input'
                        type='tel'
                        {...register('contactNumber', { required: 'Contact Number is required' })}
                        error={errors.contactNumber?.message}
                        placeholder='Enter contact number'
                    />
                </div>

                {/* Date Reporting Back */}
                <div className='space-y-2'>
                    <label htmlFor='date-reporting-back-input' className='font-medium text-sm'>
                        Date Reporting Back <span className='text-red-500'>*</span>
                    </label>
                    <InputText
                        id='date-reporting-back-input'
                        type='date'
                        {...register('dateReportingBack', { required: 'Date Reporting Back is required' })}
                        error={errors.dateReportingBack?.message}
                        min={todayISO}
                    />
                </div>

                {/* File Upload */}
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>Document</label>
                    <div className='flex items-center gap-2'>
                        <input
                            id='leave-document-file'
                            type='file'
                            {...register('file')}
                            className='hidden'
                            accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                        />
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => document.getElementById('leave-document-file')?.click()}>
                            Choose File
                        </Button>
                        <span className='text-sm text-muted-foreground'>No file chosen</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-2 pt-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            reset();
                            const fileInput = document.getElementById('leave-document-file') as HTMLInputElement;
                            if (fileInput) {
                                fileInput.value = '';
                            }
                        }}
                        disabled={isPending || isSubmitting}>
                        <X className='mr-2 h-4 w-4' />
                        CANCEL
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting} variant='default'>
                        <Check className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Submitting...' : 'APPLY LEAVE NOW'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
