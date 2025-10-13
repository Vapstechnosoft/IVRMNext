'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMasterFeeGroup } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { masterGroupsGroupingSchema } from '@/schemas/fees/masters';
import { addOrUpdateGroupGrouping } from '@/server/fees/masters/groupsgrouping';
import type { IMasterGroupsGrouping } from '@/types/fees/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, ChevronsUpDown, Save, Search, Square } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterGroupsGroupingSchema.addOrUpdate> &
    Partial<IMasterGroupsGrouping> & {
        imgg_GroupsCode?: string;
        imgg_FeeGroupIds?: number[];
    };

interface AddMasterGroupGroupingProps {
    onSuccess?: () => void;
    className?: string;
}

interface FeeGroup {
    fmgg_Id: number;
    fmgg_GroupName: string;
}

export default function AddMasterGroupGrouping({ onSuccess, className = '' }: AddMasterGroupGroupingProps) {
    const [search, setSearch] = useState('');

    const { data: feeGroups = [], isLoading } = useMasterFeeGroup() as {
        data: FeeGroup[] | undefined;
        isLoading: boolean;
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterGroupsGroupingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            imgg_GroupingName: '',
            imgg_GroupsCode: '',
            imgg_FeeGroupIds: [],
            imgg_ActiveFlag: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload: Partial<IMasterGroupsGrouping> = {
                imgg_GroupingName: data.imgg_GroupingName,
                imgg_Group_Code: data.imgg_GroupsCode,
                imgg_feeGroupIds: (data.imgg_FeeGroupIds ?? []).join(','),

                imgg_ActiveFlag: data.imgg_ActiveFlag ?? true
            };

            const response = await addOrUpdateGroupGrouping(payload);
            if (response.success) {
                toast.success(response.message);
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => reset();

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {/* Fee Group Name */}
                        <Controller
                            name='imgg_GroupingName'
                            control={control}
                            render={({ field }) => (
                                <InputText
                                    label='Fee Group Name'
                                    required
                                    id='imgg_GroupingName'
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.imgg_GroupingName?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        {/* Groups Code */}
                        <Controller
                            name='imgg_GroupsCode'
                            control={control}
                            render={({ field }) => (
                                <InputText
                                    label='Groups Code'
                                    required
                                    id='imgg_GroupsCode'
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.imgg_GroupsCode?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                    </div>

                    {/* Fee Group Multi-select Dropdown */}
                    <Controller
                        name='imgg_FeeGroupIds'
                        control={control}
                        render={({ field }) => (
                            <div className='flex w-full flex-col sm:w-1/2'>
                                <label className='mb-1 font-medium text-gray-700 text-sm'>
                                    Fee Groups <span className='text-red-500'>*</span>
                                </label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            role='combobox'
                                            disabled={isLoading}
                                            className='w-full justify-between border-primary/30'>
                                            {field.value?.length
                                                ? `${field.value.length} selected`
                                                : isLoading
                                                  ? 'Loading...'
                                                  : 'Select Fee Groups'}
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
                                        {/* Scrollable list with "Select All" option */}
                                        <div className='max-h-[260px] overflow-y-auto rounded-md border p-1'>
                                            {/* Select All option */}
                                            <div
                                                onClick={() => {
                                                    const allIds = (feeGroups ?? []).map((fg) => fg.fmgg_Id);
                                                    const isAllSelected = field.value?.length === allIds.length;
                                                    field.onChange(isAllSelected ? [] : allIds);
                                                }}
                                                className={cn(
                                                    'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                                    field.value?.length === (feeGroups?.length ?? 0)
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-200 hover:border-primary/40'
                                                )}>
                                                {field.value?.length === (feeGroups?.length ?? 0) ? (
                                                    <CheckSquare className='h-4 w-4 text-primary' />
                                                ) : (
                                                    <Square className='h-4 w-4 text-gray-400' />
                                                )}
                                                <span>Select All</span>
                                            </div>

                                            {/* Individual Fee Group checkboxes */}
                                            {(feeGroups ?? [])
                                                .filter((fg) => fg.fmgg_GroupName.toLowerCase().includes(search.toLowerCase().trim()))
                                                .map((fg) => {
                                                    const id = fg.fmgg_Id;
                                                    const name = fg.fmgg_GroupName;
                                                    const isSelected = field.value?.includes(id);
                                                    return (
                                                        <div
                                                            key={id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    field.onChange(field.value?.filter((v) => v !== id));
                                                                } else {
                                                                    field.onChange([...(field.value || []), id]);
                                                                }
                                                            }}
                                                            className={cn(
                                                                'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                                isSelected
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-gray-200 hover:border-primary/40'
                                                            )}>
                                                            {isSelected ? (
                                                                <CheckSquare className='h-4 w-4 text-primary' />
                                                            ) : (
                                                                <Square className='h-4 w-4 text-gray-400' />
                                                            )}
                                                            <span>{name}</span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {errors.imgg_FeeGroupIds && <FormError>{errors.imgg_FeeGroupIds.message}</FormError>}
                            </div>
                        )}
                    />

                    {errors.root && <FormError>{errors.root.message}</FormError>}

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
                            disabled={isSubmitting}
                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                            isLoading={isSubmitting}
                            loadingText='Saving...'>
                            <div className='flex items-center'>
                                <Save className='mr-2 h-4 w-4' />
                                Save Master Group Grouping
                            </div>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
