'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

interface LeaveCreditTransactionFormProps {
    editingRow: LeaveCreditTransaction | null;
    onSubmit: (data: LeaveCreditTransaction) => void;
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
const employeeOptions = ['Steffi Halian', 'Shruthi NA', 'Bindhushree N', 'Chaithra NS', 'Balu Prabhakar'];
const leaveNames = ['CL', 'SL', 'PL', 'LWP', 'OD'];

export function LeaveCreditTransactionForm({ editingRow, onSubmit, onCancel }: LeaveCreditTransactionFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch
    } = useForm<LeaveCreditTransaction>({
        defaultValues: editingRow || {
            type: [],
            department: [],
            designation: [],
            leaveYear: '2025',
            fromDate: '',
            toDate: '',
            employee: '',
            lossOfPay: false,
            leaveName: 'CL',
            availed: 0
        }
    });

    const handleFormSubmit: SubmitHandler<LeaveCreditTransaction> = (data) => {
        onSubmit(data);
    };

    const toggleMulti = (field: 'type' | 'department' | 'designation', value: string, checked: boolean) => {
        const current = watch(field);
        if (checked) setValue(field, [...current, value]);
        else
            setValue(
                field,
                current.filter((v: string) => v !== value)
            );
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
                <div className='space-y-2'>
                    <label htmlFor='type-checkboxes' className='font-medium text-sm'>
                        Type
                    </label>
                    <div id='type-checkboxes' className='max-h-44 overflow-y-auto rounded-md border p-2'>
                        {typeOptions.map((t) => (
                            <div key={t} className='flex items-center gap-2 text-sm'>
                                <Checkbox
                                    id={`type-${t}`}
                                    checked={watch('type').includes(t)}
                                    onCheckedChange={(c) => toggleMulti('type', t, c as boolean)}
                                />
                                <Label htmlFor={`type-${t}`}>{t}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='space-y-2'>
                    <label htmlFor='department-checkboxes' className='font-medium text-sm'>
                        Department
                    </label>
                    <div id='department-checkboxes' className='max-h-44 overflow-y-auto rounded-md border p-2'>
                        {departmentOptions.map((t) => (
                            <div key={t} className='flex items-center gap-2 text-sm'>
                                <Checkbox
                                    id={`dept-${t}`}
                                    checked={watch('department').includes(t)}
                                    onCheckedChange={(c) => toggleMulti('department', t, c as boolean)}
                                />
                                <Label htmlFor={`dept-${t}`}>{t}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='space-y-2'>
                    <label htmlFor='designation-checkboxes' className='font-medium text-sm'>
                        Designation
                    </label>
                    <div id='designation-checkboxes' className='max-h-44 overflow-y-auto rounded-md border p-2'>
                        {designationOptions.map((t) => (
                            <div key={t} className='flex items-center gap-2 text-sm'>
                                <Checkbox
                                    id={`desig-${t}`}
                                    checked={watch('designation').includes(t)}
                                    onCheckedChange={(c) => toggleMulti('designation', t, c as boolean)}
                                />
                                <Label htmlFor={`desig-${t}`}>{t}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='space-y-4'>
                    <div>
                        <label htmlFor='leave-year-select' className='font-medium text-sm'>
                            Leave Year
                        </label>
                        <Select value={watch('leaveYear')} onValueChange={(v) => setValue('leaveYear', v)}>
                            <SelectTrigger id='leave-year-select'>
                                <SelectValue placeholder='Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                        <div>
                            <label htmlFor='from-date-input' className='font-medium text-sm'>
                                From Date
                            </label>
                            <InputText id='from-date-input' type='date' {...register('fromDate')} />
                        </div>
                        <div>
                            <label htmlFor='to-date-input' className='font-medium text-sm'>
                                To Date
                            </label>
                            <InputText id='to-date-input' type='date' {...register('toDate')} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor='employee-select' className='font-medium text-sm'>
                            Employee
                        </label>
                        <Select value={watch('employee')} onValueChange={(v) => setValue('employee', v)}>
                            <SelectTrigger id='employee-select'>
                                <SelectValue placeholder='Select employee' />
                            </SelectTrigger>
                            <SelectContent>
                                {employeeOptions.map((e) => (
                                    <SelectItem key={e} value={e}>
                                        {e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Checkbox
                            checked={watch('lossOfPay')}
                            onCheckedChange={(c) => setValue('lossOfPay', c as boolean)}
                        />
                        <span className='text-sm'>Loss of Pay</span>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div>
                    <label htmlFor='leave-name-select' className='font-medium text-sm'>
                        Leave Name
                    </label>
                    <Select value={watch('leaveName')} onValueChange={(v) => setValue('leaveName', v)}>
                        <SelectTrigger id='leave-name-select'>
                            <SelectValue placeholder='Leave' />
                        </SelectTrigger>
                        <SelectContent>
                            {leaveNames.map((n) => (
                                <SelectItem key={n} value={n}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label htmlFor='availed-input' className='font-medium text-sm'>
                        Availed
                    </label>
                    <InputText
                        id='availed-input'
                        type='number'
                        step='0.5'
                        {...register('availed', { valueAsNumber: true })}
                    />
                </div>
            </div>

            <div className='flex gap-2'>
                <Button type='submit'>{editingRow ? 'Update' : 'Save'}</Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
