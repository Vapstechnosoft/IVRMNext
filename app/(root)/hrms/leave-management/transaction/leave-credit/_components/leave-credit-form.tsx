'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCredit } from './columns';

interface LeaveCreditFormProps {
    editingCredit: LeaveCredit | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onSubmit: (data: LeaveCredit) => void;
    onCancel: () => void;
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

export function LeaveCreditForm({ editingCredit, activeTab, onTabChange, onSubmit, onCancel }: LeaveCreditFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCredit>({
        defaultValues: editingCredit || {
            leaveYear: '',
            leaveName: '',
            employeeName: '',
            leaveCredit: 0,
            leaveBalance: 0,
            type: [],
            department: [],
            designation: []
        }
    });

    const handleFormSubmit: SubmitHandler<LeaveCredit> = (data) => {
        onSubmit(data);
    };

    const handleTypeChange = (type: string, checked: boolean) => {
        const currentTypes = watch('type');
        if (checked) {
            setValue('type', [...currentTypes, type]);
        } else {
            setValue(
                'type',
                currentTypes.filter((t) => t !== type)
            );
        }
    };

    const handleDepartmentChange = (dept: string, checked: boolean) => {
        const currentDepts = watch('department');
        if (checked) {
            setValue('department', [...currentDepts, dept]);
        } else {
            setValue(
                'department',
                currentDepts.filter((d) => d !== dept)
            );
        }
    };

    const handleDesignationChange = (desig: string, checked: boolean) => {
        const currentDesigs = watch('designation');
        if (checked) {
            setValue('designation', [...currentDesigs, desig]);
        } else {
            setValue(
                'designation',
                currentDesigs.filter((d) => d !== desig)
            );
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className='w-full'>
            <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='Leave Credit'>Leave Credit</TabsTrigger>
                <TabsTrigger value='Leave Addition'>Leave Addition</TabsTrigger>
                <TabsTrigger value='Leave Deduction'>Leave Deduction</TabsTrigger>
                <TabsTrigger value='Leave CarryForward'>Leave CarryForward</TabsTrigger>
            </TabsList>

            <TabsContent value='Leave Credit' className='space-y-4'>
                <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
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
                        <div>
                            <label htmlFor='leave-year-select' className='font-medium text-sm'>
                                Leave Year *
                            </label>
                            <Select value={watch('leaveYear')} onValueChange={(value) => setValue('leaveYear', value)}>
                                <SelectTrigger id='leave-year-select' className={errors.leaveYear ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select Leave Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='2019'>2019</SelectItem>
                                    <SelectItem value='2020'>2020</SelectItem>
                                    <SelectItem value='2021'>2021</SelectItem>
                                    <SelectItem value='2022'>2022</SelectItem>
                                    <SelectItem value='2023'>2023</SelectItem>
                                    <SelectItem value='2024'>2024</SelectItem>
                                    <SelectItem value='2025'>2025</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.leaveYear && <p className='mt-1 text-red-500 text-xs'>{errors.leaveYear.message}</p>}
                        </div>

                        <div>
                            <label htmlFor='leave-name-select' className='font-medium text-sm'>
                                Leave Name *
                            </label>
                            <Select value={watch('leaveName')} onValueChange={(value) => setValue('leaveName', value)}>
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
                            {errors.leaveName && <p className='mt-1 text-red-500 text-xs'>{errors.leaveName.message}</p>}
                        </div>

                        <div>
                            <label htmlFor='employee-name-input' className='font-medium text-sm'>
                                Employee Name
                            </label>
                            <InputText id='employee-name-input' {...register('employeeName')} placeholder='Enter employee name' />
                        </div>

                        <div>
                            <label htmlFor='leave-credit-input' className='font-medium text-sm'>
                                Leave Credit
                            </label>
                            <InputText
                                id='leave-credit-input'
                                {...register('leaveCredit', { valueAsNumber: true })}
                                placeholder='Enter leave credit'
                                type='number'
                                step='0.5'
                            />
                        </div>

                        <div>
                            <label htmlFor='leave-balance-input' className='font-medium text-sm'>
                                Leave Balance
                            </label>
                            <InputText
                                id='leave-balance-input'
                                {...register('leaveBalance', { valueAsNumber: true })}
                                placeholder='Enter leave balance'
                                type='number'
                                step='0.5'
                            />
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                            {editingCredit ? 'Update' : 'Save'}
                        </Button>
                        <Button type='button' variant='destructive' onClick={onCancel}>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value='Leave Addition' className='space-y-4'>
                <div className='py-8 text-center text-gray-500'>Leave Addition functionality will be implemented here</div>
            </TabsContent>

            <TabsContent value='Leave Deduction' className='space-y-4'>
                <div className='py-8 text-center text-gray-500'>Leave Deduction functionality will be implemented here</div>
            </TabsContent>

            <TabsContent value='Leave CarryForward' className='space-y-4'>
                <div className='py-8 text-center text-gray-500'>Leave CarryForward functionality will be implemented here</div>
            </TabsContent>
        </Tabs>
    );
}
