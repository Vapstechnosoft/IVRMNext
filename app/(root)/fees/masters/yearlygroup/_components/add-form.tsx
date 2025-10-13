'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CheckSquare, ChevronsUpDown, Save, Search, Square } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FeeGroup {
    fmgg_Id: number;
    fmgg_GroupName: string;
}

interface FormFields {
    academicYear: string;
    rebateApplicable: boolean;
    rebateType?: 'Percentage' | 'Amount';
    rebateValue?: number | '';
    feeGroupIds: number[];
}

export default function AddMasterGroupGrouping() {
    const [search, setSearch] = useState('');

    const academicYears = ['2024–2025', '2025–2026', '2026–2027'];
    const feeGroups: FeeGroup[] = [
        { fmgg_Id: 1, fmgg_GroupName: 'Tuition Fees' },
        { fmgg_Id: 2, fmgg_GroupName: 'Transport Fees' },
        { fmgg_Id: 3, fmgg_GroupName: 'Hostel Fees' }
    ];

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        mode: 'onChange',
        defaultValues: {
            academicYear: '',
            rebateApplicable: false,
            rebateType: undefined,
            rebateValue: '',
            feeGroupIds: []
        }
    });

    const rebateApplicable = watch('rebateApplicable');
    const rebateType = watch('rebateType');

    const onSubmit = (_data: FormFields) => {
        toast.success('Form submitted successfully!');
        reset();
    };

    const handleReset = () => reset();

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Academic Year + Fee Group Grid */}
                <div className='grid grid-cols-1 gap-6 border-b pb-4 sm:grid-cols-2'>
                    {/* Academic Year Dropdown */}
                    <Controller
                        name='academicYear'
                        control={control}
                        rules={{ required: 'Academic Year is required' }}
                        render={({ field }) => (
                            <div className='flex flex-col'>
                                <label className='mb-1 font-medium text-gray-700 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </label>
                                <select {...field} className='rounded-md border p-2 text-sm focus:ring-2 focus:ring-primary/30'>
                                    <option value=''>Select Academic Year</option>
                                    {academicYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Fee Group Multi-select Dropdown */}
                    <Controller
                        name='feeGroupIds'
                        control={control}
                        rules={{ required: 'Select at least one Fee Group' }}
                        render={({ field }) => (
                            <div className='flex flex-col'>
                                <label className='mb-1 font-medium text-gray-700 text-sm'>
                                    Fee Groups <span className='text-red-500'>*</span>
                                </label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            role='combobox'
                                            className='w-full justify-between border-primary/30'>
                                            {field.value?.length ? `${field.value.length} selected` : 'Select Fee Groups'}
                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className='w-[260px] p-2 sm:w-[300px]'>
                                        {/* Search Input */}
                                        <div className='relative mb-2'>
                                            <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                            <Input
                                                placeholder='search here...'
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className='h-8 pl-8 text-sm'
                                            />
                                        </div>

                                        {/* Fee Group List */}
                                        <div className='max-h-[260px] overflow-y-auto rounded-md border p-1'>
                                            <div
                                                onClick={() => {
                                                    const allIds = feeGroups.map((f) => f.fmgg_Id);
                                                    const allSelected = field.value?.length === allIds.length;
                                                    field.onChange(allSelected ? [] : allIds);
                                                }}
                                                className={cn(
                                                    'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm',
                                                    field.value?.length === feeGroups.length
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-200 hover:border-primary/40'
                                                )}>
                                                {field.value?.length === feeGroups.length ? (
                                                    <CheckSquare className='h-4 w-4 text-primary' />
                                                ) : (
                                                    <Square className='h-4 w-4 text-gray-400' />
                                                )}
                                                <span>Select All</span>
                                            </div>

                                            {feeGroups
                                                .filter((fg) => fg.fmgg_GroupName.toLowerCase().includes(search.toLowerCase().trim()))
                                                .map((fg) => {
                                                    const selected = field.value?.includes(fg.fmgg_Id);
                                                    return (
                                                        <div
                                                            key={fg.fmgg_Id}
                                                            onClick={() => {
                                                                field.onChange(
                                                                    selected
                                                                        ? field.value.filter((v) => v !== fg.fmgg_Id)
                                                                        : [...(field.value || []), fg.fmgg_Id]
                                                                );
                                                            }}
                                                            className={cn(
                                                                'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm',
                                                                selected
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-gray-200 hover:border-primary/40'
                                                            )}>
                                                            {selected ? (
                                                                <CheckSquare className='h-4 w-4 text-primary' />
                                                            ) : (
                                                                <Square className='h-4 w-4 text-gray-400' />
                                                            )}
                                                            <span>{fg.fmgg_GroupName}</span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                {/* Rebate Applicable */}
                <Controller
                    name='rebateApplicable'
                    control={control}
                    render={({ field }) => (
                        <div className='flex items-center gap-2 border-b pb-3'>
                            <input
                                id='rebateApplicable'
                                type='checkbox'
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className='h-4 w-4'
                            />
                            <label htmlFor='rebateApplicable' className='font-medium text-gray-700 text-sm'>
                                Rebate Applicable
                            </label>
                        </div>
                    )}
                />

                {/* Rebate Type + Value */}
                {rebateApplicable && (
                    <div className='grid grid-cols-1 gap-6 border-b pb-4 sm:grid-cols-2'>
                        {/* Rebate Type Dropdown */}
                        <Controller
                            name='rebateType'
                            control={control}
                            rules={{ required: 'Rebate Type is required' }}
                            render={({ field }) => (
                                <div className='flex flex-col'>
                                    <label className='mb-1 font-medium text-gray-700 text-sm'>
                                        Rebate Type <span className='text-red-500'>*</span>
                                    </label>
                                    <select {...field} className='rounded-md border p-2 text-sm focus:ring-2 focus:ring-primary/30'>
                                        <option value=''>Select Type</option>
                                        <option value='Percentage'>Percentage</option>
                                        <option value='Amount'>Amount</option>
                                    </select>
                                    {errors.rebateType && <FormError>{errors.rebateType.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Rebate Value */}
                        <Controller
                            name='rebateValue'
                            control={control}
                            rules={{
                                required: 'Rebate value is required',
                                validate: (v) => (v === '' || Number.isNaN(Number(v)) ? 'Enter a valid number' : true)
                            }}
                            render={({ field }) => (
                                <div className='flex flex-col'>
                                    <label className='mb-1 font-medium text-gray-700 text-sm'>
                                        {rebateType === 'Percentage' ? 'Percentage (%)' : 'Amount'} <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='number'
                                        {...field}
                                        placeholder={rebateType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
                                        className='rounded-md border p-2 text-sm focus:ring-2 focus:ring-primary/30'
                                    />
                                    {errors.rebateValue && <FormError>{errors.rebateValue.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>
                )}

                {/* Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isSubmitting} className='order-1 w-fit hover:scale-105 sm:order-2'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
