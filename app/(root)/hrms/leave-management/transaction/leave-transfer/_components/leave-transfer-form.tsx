'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

export interface LeaveTransferFormData {
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    leaveName: string;
}

interface LeaveTransferFormProps {
    activeTab: string;
    onSubmit: (data: LeaveTransferFormData) => void;
    onCancel: () => void;
    defaultValues?: Partial<LeaveTransferFormData>;
}

// Mock data - replace with actual API calls
const typeOptions = [
    { label: 'Testing group', value: 'Testing group' },
    { label: 'hr', value: 'hr' },
    { label: 'Hour', value: 'Hour' },
    { label: 'VAPS GROUP', value: 'VAPS GROUP' },
    { label: 'Test Extra', value: 'Test Extra' },
    { label: 'VB', value: 'VB' },
    { label: 'garden group', value: 'garden group' }
];

const departmentOptions = [
    { label: 'Teaching', value: 'Teaching' },
    { label: 'Non Teaching', value: 'Non Teaching' },
    { label: 'JUNIOR SCHOOL', value: 'JUNIOR SCHOOL' },
    { label: 'PRIMARY SCHOOL', value: 'PRIMARY SCHOOL' },
    { label: 'SENIOR SCHOOL', value: 'SENIOR SCHOOL' },
    { label: 'OFFICE STAFF', value: 'OFFICE STAFF' },
    { label: 'Service Staff', value: 'Service Staff' }
];

const designationOptions = [
    { label: 'Assistant Teacher', value: 'Assistant Teacher' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Vice Principal', value: 'Vice Principal' },
    { label: 'Office Assistant', value: 'Office Assistant' },
    { label: 'System Manager', value: 'System Manager' },
    { label: 'Teacher Helper', value: 'Teacher Helper' },
    { label: 'Electrician', value: 'Electrician' }
];

const leaveYearOptions = [
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' }
];

const leaveNameOptions = [
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Earned Leave (EL)/Privilege Leave (PL)', value: 'Earned Leave (EL)/Privilege Leave (PL)' },
    { label: 'Maternity leave', value: 'Maternity leave' },
    { label: 'Optional Leave', value: 'Optional Leave' },
    { label: 'Emergency Leave', value: 'Emergency Leave' }
];

export function LeaveTransferForm({ activeTab, onSubmit, onCancel, defaultValues }: LeaveTransferFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<LeaveTransferFormData>({
        defaultValues: defaultValues || {
            type: [],
            department: [],
            designation: [],
            leaveYear: '',
            leaveName: ''
        }
    });

    const onSubmitForm: SubmitHandler<LeaveTransferFormData> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Type:</Label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={typeOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Types'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Department:</Label>
                    <Controller
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={departmentOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Departments'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Designation:</Label>
                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={designationOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Designations'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Leave Year and Leave Name */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <Label htmlFor='leave-year-select' className='font-medium text-sm'>
                        Leave Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveYear'
                        control={control}
                        rules={{ required: 'Leave Year is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='leave-year-select' className={errors.leaveYear ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveYearOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveYear && <FormError>{errors.leaveYear.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='leave-name-select' className='font-medium text-sm'>
                        Leave Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveName'
                        control={control}
                        rules={{ required: 'Leave Name is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='leave-name-select' className={errors.leaveName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveNameOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button type='submit' variant='default' className='min-w-[120px]'>
                    <Save className='mr-2 h-4 w-4' />
                    SAVE
                </Button>
                <Button type='button' variant='outline' onClick={onCancel} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}

