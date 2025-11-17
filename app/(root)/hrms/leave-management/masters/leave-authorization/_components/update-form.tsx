'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveAuthorization, useUpdateLeaveAuthorization } from '@/hooks/hrms/leave-management/useMasters';
import { LEAVE_AUTHORIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveAuthorization } from './columns';

interface UpdateLeaveAuthorizationFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveAuthorization;
}

export default function UpdateLeaveAuthorizationForm({ onSuccess, className = '', selectedRow: row }: UpdateLeaveAuthorizationFormProps) {
    const { refetchAll } = useLeaveAuthorization();
    const { mutate: updateLeaveAuthorization, isPending } = useUpdateLeaveAuthorization();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveAuthorization>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                institution: row.institution || 'Vaps Knowledge Services Pvt Ltd',
                gradeName: row.gradeName || '',
                groupTypeName: row.groupTypeName || '',
                departmentName: row.departmentName || '',
                designationName: row.designationName || '',
                leaveType: row.leaveType || '',
                orderOfApproval: row.orderOfApproval || '',
                approvalPerson: row.approvalPerson || '',
                finalFlag: row.finalFlag ?? false
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveAuthorization> = async (data) => {
        updateLeaveAuthorization(
            {
                ...data,
                id: row.id
            },
            {
                onSuccess: () => {
                    reset();
                    refetchAll();
                    onSuccess?.();
                }
            }
        );
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Institution Field */}
                <div className='mb-4'>
                    <label htmlFor='institution-display' className='mb-2 block font-medium text-gray-700 text-sm'>
                        Institution
                    </label>
                    <div id='institution-display' className='rounded-md bg-gray-100 p-3 text-gray-600'>
                        {watch('institution')}
                    </div>
                </div>

                {/* Form Fields Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <Controller
                            name='gradeName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.gradeName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Select Grade <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='grade-select' className={errors.gradeName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Manager'>Manager</SelectItem>
                                            <SelectItem value='Executive'>Executive</SelectItem>
                                            <SelectItem value='Senior Manager'>Senior Manager</SelectItem>
                                            <SelectItem value='Director'>Director</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gradeName && <FormError>{errors.gradeName.message}</FormError>}
                                </div>
                            )}
                        />

                        <Controller
                            name='groupTypeName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.groupTypeName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Group Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='group-type-select' className={errors.groupTypeName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='VKS'>VKS</SelectItem>
                                            <SelectItem value='Admin'>Admin</SelectItem>
                                            <SelectItem value='HR'>HR</SelectItem>
                                            <SelectItem value='Finance'>Finance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.groupTypeName && <FormError>{errors.groupTypeName.message}</FormError>}
                                </div>
                            )}
                        />

                        <Controller
                            name='departmentName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.departmentName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Department Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='department-select' className={errors.departmentName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Sales and Marketing'>Sales and Marketing</SelectItem>
                                            <SelectItem value='Human Resources'>Human Resources</SelectItem>
                                            <SelectItem value='Finance'>Finance</SelectItem>
                                            <SelectItem value='Operations'>Operations</SelectItem>
                                            <SelectItem value='IT'>IT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.departmentName && <FormError>{errors.departmentName.message}</FormError>}
                                </div>
                            )}
                        />

                        <Controller
                            name='designationName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.designationName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Designation Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='designation-select' className={errors.designationName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Assistant Business Development Manager'>
                                                Assistant Business Development Manager
                                            </SelectItem>
                                            <SelectItem value='Business Development Manager'>Business Development Manager</SelectItem>
                                            <SelectItem value='Senior Business Development Manager'>
                                                Senior Business Development Manager
                                            </SelectItem>
                                            <SelectItem value='Team Lead'>Team Lead</SelectItem>
                                            <SelectItem value='Senior Manager'>Senior Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.designationName && <FormError>{errors.designationName.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        <Controller
                            name='leaveType'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.leaveType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id='leave-type-select' className={errors.leaveType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                            <SelectItem value='Optional Leave'>Optional Leave</SelectItem>
                                            <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                            <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                            <SelectItem value='Emergency Leave'>Emergency Leave</SelectItem>
                                            <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveType && <FormError>{errors.leaveType.message}</FormError>}
                                </div>
                            )}
                        />

                        <InputText
                            label='Order of Approval'
                            required
                            id='orderOfApproval'
                            type='number'
                            {...register('orderOfApproval', LEAVE_AUTHORIZATION_VALIDATION.orderOfApproval)}
                            error={errors.orderOfApproval?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <Controller
                            name='approvalPerson'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.approvalPerson}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Approval Person <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger
                                            id='approval-person-select'
                                            className={errors.approvalPerson ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Benoy Yogesh Shetty'>Benoy Yogesh Shetty</SelectItem>
                                            <SelectItem value='R Siddesh Kumar'>R Siddesh Kumar</SelectItem>
                                            <SelectItem value='John Doe'>John Doe</SelectItem>
                                            <SelectItem value='Jane Smith'>Jane Smith</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.approvalPerson && <FormError>{errors.approvalPerson.message}</FormError>}
                                </div>
                            )}
                        />

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='finalFlag'
                                control={control}
                                render={({ field }) => <Checkbox id='finalFlag' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <label htmlFor='finalFlag' className='font-medium text-gray-700 text-sm'>
                                Final Flag
                            </label>
                        </div>

                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-2'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
