'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaveCredit, useUpdateLeaveCredit } from '@/hooks/hrms/leave-management/useTransactions';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { LeaveCredit } from './columns';

interface UpdateLeaveCreditFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveCredit;
}

const typeOptions = ['VKS', 'Permanent', 'ELearning', 'Robotic', 'Internship', 'Management Admin'];
const departmentOptions = ['Hardware and Network', 'Sales', 'Human Resource', 'Admin', 'LEGAL', 'IT Team'];
const designationOptions = [
    'Computer Faculty',
    'E-learning coordinator',
    'Accounts and Finance Executive',
    'Client acquisition manager',
    'Sr HR Executive',
    'Manager HR'
];

export default function UpdateLeaveCreditForm({ onSuccess, className = '', selectedRow: row }: UpdateLeaveCreditFormProps) {
    const { refetchAll } = useLeaveCredit();
    const { mutate: updateCredit, isPending } = useUpdateLeaveCredit();
    const [activeTab, setActiveTab] = useState('Leave Credit');

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCredit>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                leaveYear: row.leaveYear || '',
                leaveName: row.leaveName || '',
                employeeName: row.employeeName || '',
                leaveCredit: row.leaveCredit || 0,
                leaveBalance: row.leaveBalance || 0,
                type: row.type || [],
                department: row.department || [],
                designation: row.designation || []
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveCredit> = async (data) => {
        updateCredit(
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

    const handleTypeChange = (type: string, checked: boolean) => {
        const currentTypes = watch('type');
        if (checked) {
            setValue('type', [...currentTypes, type]);
        } else {
            setValue('type', currentTypes.filter((t) => t !== type));
        }
    };

    const handleDepartmentChange = (dept: string, checked: boolean) => {
        const currentDepts = watch('department');
        if (checked) {
            setValue('department', [...currentDepts, dept]);
        } else {
            setValue('department', currentDepts.filter((d) => d !== dept));
        }
    };

    const handleDesignationChange = (desig: string, checked: boolean) => {
        const currentDesigs = watch('designation');
        if (checked) {
            setValue('designation', [...currentDesigs, desig]);
        } else {
            setValue('designation', currentDesigs.filter((d) => d !== desig));
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='Leave Credit'>Leave Credit</TabsTrigger>
                    <TabsTrigger value='Leave Addition'>Leave Addition</TabsTrigger>
                    <TabsTrigger value='Leave Deduction'>Leave Deduction</TabsTrigger>
                    <TabsTrigger value='Leave CarryForward'>Leave CarryForward</TabsTrigger>
                </TabsList>

                <TabsContent value='Leave Credit' className='space-y-4'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div>
                                <label htmlFor='type-checkboxes' className='font-medium text-sm'>
                                    Type
                                </label>
                                <div id='type-checkboxes' className='max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                    <div className='mb-2 flex items-center space-x-2'>
                                        <Checkbox
                                            id='type-all'
                                            checked={watch('type').length === typeOptions.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('type', typeOptions);
                                                } else {
                                                    setValue('type', []);
                                                }
                                            }}
                                        />
                                        <label htmlFor='type-all' className='font-medium text-sm'>
                                            Type: All
                                        </label>
                                    </div>
                                    {typeOptions.map((type) => (
                                        <div key={type} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`type-${type}`}
                                                checked={watch('type').includes(type)}
                                                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                                            />
                                            <label htmlFor={`type-${type}`} className='text-sm'>
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor='department-checkboxes' className='font-medium text-sm'>
                                    Department
                                </label>
                                <div id='department-checkboxes' className='max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                    <div className='mb-2 flex items-center space-x-2'>
                                        <Checkbox
                                            id='dept-all'
                                            checked={watch('department').length === departmentOptions.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('department', departmentOptions);
                                                } else {
                                                    setValue('department', []);
                                                }
                                            }}
                                        />
                                        <label htmlFor='dept-all' className='font-medium text-sm'>
                                            Department: All
                                        </label>
                                    </div>
                                    {departmentOptions.map((dept) => (
                                        <div key={dept} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`dept-${dept}`}
                                                checked={watch('department').includes(dept)}
                                                onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                                            />
                                            <label htmlFor={`dept-${dept}`} className='text-sm'>
                                                {dept}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor='designation-checkboxes' className='font-medium text-sm'>
                                    Designation
                                </label>
                                <div id='designation-checkboxes' className='max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                    <div className='mb-2 flex items-center space-x-2'>
                                        <Checkbox
                                            id='desig-all'
                                            checked={watch('designation').length === designationOptions.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('designation', designationOptions);
                                                } else {
                                                    setValue('designation', []);
                                                }
                                            }}
                                        />
                                        <label htmlFor='desig-all' className='font-medium text-sm'>
                                            Designation: All
                                        </label>
                                    </div>
                                    {designationOptions.map((desig) => (
                                        <div key={desig} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`desig-${desig}`}
                                                checked={watch('designation').includes(desig)}
                                                onCheckedChange={(checked) => handleDesignationChange(desig, checked as boolean)}
                                            />
                                            <label htmlFor={`desig-${desig}`} className='text-sm'>
                                                {desig}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='leaveYear'
                                control={control}
                                rules={{ required: 'Leave Year is required' }}
                                render={({ field }) => (
                                    <div>
                                        <label htmlFor='leave-year-select' className='font-medium text-sm'>
                                            Leave Year <span className='text-red-500'>*</span>
                                        </label>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id='leave-year-select' className={errors.leaveYear ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Leave Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.leaveYear && <FormError>{errors.leaveYear.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                name='leaveName'
                                control={control}
                                rules={{ required: 'Leave Name is required' }}
                                render={({ field }) => (
                                    <div>
                                        <label htmlFor='leave-name-select' className='font-medium text-sm'>
                                            Leave Name <span className='text-red-500'>*</span>
                                        </label>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id='leave-name-select' className={errors.leaveName ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Leave Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                                <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                                <SelectItem value='Optional Leave'>Optional Leave</SelectItem>
                                                <SelectItem value='Emergency Leave'>Emergency Leave</SelectItem>
                                                <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                                <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                                    </div>
                                )}
                            />

                            <InputText
                                label='Employee Name'
                                id='employee-name-input'
                                {...register('employeeName')}
                                error={errors.employeeName?.message}
                                placeholder='Enter employee name'
                            />

                            <InputText
                                label='Leave Credit'
                                id='leave-credit-input'
                                type='number'
                                step='0.5'
                                {...register('leaveCredit', { valueAsNumber: true })}
                                error={errors.leaveCredit?.message}
                                placeholder='Enter leave credit'
                            />

                            <InputText
                                label='Leave Balance'
                                id='leave-balance-input'
                                type='number'
                                step='0.5'
                                {...register('leaveBalance', { valueAsNumber: true })}
                                error={errors.leaveBalance?.message}
                                placeholder='Enter leave balance'
                            />
                        </div>

                        <div className='flex justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                                Reset
                            </Button>
                            <Button type='submit' disabled={isPending || isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
                                <Save className='mr-2 h-4 w-4' />
                                {isPending || isSubmitting ? 'Updating...' : 'Update'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value='Leave Addition' className='space-y-4'>
                    <div className='py-8 text-center text-gray-500'>
                        Leave Addition functionality will be implemented here
                    </div>
                </TabsContent>

                <TabsContent value='Leave Deduction' className='space-y-4'>
                    <div className='py-8 text-center text-gray-500'>
                        Leave Deduction functionality will be implemented here
                    </div>
                </TabsContent>

                <TabsContent value='Leave CarryForward' className='space-y-4'>
                    <div className='py-8 text-center text-gray-500'>
                        Leave CarryForward functionality will be implemented here
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

