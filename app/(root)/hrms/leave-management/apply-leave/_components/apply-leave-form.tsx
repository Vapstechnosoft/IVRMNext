'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { X } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { ApplyLeave } from './columns';

interface ApplyLeaveFormProps {
    defaultEmployee: {
        name: string;
        designation: string;
        doj: string;
        email?: string;
        phone?: string;
    };
    onSubmit: (data: ApplyLeave) => void;
    onCancel: () => void;
}

export function ApplyLeaveForm({ defaultEmployee, onSubmit, onCancel }: ApplyLeaveFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors }
    } = useForm<ApplyLeave & { contactNumber: string; dateReportingBack: string; file?: FileList }>({
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
    const selectedFile = watch('file');

    const handleFormSubmit: SubmitHandler<ApplyLeave & { contactNumber: string; dateReportingBack: string; file?: FileList }> = (data) => {
        if (!data.reason?.trim()) {
            return;
        }
        if (!data.contactNumber?.trim()) {
            return;
        }
        if (!data.dateReportingBack) {
            return;
        }
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            {/* Read-only employee details */}
            <div className='rounded-lg border bg-gray-50 p-4'>
                <h3 className='mb-4 font-semibold text-sm text-gray-700'>Employee Information</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                    <div>
                        <label htmlFor='employee-name-input' className='mb-1 block text-xs font-medium text-gray-600'>
                            Employee Name
                        </label>
                        <InputText id='employee-name-input' readOnly {...register('employeeName')} className='bg-white' />
                    </div>
                    <div>
                        <label htmlFor='doj-input' className='mb-1 block text-xs font-medium text-gray-600'>
                            DOJ
                        </label>
                        <InputText id='doj-input' type='date' readOnly {...register('doj')} className='bg-white' />
                    </div>
                    <div>
                        <label htmlFor='designation-input' className='mb-1 block text-xs font-medium text-gray-600'>
                            Designation
                        </label>
                        <InputText id='designation-input' readOnly {...register('designation')} className='bg-white' />
                    </div>
                    <div>
                        <label htmlFor='email-input' className='mb-1 block text-xs font-medium text-gray-600'>
                            Email
                        </label>
                        <InputText
                            id='email-input'
                            type='email'
                            readOnly
                            value={defaultEmployee.email || ''}
                            className='bg-white'
                        />
                    </div>
                    <div>
                        <label htmlFor='phone-input' className='mb-1 block text-xs font-medium text-gray-600'>
                            Phone
                        </label>
                        <InputText id='phone-input' type='tel' readOnly value={defaultEmployee.phone || ''} className='bg-white' />
                    </div>
                </div>
            </div>

            {/* Leave Application Form */}
            <div className='space-y-4'>
                <h3 className='font-semibold text-sm text-gray-700'>Leave Application Details</h3>

                {/* Reasons for Leave */}
                <div>
                    <label htmlFor='reason-textarea' className='mb-2 block font-medium text-sm'>
                        Reasons for Leave <span className='text-red-500'>*</span>
                    </label>
                    <InputTextarea
                        id='reason-textarea'
                        {...register('reason', { required: 'Reasons for Leave is required' })}
                        placeholder='Enter reasons for leave'
                        rows={4}
                        error={errors.reason?.message}
                        className='w-full'
                    />
                </div>

                {/* Date Reporting Back */}
                <div className='w-full md:w-1/2'>
                    <Controller
                        control={control}
                        name='dateReportingBack'
                        rules={{ required: 'Date Reporting Back is required' }}
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label='Date Reporting Back'
                                placeholder='Select Date Reporting Back'
                                fromDate={new Date()}
                            />
                        )}
                    />
                </div>

                {/* Contact Number While on Leave */}
                <div>
                    <label htmlFor='contact-number-input' className='mb-2 block font-medium text-sm'>
                        Contact Number While on Leave <span className='text-red-500'>*</span>
                    </label>
                    <InputText
                        id='contact-number-input'
                        type='tel'
                        {...register('contactNumber', { required: 'Contact Number is required' })}
                        error={errors.contactNumber?.message}
                        placeholder='Enter contact number'
                        className='w-full md:w-1/2'
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className='mb-2 block font-medium text-sm'>Document</label>
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
                            onClick={() => document.getElementById('leave-document-file')?.click()}
                            className='w-fit'>
                            Choose File
                        </Button>
                        <span className='text-sm text-muted-foreground'>
                            {selectedFile && selectedFile[0] ? selectedFile[0].name : 'No file chosen'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-4'>
                <Button type='submit' variant='default' className='px-6'>
                    APPLY LEAVE NOW
                </Button>
                <Button type='button' variant='outline' onClick={onCancel} className='px-6'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
