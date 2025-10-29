'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, ChevronsUpDown, Save, Square } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useAcademicYearDropdown, useMasterFeeYearlyGroup } from '@/hooks/fees/useMasters';
import { YearlyGroupSchema } from '@/schemas/fees/masters';
import { addOrUpdateYearlyGrouping } from '@/server/fees/masters/fees_yearly_group';
import type { IMaasterFeesYearlyGrouping } from '@/types/fees/masters/masters';

type FormFields = z.infer<typeof YearlyGroupSchema.addOrUpdate>;

interface UpdateYearlyGroupFormProps {
    onSuccess?: () => void;
    selectedRow: IMaasterFeesYearlyGrouping;
}

export default function UpdateYearlyGroupForm({ onSuccess }: UpdateYearlyGroupFormProps) {
    const { refetchAll } = useMasterFeeYearlyGroup();
    const { data: academicYearOptions } = useAcademicYearDropdown();

    // Mock fee groups (replace with actual data source if available)
    const feeGroups = [
        { fmG_Id: 1, fmG_GroupName: 'Tuition Fees' },
        { fmG_Id: 2, fmG_GroupName: 'Transport Fees' },
        { fmG_Id: 3, fmG_GroupName: 'Hostel Fees' }
    ];

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(YearlyGroupSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            academicYear: '',
            feeGroupIds: [],
            rebateApplicable: false,
            rebateType: undefined,
            rebateValue: ''
        }
    });

    const rebateApplicable = watch('rebateApplicable');
    const rebateType = watch('rebateType');

    const onSubmit = async (data: FormFields) => {
        try {
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

            const payload = {
                academiYear: {
                    asmaY_Id: Number(data.academicYear),
                    asmaY_Year
                },
                group: feeGroups
                    .filter((fg) => data.feeGroupIds.includes(fg.fmG_Id))
                    .map((fg) => ({
                        fmG_Id: fg.fmG_Id,
                        fmG_GroupName: fg.fmG_GroupName
                    })),
                rebate: data.rebateApplicable
                    ? [
                          {
                              fyG_RebateTypeFlg: data.rebateApplicable,
                              fyG_RebateType: data.rebateType || 'Percentage',
                              fyG_RebateValue: data.rebateValue ? data.rebateValue.toString() : ''
                          }
                      ]
                    : []
            };

            const response = await addOrUpdateYearlyGrouping(payload);

            if (response.success) {
                toast.success('Master Yearly Group updated successfully!');
                refetchAll();
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update yearly group');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => reset();

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    {/* Academic Year Dropdown */}
                    <div className='flex flex-col'>
                        <Label htmlFor='academicYear'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='academicYear'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => field.onChange(value)} // Ensure string
                                    value={field.value}>
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
                            )}
                        />
                        {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                    </div>

                    {/* Fee Group Multi-select Dropdown */}
                    <div className='flex flex-col'>
                        <Label>
                            Fee Groups <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='feeGroupIds'
                            control={control}
                            render={({ field }) => (
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
                                        <div className='max-h-[260px] overflow-y-auto rounded-md border p-1'>
                                            {feeGroups.map((fg) => {
                                                const selected = field.value?.includes(fg.fmG_Id);
                                                return (
                                                    <div
                                                        key={fg.fmG_Id}
                                                        onClick={() => {
                                                            field.onChange(
                                                                selected
                                                                    ? field.value.filter((v) => v !== fg.fmG_Id)
                                                                    : [...(field.value || []), fg.fmG_Id] // Ensure number
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
                                                        <span>{fg.fmG_GroupName}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                    </div>
                </div>

                {/* Rebate Applicable Checkbox */}
                <div className='flex items-center gap-2 border-b pb-3'>
                    <Controller
                        name='rebateApplicable'
                        control={control}
                        render={({ field }) => (
                            <>
                                <input
                                    id='rebateApplicable'
                                    type='checkbox'
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className='h-4 w-4 accent-primary'
                                />
                                <Label htmlFor='rebateApplicable' className='cursor-pointer'>
                                    Rebate Applicable
                                </Label>
                            </>
                        )}
                    />
                </div>

                {/* Rebate Type and Value */}
                {rebateApplicable && (
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                        {/* Rebate Type Dropdown */}
                        <div className='flex flex-col'>
                            <Label htmlFor='rebateType'>
                                Rebate Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='rebateType'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(value: 'Percentage' | 'Amount') => field.onChange(value)} value={field.value}>
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
                                )}
                            />
                            {errors.rebateType && <FormError>{errors.rebateType.message}</FormError>}
                        </div>

                        {/* Rebate Value */}
                        <div className='flex flex-col'>
                            <Label htmlFor='rebateValue'>
                                {rebateType === 'Percentage' ? 'Percentage (%)' : 'Amount'} <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='rebateValue'
                                control={control}
                                render={({ field }) => (
                                    <InputText
                                        id='rebateValue'
                                        type='number'
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder={rebateType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
                                        className={cn('transition-colors', errors.rebateValue ? 'border-red-500' : '')}
                                    />
                                )}
                            />
                            {errors.rebateValue && <FormError>{errors.rebateValue.message}</FormError>}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                        disabled={isSubmitting}>
                        Reset
                    </Button>

                    <Button
                        type='submit'
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        disabled={isSubmitting || !academicYearOptions?.data}
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Master Yearly Group
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
