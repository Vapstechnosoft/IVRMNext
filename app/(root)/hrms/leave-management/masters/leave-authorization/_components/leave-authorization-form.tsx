'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveAuthorization } from './columns';

interface LeaveAuthorizationFormProps {
    editingLeaveAuthorization: LeaveAuthorization | null;
    onSubmit: (data: LeaveAuthorization) => void;
    onCancel: () => void;
}

export function LeaveAuthorizationForm({ editingLeaveAuthorization, onSubmit, onCancel }: LeaveAuthorizationFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveAuthorization>({
        defaultValues: editingLeaveAuthorization || {
            institution: 'Vaps Knowledge Services Pvt Ltd',
            gradeName: '',
            groupTypeName: '',
            departmentName: '',
            designationName: '',
            leaveType: '',
            orderOfApproval: '',
            approvalPerson: '',
            finalFlag: false,
            emailId: '',
            sanctionedUser: '',
            sanctionedOrder: ''
        }
    });

    const handleFormSubmit: SubmitHandler<LeaveAuthorization> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
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
                    <div>
                        <label htmlFor='grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Select Grade <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('gradeName')} onValueChange={(value) => setValue('gradeName', value)}>
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
                        {errors.gradeName && <p className='mt-1 text-red-500 text-xs'>{errors.gradeName.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Group Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('groupTypeName')} onValueChange={(value) => setValue('groupTypeName', value)}>
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
                        {errors.groupTypeName && <p className='mt-1 text-red-500 text-xs'>{errors.groupTypeName.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Department Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('departmentName')} onValueChange={(value) => setValue('departmentName', value)}>
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
                        {errors.departmentName && <p className='mt-1 text-red-500 text-xs'>{errors.departmentName.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Designation Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('designationName')} onValueChange={(value) => setValue('designationName', value)}>
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
                        {errors.designationName && <p className='mt-1 text-red-500 text-xs'>{errors.designationName.message}</p>}
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <div>
                        <label htmlFor='leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Leave Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('leaveType')} onValueChange={(value) => setValue('leaveType', value)}>
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
                        {errors.leaveType && <p className='mt-1 text-red-500 text-xs'>{errors.leaveType.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='order-approval-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Order Of Approval <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('orderOfApproval')} onValueChange={(value) => setValue('orderOfApproval', value)}>
                            <SelectTrigger id='order-approval-select' className={errors.orderOfApproval ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='1'>1</SelectItem>
                                <SelectItem value='2'>2</SelectItem>
                                <SelectItem value='3'>3</SelectItem>
                                <SelectItem value='4'>4</SelectItem>
                                <SelectItem value='5'>5</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.orderOfApproval && <p className='mt-1 text-red-500 text-xs'>{errors.orderOfApproval.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Approval Person <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('approvalPerson')} onValueChange={(value) => setValue('approvalPerson', value)}>
                            <SelectTrigger id='approval-person-select' className={errors.approvalPerson ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Benoy Yogesh Shetty'>Benoy Yogesh Shetty</SelectItem>
                                <SelectItem value='R Siddesh Kumar'>R Siddesh Kumar</SelectItem>
                                <SelectItem value='John Doe'>John Doe</SelectItem>
                                <SelectItem value='Jane Smith'>Jane Smith</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.approvalPerson && <p className='mt-1 text-red-500 text-xs'>{errors.approvalPerson.message}</p>}
                    </div>

                    <div className='flex items-center space-x-2'>
                        <Checkbox
                            id='finalFlag'
                            checked={watch('finalFlag')}
                            onCheckedChange={(checked) => setValue('finalFlag', checked as boolean)}
                        />
                        <label htmlFor='finalFlag' className='font-medium text-gray-700 text-sm'>
                            Final Flag
                        </label>
                    </div>

                    <div>
                        <label htmlFor='email-id-input' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Email Id
                        </label>
                        <InputText
                            id='email-id-input'
                            type='email'
                            {...register('emailId')}
                            placeholder='Enter email id'
                            className={errors.emailId ? 'border-red-500' : ''}
                        />
                        {errors.emailId && <p className='mt-1 text-red-500 text-xs'>{errors.emailId.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='sanctioned-user-input' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Sanctioned User
                        </label>
                        <InputText
                            id='sanctioned-user-input'
                            {...register('sanctionedUser')}
                            placeholder='Enter sanctioned user'
                            className={errors.sanctionedUser ? 'border-red-500' : ''}
                        />
                        {errors.sanctionedUser && <p className='mt-1 text-red-500 text-xs'>{errors.sanctionedUser.message}</p>}
                    </div>

                    <div>
                        <label htmlFor='sanctioned-order-input' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Sanctioned Order
                        </label>
                        <InputText
                            id='sanctioned-order-input'
                            {...register('sanctionedOrder')}
                            placeholder='Enter sanctioned order'
                            className={errors.sanctionedOrder ? 'border-red-500' : ''}
                        />
                        {errors.sanctionedOrder && <p className='mt-1 text-red-500 text-xs'>{errors.sanctionedOrder.message}</p>}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4 pt-4'>
                <Button type='submit' className='bg-blue-600 px-6 py-2 text-white hover:bg-blue-700'>
                    + ADD TO CART
                </Button>
                <Button type='button' variant='destructive' onClick={onCancel} className='px-6 py-2'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
