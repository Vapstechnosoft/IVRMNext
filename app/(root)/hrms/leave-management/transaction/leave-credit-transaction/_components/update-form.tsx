'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCreditTransaction, useUpdateLeaveCreditTransaction } from '@/hooks/hrms/leave-management/useTransactions';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

interface UpdateLeaveCreditTransactionFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveCreditTransaction;
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

export default function UpdateLeaveCreditTransactionForm({
    onSuccess,
    className = '',
    selectedRow: row
}: UpdateLeaveCreditTransactionFormProps) {
    const { refetchAll } = useLeaveCreditTransaction();
    const { mutate: updateTransaction, isPending } = useUpdateLeaveCreditTransaction();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCreditTransaction>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                type: row.type || [],
                department: row.department || [],
                designation: row.designation || [],
                leaveYear: row.leaveYear || '2025',
                fromDate: row.fromDate || '',
                toDate: row.toDate || '',
                employee: row.employee || '',
                lossOfPay: row.lossOfPay ?? false,
                leaveName: row.leaveName || 'CL',
                availed: row.availed || 0
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<LeaveCreditTransaction> = async (data) => {
        updateTransaction(
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

    const toggleMulti = (field: 'type' | 'department' | 'designation', value: string, checked: boolean) => {
        const current = watch(field);
        if (checked) setValue(field, [...current, value]);
        else
            setValue(
                field,
                current.filter((v: string) => v !== value)
            );
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
                        <Controller
                            name='leaveYear'
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leave-year-select' className='font-medium text-sm'>
                                        Leave Year
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                            )}
                        />
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                            <InputText
                                label='From Date'
                                id='from-date-input'
                                type='date'
                                {...register('fromDate')}
                                error={errors.fromDate?.message}
                            />
                            <InputText
                                label='To Date'
                                id='to-date-input'
                                type='date'
                                {...register('toDate')}
                                error={errors.toDate?.message}
                            />
                        </div>
                        <Controller
                            name='employee'
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='employee-select' className='font-medium text-sm'>
                                        Employee
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                            )}
                        />
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='lossOfPay'
                                control={control}
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <span className='text-sm'>Loss of Pay</span>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <Controller
                        name='leaveName'
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='leave-name-select' className='font-medium text-sm'>
                                    Leave Name
                                </label>
                                <Select value={field.value} onValueChange={field.onChange}>
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
                        )}
                    />
                    <InputText
                        label='Availed'
                        id='availed-input'
                        type='number'
                        step='0.5'
                        {...register('availed', { valueAsNumber: true })}
                        error={errors.availed?.message}
                    />
                </div>

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
