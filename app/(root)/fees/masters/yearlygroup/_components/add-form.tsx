'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { YearlyGroupSchema } from '@/schemas/fees/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, ChevronsUpDown, Save, Search, Square } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// Define interfaces
interface FeeGroup {
    fmgg_Id: number;
    fmgg_GroupName: string;
}

interface Payload {
    academiYear: {
        asmaY_Id: number;
        asmaY_Year: number;
    };
    group: {
        fmG_GroupName: string;
        fmG_Id: number;
    }[];
    rebate: {
        fyG_RebateTypeFlg: boolean;
        fyG_RebateType: string;
        fyG_RebateValue: string;
    }[];
}

type FormFields = z.infer<typeof YearlyGroupSchema.addOrUpdate>;
interface AddMasterYearlyGroupProps {
    onSuccess: () => void;
}
export default function AddMasterYearlyGroup() {
    const [search, setSearch] = useState('');
    const { data: academicYearOptions } = useAcademicYearDropdown();

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
        resolver: zodResolver(YearlyGroupSchema.addOrUpdate),
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

    const onSubmit = (data: FormFields) => {
        const selectedAcademicYear = academicYearOptions?.data?.find((year) => year && year.asmaY_Id.toString() === data.academicYear);

        if (!selectedAcademicYear) {
            toast.error('Please select a valid Academic Year');
            return;
        }

        const asmaY_Year = Number(selectedAcademicYear.asmaY_Year);
        if (Number.isNaN(asmaY_Year)) {
            toast.error('Invalid Academic Year value');
            return;
        }

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
                        render={({ field }) => (
                            <div className='flex flex-col'>
                                <label htmlFor='academicYear' className='mb-1 font-medium text-gray-700 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        id='academicYear'
                                        className={cn('transition-colors', errors.academicYear ? 'border-red-500' : '')}>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearOptions?.data && Array.isArray(academicYearOptions.data) ? (
                                            academicYearOptions.data.map((year) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='px-2 py-1 text-gray-500 text-sm'>No academic years available</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Fee Group Multi-select Dropdown */}
                    <Controller
                        name='feeGroupIds'
                        control={control}
                        render={({ field }) => (
                            <div className='flex flex-col'>
                                Fee Groups <span className='text-red-500'>*</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-between transition-colors',
                                                errors.feeGroupIds ? 'border-red-500' : 'border-primary/30'
                                            )}>
                                            {field.value?.length ? `${field.value.length} selected` : 'Select Fee Groups'}
                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[260px] p-2 sm:w-[300px]'>
                                        <div className='relative mb-2'>
                                            <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                            <Input
                                                placeholder='search here...'
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className='h-8 pl-8 text-sm'
                                            />
                                        </div>
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

                {/* Rebate Applicable Checkbox */}
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
                                className='h-4 w-4 accent-primary'
                            />
                            <label htmlFor='rebateApplicable' className='cursor-pointer font-medium text-gray-700 text-sm'>
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
                            render={({ field }) => (
                                <div className='flex flex-col'>
                                    <label htmlFor='rebateType' className='mb-1 font-medium text-gray-700 text-sm'>
                                        Rebate Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='rebateType'
                                            className={cn('transition-colors', errors.rebateType ? 'border-red-500' : '')}>
                                            <SelectValue placeholder='Select Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Percentage'>Percentage</SelectItem>
                                            <SelectItem value='Amount'>Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.rebateType && <FormError>{errors.rebateType.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Rebate Value */}
                        <Controller
                            name='rebateValue'
                            control={control}
                            render={({ field }) => (
                                <div className='flex flex-col'>
                                    <label htmlFor='rebateValue' className='mb-1 font-medium text-gray-700 text-sm'>
                                        {rebateType === 'Percentage' ? 'Percentage (%)' : 'Amount'} <span className='text-red-500'>*</span>
                                    </label>
                                    <Input
                                        id='rebateValue'
                                        type='number'
                                        {...field}
                                        placeholder={rebateType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
                                        className={cn('transition-colors', errors.rebateValue ? 'border-red-500' : '')}
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
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || !academicYearOptions?.data}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
