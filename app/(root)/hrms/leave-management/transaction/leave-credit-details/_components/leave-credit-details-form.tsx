'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { type LeaveCreditDetail, MONTHS } from './columns';

interface LeaveCreditDetailsFormProps {
    editingRow: LeaveCreditDetail | null;
    onSubmit: (data: LeaveCreditDetail) => void;
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

export function LeaveCreditDetailsForm({ editingRow, onSubmit, onCancel }: LeaveCreditDetailsFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCreditDetail>({
        defaultValues: editingRow || {
            type: [],
            department: [],
            designation: [],
            leaveName: '',
            leaveCode: '',
            months: MONTHS.reduce(
                (acc, m) => {
                    acc[m] = 0;
                    return acc;
                },
                {} as Record<string, number>
            )
        }
    });

    const handleFormSubmit: SubmitHandler<LeaveCreditDetail> = (data) => {
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
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
                <div className='space-y-4'>
                    <div>
                        <label htmlFor='type-checkboxes' className='font-medium text-sm'>
                            Type
                        </label>
                        <div id='type-checkboxes' className='max-h-40 overflow-y-auto rounded-md border p-2'>
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
                    <div>
                        <label htmlFor='department-checkboxes' className='font-medium text-sm'>
                            Department
                        </label>
                        <div id='department-checkboxes' className='max-h-40 overflow-y-auto rounded-md border p-2'>
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
                    <div>
                        <label htmlFor='designation-checkboxes' className='font-medium text-sm'>
                            Designation
                        </label>
                        <div id='designation-checkboxes' className='max-h-40 overflow-y-auto rounded-md border p-2'>
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
                </div>

                <div className='space-y-4'>
                    <div>
                        <label htmlFor='leave-name-select' className='font-medium text-sm'>
                            Leave Name *
                        </label>
                        <Select value={watch('leaveName')} onValueChange={(v) => setValue('leaveName', v)}>
                            <SelectTrigger id='leave-name-select' className={errors.leaveName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='Select Leave' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                <SelectItem value='Comp Off'>Comp Off</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.leaveName && <p className='mt-1 text-red-500 text-xs'>{errors.leaveName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor='leave-code-input' className='font-medium text-sm'>
                            Leave Code
                        </label>
                        <InputText id='leave-code-input' {...register('leaveCode')} placeholder='Enter leave code' />
                    </div>
                </div>

                <div className='space-y-2'>
                    <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                        {MONTHS.map((m) => (
                            <div key={m} className='flex items-center gap-2'>
                                <label htmlFor={`month-${m}`} className='w-24 text-sm'>
                                    {m}
                                </label>
                                <InputText
                                    id={`month-${m}`}
                                    type='number'
                                    step='0.5'
                                    value={watch('months')[m] ?? 0}
                                    onChange={(e) =>
                                        setValue('months', {
                                            ...watch('months'),
                                            [m]: Number.parseFloat(e.target.value || '0')
                                        })
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='flex gap-2'>
                <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                    {editingRow ? 'Update' : 'Save'}
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Clear
                </Button>
            </div>
        </form>
    );
}
