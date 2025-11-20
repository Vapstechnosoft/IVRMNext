'use client';

import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCreditDetails, useSaveLeaveCreditDetails } from '@/hooks/hrms/leave-management/useTransactions';

import { type LeaveCreditDetail, MONTHS } from './columns';

// Mapping of leave names to leave codes
const leaveNameToCodeMap: Record<string, string> = {
    'Casual Leave': 'CL',
    'Sick Leave': 'SL',
    'Privilege Leave': 'PL',
    'Comp Off': 'CO',
    'Optional Leave': 'OL',
    'Emergency Leave': 'EL'
};

interface AddLeaveCreditDetailsFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

const typeOptions = [
    { label: 'VKS', value: 'VKS' },
    { label: 'Permanent', value: 'Permanent' },
    { label: 'ELearning', value: 'ELearning' },
    { label: 'Robotic', value: 'Robotic' },
    { label: 'Internship', value: 'Internship' },
    { label: 'Management Admin', value: 'Management Admin' }
];
const departmentOptions = [
    { label: 'Hardware and Network', value: 'Hardware and Network' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Human Resource', value: 'Human Resource' },
    { label: 'Admin', value: 'Admin' },
    { label: 'LEGAL', value: 'LEGAL' },
    { label: 'IT Team', value: 'IT Team' }
];
const designationOptions = [
    { label: 'Computer Faculty', value: 'Computer Faculty' },
    { label: 'E-learning coordinator', value: 'E-learning coordinator' },
    { label: 'Accounts and Finance Executive', value: 'Accounts and Finance Executive' },
    { label: 'Client acquisition manager', value: 'Client acquisition manager' },
    { label: 'Sr HR Executive', value: 'Sr HR Executive' },
    { label: 'Manager HR', value: 'Manager HR' }
];

export default function AddLeaveCreditDetailsForm({ onSuccess, onCancel, className = '' }: AddLeaveCreditDetailsFormProps) {
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
            noOfDays: 0,
            leaveCarryForward: false,
            leaveEncashment: false,
            leaveCreditMonthWise: false,
            months: MONTHS.reduce(
                (acc, m) => {
                    acc[m] = 0;
                    return acc;
                },
                {} as Record<string, number>
            )
        }
    });

    // Auto-fill leave code when leave name changes
    const leaveName = watch('leaveName');
    useEffect(() => {
        if (leaveName && leaveNameToCodeMap[leaveName]) {
            setValue('leaveCode', leaveNameToCodeMap[leaveName]);
        } else if (!leaveName) {
            setValue('leaveCode', '');
        }
    }, [leaveName, setValue]);

    const onSubmit: SubmitHandler<LeaveCreditDetail> = async (data) => {
        saveDetails(data, {
            onSuccess: () => {
                reset();
                refetchAll();
                onSuccess?.();
            }
        });
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
                            <label htmlFor='type-multiselect' className='font-medium text-sm mb-2 block'>
                                Type
                            </label>
                            <Controller
                                name='type'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id='type-multiselect'
                                        options={typeOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || []}
                                        placeholder='Select Type'
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor='department-multiselect' className='font-medium text-sm mb-2 block'>
                                Department
                            </label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id='department-multiselect'
                                        options={departmentOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || []}
                                        placeholder='Select Department'
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor='designation-multiselect' className='font-medium text-sm mb-2 block'>
                                Designation
                            </label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id='designation-multiselect'
                                        options={designationOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || []}
                                        placeholder='Select Designation'
                                    />
                                )}
                            />
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
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                            <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                            <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                            <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                            <SelectItem value='Optional Leave'>Optional Leave</SelectItem>
                                            <SelectItem value='Emergency Leave'>Emergency Leave</SelectItem>
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
                            placeholder='Leave code'
                            readOnly
                        />
                        <Controller
                            name='noOfDays'
                            control={control}
                            rules={{ required: 'No of Days is required' }}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='no-of-days-input' className='font-medium text-sm'>
                                        No of Days <span className='text-red-500'>*</span>
                                    </label>
                                    <Input
                                        id='no-of-days-input'
                                        type='number'
                                        step='0.5'
                                        value={field.value ?? 0}
                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value || '0'))}
                                        className={errors.noOfDays ? 'border-red-500' : ''}
                                    />
                                    {errors.noOfDays && <FormError>{errors.noOfDays.message}</FormError>}
                                </div>
                            )}
                        />
                        <div className='space-y-3 rounded-md border p-4'>
                            <div className='font-medium text-sm mb-2'>Options</div>
                            <div className='space-y-2'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='leaveCarryForward'
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id='leave-carry-forward'
                                                checked={field.value || false}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <label htmlFor='leave-carry-forward' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                        Leave Carry Forward
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='leaveEncashment'
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id='leave-encashment'
                                                checked={field.value || false}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <label htmlFor='leave-encashment' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                        Leave Encashment
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        name='leaveCreditMonthWise'
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id='leave-credit-monthwise'
                                                checked={field.value || false}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <label htmlFor='leave-credit-monthwise' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                        Leave Credit MonthWise
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Credits - Dynamically rendered when Leave Credit MonthWise is checked */}
                    {watch('leaveCreditMonthWise') && (
                        <div className='space-y-3'>
                            <div className='font-medium text-sm mb-3'>Monthly Credits</div>
                            <div className='grid grid-cols-3 gap-4 md:grid-cols-4'>
                                {MONTHS.map((m) => (
                                    <div key={m} className='flex flex-col gap-1.5'>
                                        <label htmlFor={`month-${m}`} className='text-xs font-medium text-muted-foreground'>
                                            {m}
                                        </label>
                                        <Input
                                            id={`month-${m}`}
                                            type='number'
                                            step='0.5'
                                            value={watch('months')?.[m] ?? 0}
                                            onChange={(e) =>
                                                setValue('months', {
                                                    ...watch('months'),
                                                    [m]: Number.parseFloat(e.target.value || '0')
                                                })
                                            }
                                            className='w-full'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className='flex justify-end gap-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
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
