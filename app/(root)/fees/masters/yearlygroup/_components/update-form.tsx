'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FEES_QUERY_KEYS } from '@/constants/query-keys';
import { useAcademicYearDropdown, useMasterFeeYearlyGroup, useMasterGroupListDropDown } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { YearlyGroupSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterClassYearlyCategory } from '@/server/fees/masters/fees_yearly_group';
import type { IMaasterFeesYearlyGrouping } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquare, ChevronsUpDown, Save, Search, Square } from 'lucide-react';
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface FeeGroup {
    fmgg_Id: number;
    fmgg_GroupName: string;
}

interface Payload {
    mI_Id: number;
    fyG_Id: number;
    user_id: number;
    asmaY_Id: number;
    grouplist: number[];
    fyG_RebateTypeFlg: string;
    fyG_RebateApplicableFlg: boolean;
    fyG_PartialRebateAmtOrPercentageValue: number;
}

type FormFields = z.infer<typeof YearlyGroupSchema.addOrUpdate>;

interface UpdateYearlyGroupFormProps {
    onSuccess?: () => void;
    selectedRow: IMaasterFeesYearlyGrouping;
}

export default function UpdateYearlyGroupForm({ onSuccess, selectedRow }: UpdateYearlyGroupFormProps) {
    const [search, setSearch] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const _initRetryRef = useRef<{ tries: number; timerId: any }>({
        tries: 0,
        timerId: null
    });
    const { data: academicYearOptions, isLoading: isAcademicYearLoading } = useAcademicYearDropdown();
    const { data: groupData, isLoading: isGroupDataLoading } = useMasterGroupListDropDown();
    const { refetchAll } = useMasterFeeYearlyGroup();
    const queryClient = useQueryClient();

    const feeGroups: FeeGroup[] =
        groupData?.success && Array.isArray(groupData.data)
            ? groupData.data.map((group) => ({
                  fmgg_Id: group.fmG_Id,
                  fmgg_GroupName: String(group.fmG_GroupName)
              }))
            : [];

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
            rebateValue: 0
        }
    });

    const rebateApplicable = watch('rebateApplicable');
    const rebateType = watch('rebateType');
    const feeGroupIds = watch('feeGroupIds');

    useEffect(() => {
        if (!selectedRow) {
            console.warn('No selectedRow provided');
            return;
        }

        const academicYearId = selectedRow.asmaY_Id?.toString() ?? '';
        const academicYearValue = academicYearId;

        let validGroupIds: number[] = [];

        if (Array.isArray(selectedRow.grouplist) && selectedRow.grouplist.length > 0) {
            validGroupIds = selectedRow.grouplist
                .map((id) => (typeof id === 'string' ? Number(id) : id))
                .filter((id) => Number.isFinite(id) && feeGroups.some((fg) => fg.fmgg_Id === id));
        }

        if (
            validGroupIds.length === 0 &&
            typeof selectedRow.fmG_Id === 'number' &&
            feeGroups.some((fg) => fg.fmgg_Id === selectedRow.fmG_Id)
        ) {
            validGroupIds = [selectedRow.fmG_Id];
        }

        if (validGroupIds.length === 0 && selectedRow.fmG_GroupName) {
            const names = Array.isArray(selectedRow.fmG_GroupName) ? selectedRow.fmG_GroupName : [String(selectedRow.fmG_GroupName)];
            validGroupIds = feeGroups
                .filter((fg) => names.some((n) => String(n).trim() && String(n).toLowerCase() === String(fg.fmgg_GroupName).toLowerCase()))
                .map((fg) => fg.fmgg_Id);
        }

        const rawRebateType = selectedRow.fyG_RebateTypeFlg;
        const mappedRebateType = rawRebateType === 'Percentage' || rawRebateType === 'Amount' ? rawRebateType : undefined;

        const rawRebateValue = selectedRow.fyG_PartialRebateAmtOrPercentageValue;
        const parsedRebateValue = typeof rawRebateValue === 'string' ? Number(rawRebateValue) : rawRebateValue;
        const rebateValueNumber = Number.isFinite(parsedRebateValue) ? parsedRebateValue : 0;

        const formValues = {
            academicYear: academicYearValue,
            feeGroupIds: validGroupIds,
            rebateApplicable: selectedRow.fyG_RebateApplicableFlg || false,
            rebateType: mappedRebateType ?? undefined,
            rebateValue: rebateValueNumber
        } as any;

        setIsInitializing(true);
        reset(formValues, { keepValues: false });

        Promise.resolve().then(() => setTimeout(() => setIsInitializing(false), 50));
    }, [selectedRow, academicYearOptions?.data, groupData?.data, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            let selectedAcademicYear = academicYearOptions?.data?.find((year) => year && year.asmaY_Id.toString() === data.academicYear);

            if (!selectedAcademicYear && selectedRow?.asmaY_Id) {
                selectedAcademicYear = academicYearOptions?.data?.find((y) => String(y.asmaY_Id) === String(selectedRow.asmaY_Id));
            }

            if (!selectedAcademicYear) {
                toast.error('Please select a valid Academic Year');
                return;
            }

            const asmaY_Id = Number(selectedAcademicYear.asmaY_Id);
            if (Number.isNaN(asmaY_Id)) {
                toast.error('Invalid Academic Year value');
                return;
            }

            const miIdFromRow = selectedRow.mI_Id ?? (selectedRow as any).mI_ID ?? (selectedRow as any).mi_id ?? 30;

            const payload: Payload = {
                mI_Id: Number(miIdFromRow),
                fyG_Id: selectedRow.fyG_Id || 0,
                user_id: 21602,
                asmaY_Id,
                grouplist: (data.feeGroupIds || []).map((v) => Number(v)),
                fyG_RebateTypeFlg: data.rebateApplicable && data.rebateType ? data.rebateType : '',
                fyG_RebateApplicableFlg: data.rebateApplicable,
                fyG_PartialRebateAmtOrPercentageValue: data.rebateApplicable && data.rebateValue ? Number(data.rebateValue) : 0
            };

            const response = await addOrUpdateMasterClassYearlyCategory(payload);

            if (response.success) {
                toast.success(response.message || 'Master Yearly Group updated successfully!');
                try {
                    queryClient.invalidateQueries({
                        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === FEES_QUERY_KEYS.FEE_YEARLY_GROUPS
                    });
                    try {
                        refetchAll();
                    } catch (_e) {}
                } catch (e) {
                    console.warn('Failed to invalidate queries:', e);
                }
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

    const handleReset = () => {
        reset();
        setSearch('');
    };

    const selectedFeeGroupNames =
        feeGroups
            .filter((fg) => feeGroupIds?.includes(fg.fmgg_Id))
            .map((fg) => fg.fmgg_GroupName)
            .join(', ') || 'Select Fee Groups';

    if (isAcademicYearLoading || isGroupDataLoading) {
        return <div>Loading form data...</div>;
    }

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
                                    onValueChange={(value) => field.onChange(value)}
                                    value={field.value}
                                    disabled={isAcademicYearLoading}>
                                    <SelectTrigger
                                        id='academicYear'
                                        className={cn('transition-colors', errors.academicYear ? 'border-red-500' : '')}>
                                        <SelectValue placeholder='Select Academic Year'>
                                            {/* Prefer the selected form value; if missing (timing race),
                          fall back to the selectedRow's display year so the UI
                          shows the correct year even before form state settles. */}
                                            {(() => {
                                                const v = field.value;
                                                if (v) {
                                                    if (academicYearOptions?.data && Array.isArray(academicYearOptions.data)) {
                                                        return (
                                                            academicYearOptions.data.find((year) => year.asmaY_Id.toString() === v)
                                                                ?.asmaY_Year ??
                                                            selectedRow.asmaY_Year ??
                                                            v
                                                        );
                                                    }
                                                    return selectedRow.asmaY_Year ?? v;
                                                }
                                                return selectedRow?.asmaY_Year ?? 'Select Academic Year';
                                            })()}
                                        </SelectValue>
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
                        {!isInitializing && errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
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
                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                                            className={cn(
                                                'w-full justify-between transition-colors',
                                                errors.feeGroupIds ? 'border-red-500' : 'border-primary/30'
                                            )}
                                            disabled={isGroupDataLoading}>
                                            <span className='truncate'>{selectedFeeGroupNames}</span>
                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[260px] p-2 sm:w-[300px]'>
                                        {/* Search bar */}
                                        <div className='relative mb-2'>
                                            <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                            <InputText
                                                placeholder='Search groups...'
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className='h-8 border-gray-300 pl-8 text-sm focus:border-gray-400 focus:ring-0'
                                            />
                                        </div>

                                        {/* Fee Group list */}
                                        <div className='max-h-[260px] overflow-y-auto rounded-md border p-1'>
                                            {/* Select All */}
                                            <div
                                                onClick={() => {
                                                    const allIds = feeGroups.map((f) => f.fmgg_Id);
                                                    const allSelected = field.value?.length === allIds.length;
                                                    field.onChange(allSelected ? [] : allIds);
                                                }}
                                                className={cn(
                                                    'mb-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-medium text-sm',
                                                    field.value?.length === feeGroups.length
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-gray-200 hover:border-primary/40'
                                                )}>
                                                {field.value?.length === feeGroups.length ? (
                                                    <CheckSquare className='h-4 w-4 text-primary' />
                                                ) : (
                                                    <Square className='h-4 w-4 text-gray-400' />
                                                )}
                                                <span>Select All</span>
                                            </div>

                                            {/* Individual Fee Groups */}
                                            {feeGroups
                                                .filter((fg) => fg.fmgg_GroupName.toLowerCase().includes(search.toLowerCase().trim()))
                                                .map((fg) => {
                                                    const selected = field.value?.includes(fg.fmgg_Id) || false;
                                                    return (
                                                        <div
                                                            key={fg.fmgg_Id}
                                                            onClick={() => {
                                                                const newValue = selected
                                                                    ? field.value.filter((v) => v !== fg.fmgg_Id)
                                                                    : [...(field.value || []), fg.fmgg_Id];
                                                                field.onChange(newValue);
                                                                console.log('Updated feeGroupIds:', newValue);
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
                                    <Select
                                        onValueChange={(value: 'Percentage' | 'Amount') => field.onChange(value)}
                                        value={field.value ?? undefined}>
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
                                        type='text'
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                field.onChange(value === '' ? '' : value);
                                            }
                                        }}
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
                        disabled={isSubmitting || !academicYearOptions?.data || !groupData?.success}
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
