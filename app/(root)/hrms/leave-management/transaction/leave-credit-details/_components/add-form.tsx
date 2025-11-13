'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCreditDetails, useSaveLeaveCreditDetails } from '@/hooks/hrms/leave-management/useTransactions';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { type LeaveCreditDetail, MONTHS } from './columns';

interface AddLeaveCreditDetailsFormProps {
    onSuccess?: () => void;
    className?: string;
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

export default function AddLeaveCreditDetailsForm({ onSuccess, className = '' }: AddLeaveCreditDetailsFormProps) {
    const { refetchAll } = useLeaveCreditDetails();
    const { mutate: saveDetails, isPending } = useSaveLeaveCreditDetails();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCreditDetail>({
        mode: 'onChange',
        defaultValues: {
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

    const onSubmit: SubmitHandler<LeaveCreditDetail> = async (data) => {
        saveDetails(data, {
            onSuccess: () => {
                reset();
                refetchAll();
                onSuccess?.();
            }
        });
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
                        <Controller
                            name='leaveName'
                            control={control}
                            rules={{ required: 'Leave name is required' }}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leave-name-select' className='font-medium text-sm'>
                                        Leave Name <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                                </div>
                            )}
                        />
                        <InputText
                            label='Leave Code'
                            id='leave-code-input'
                            {...register('leaveCode')}
                            error={errors.leaveCode?.message}
                            placeholder='Enter leave code'
                        />
                    </div>

                    <div className='space-y-2'>
                        <div className='font-medium text-sm'>Monthly Credits</div>
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

                <div className='flex justify-end gap-2'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
