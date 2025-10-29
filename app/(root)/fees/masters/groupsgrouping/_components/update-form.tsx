'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMasterFeeGroup, useMasterFeeGroupGrouping } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { masterGroupsGroupingSchema } from '@/schemas/fees/masters';
import { addOrUpdateGroupGrouping } from '@/server/fees/masters/groupsgrouping';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface IMasterFeeGroup {
    id: number;
    name: string;
}

interface ApiResponse<T> {
    data?: T;
}

type FormFields = z.infer<typeof masterGroupsGroupingSchema.addOrUpdate> & {
    imgg_feeGroupIds: (string | number)[];
};

interface UpdateMasterFeeGroupGroupingFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterGroupsGrouping;
    className?: string;
}

export default function UpdateMasterFeeGroupGroupingForm({
    onSuccess,
    selectedRow: row,
    className = ''
}: UpdateMasterFeeGroupGroupingFormProps) {
    const { data: feeGroups } = useMasterFeeGroup() as ApiResponse<IMasterFeeGroup[]>;
    const { refetchAll } = useMasterFeeGroupGrouping();

    const {
        control,
        handleSubmit,
        reset,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterGroupsGroupingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            imgg_Id: 0,
            imgg_GroupingName: '',
            imgg_Code: '',
            imgg_feeGroupIds: [],
            imgg_ActiveFlag: true
        }
    });

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (row) {
            reset({
                imgg_Id: row.imgg_Id,
                imgg_GroupingName: row.imgg_GroupingName,
                imgg_Code: row.imgg_Group_Code,
                imgg_feeGroupIds: Array.isArray(row.imgg_feeGroupIds)
                    ? row.imgg_feeGroupIds.map(String)
                    : row.imgg_feeGroupIds
                      ? [String(row.imgg_feeGroupIds)]
                      : [],
                imgg_ActiveFlag: row.imgg_ActiveFlag
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const selectedFeeGroupNames =
                feeGroups
                    ?.filter((g) => data.imgg_feeGroupIds.includes(String(g.id)))
                    .map((g) => g.name)
                    .join(', ') || '';

            const payload: Partial<IMasterGroupsGrouping> = {
                imgg_Id: data.imgg_Id,
                imgg_GroupingName: data.imgg_GroupingName,
                imgg_Group_Code: data.imgg_Code,
                imgg_feeGroupIds: data.imgg_feeGroupIds.map(Number).join(','),
                immgg_feeGroupNames: selectedFeeGroupNames,
                imgg_ActiveFlag: data.imgg_ActiveFlag ?? row.imgg_ActiveFlag ?? true
            };

            const response = await addOrUpdateGroupGrouping(payload);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update fee group grouping');
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        }
    };

    const handleReset = () => reset();

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <input type='hidden' {...register('imgg_GroupingName')} />

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <Controller
                            name='imgg_Code'
                            control={control}
                            render={({ field }) => (
                                <InputText
                                    label='Grouping Code'
                                    required
                                    id='imgg_Code'
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={errors.imgg_Code?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        <Controller
                            name='imgg_feeGroupIds'
                            control={control}
                            render={({ field }) => (
                                <div className='group flex w-full flex-col gap-1.5 md:w-[50%]'>
                                    Fee Groups <span className='text-red-500'>*</span>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' type='button' className='w-full justify-between border-gray-300'>
                                                {field.value.length > 0 ? `${field.value.length} selected` : 'Select Fee Groups'}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className='w-[250px] border border-gray-300 p-2'>
                                            <ScrollArea className='h-48'>
                                                {feeGroups?.slice(0, 5).map((group) => {
                                                    const selected = field.value.includes(String(group.id));
                                                    return (
                                                        <div
                                                            key={group.id}
                                                            onClick={() => {
                                                                const newValue = selected
                                                                    ? field.value.filter((id) => id !== String(group.id))
                                                                    : [...field.value, String(group.id)];
                                                                field.onChange(newValue);
                                                            }}
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100',
                                                                selected && 'bg-blue-50'
                                                            )}>
                                                            <div
                                                                className={cn(
                                                                    'flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400',
                                                                    selected && 'border-blue-500 bg-blue-500 text-white'
                                                                )}>
                                                                {selected && <Check className='h-3 w-3' />}
                                                            </div>
                                                            <span className='text-sm'>{group.name}</span>
                                                        </div>
                                                    );
                                                })}

                                                {feeGroups && feeGroups.length > 5 && (
                                                    <>
                                                        <div className='my-1 border-t' />
                                                        {feeGroups.slice(5).map((group) => {
                                                            const selected = field.value.includes(String(group.id));
                                                            return (
                                                                <div
                                                                    key={group.id}
                                                                    onClick={() => {
                                                                        const newValue = selected
                                                                            ? field.value.filter((id) => id !== String(group.id))
                                                                            : [...field.value, String(group.id)];
                                                                        field.onChange(newValue);
                                                                    }}
                                                                    className={cn(
                                                                        'flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100',
                                                                        selected && 'bg-blue-50'
                                                                    )}>
                                                                    <div
                                                                        className={cn(
                                                                            'flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400',
                                                                            selected && 'border-blue-500 bg-blue-500 text-white'
                                                                        )}>
                                                                        {selected && <Check className='h-3 w-3' />}
                                                                    </div>
                                                                    <span className='text-sm'>{group.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.imgg_feeGroupIds && <FormError>{errors.imgg_feeGroupIds.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

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
                            Update Fee Group Grouping
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
