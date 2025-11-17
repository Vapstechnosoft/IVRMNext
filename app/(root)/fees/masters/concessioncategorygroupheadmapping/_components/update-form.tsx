'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import {
    CONCESSION_CATEGORYG_DROPDOWN_DATA,
    CONCESSION_CATEGORYG_GROUP_DROPDOWN_DATA,
    CONCESSION_CATEGORYG_HEADS_DROPDOWN_DATA,
    useConcessionCategoryGroupHeadmappingdata
} from '@/hooks/fees/useMasters';

import { MultiSelect } from '@/components/ui/multi-select';
import { masterConcessionCategorygroupHeadMappingSchema } from '@/schemas/fees/masters';
import { addOrUpdateConcessionCategoryGroupHeadMapping } from '@/server/fees/masters/concession_category_head_group_mapping';
import type { IConcessionCategoryGroupHeadMappingList } from '@/types/fees/masters/masters';

type FormFields = z.infer<typeof masterConcessionCategorygroupHeadMappingSchema.addOrUpdate>;

interface UpdateConcessionCategoryGroupHeadFormProps {
    onSuccess?: () => void;
    termname?: string;
    selectedRow: IConcessionCategoryGroupHeadMappingList;
}

export default function UpdateConcessionCategoryGroupHeadForm({
    onSuccess,
    termname = '',
    selectedRow: row
}: UpdateConcessionCategoryGroupHeadFormProps) {
    const { refetchAll } = useConcessionCategoryGroupHeadmappingdata();

    // Track selected group ID dynamically
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(row?.fmG_Id ?? null);

    // For selected heads in multiselect
    const [selectedHeadsItems, setSelectedHeadsItems] = useState<{ fmH_Id: string }[]>([]);

    // Dropdown data
    const { data: category, isLoading: categoryLoading } = CONCESSION_CATEGORYG_DROPDOWN_DATA();
    const { data: group, isLoading: groupLoading } = CONCESSION_CATEGORYG_GROUP_DROPDOWN_DATA();
    const { data: heads, isLoading: headsLoading } = CONCESSION_CATEGORYG_HEADS_DROPDOWN_DATA(Number(selectedGroupId));

    // Form setup
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterConcessionCategorygroupHeadMappingSchema.addOrUpdate),
        mode: 'onChange'
    });

    // Pre-fill form for edit mode
    useEffect(() => {
        if (row && category?.data && group?.data) {
            const preselectedHeads = Array.isArray(row.fmH_Id)
                ? row.fmH_Id.map((id) => ({ fmH_Id: id.toString() }))
                : row.fmH_Id
                  ? [{ fmH_Id: row.fmH_Id.toString() }]
                  : [];

            setSelectedHeadsItems(preselectedHeads);
            setSelectedGroupId(row.fmG_Id);

            reset({
                fmcC_Id: row.fmcC_Id,
                FMG_Id: row.fmG_Id,
                fmH_Ids: preselectedHeads.map((h) => h.fmH_Id)
            });
        }
    }, [row, category?.data, group?.data, reset]);

    // When heads list updates, ensure the selected values persist
    useEffect(() => {
        if (heads?.data?.length && selectedHeadsItems.length > 0) {
            setValue('fmH_Ids', selectedHeadsItems.map((h) => h.fmH_Id) as [string, ...string[]]);
        }
    }, [heads?.data, selectedHeadsItems, setValue]);

    function OnReset() {
        reset();
        refetchAll();

        setSelectedGroupId(null);
        setSelectedHeadsItems([]);
    }

    // Handle submit
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                mI_Id: 30,
                fmccD_CreatedBy: 21602,
                fmaccG_Id: row.fmaccG_Id
            };
            const response = await addOrUpdateConcessionCategoryGroupHeadMapping(payload);

            if (response.success) {
                toast.success(response.message);
                onSuccess?.();
                refetchAll();
            } else {
                toast.error(response.message);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Handle multi-select changes
    const handleHeadSelection = (selectedValues: string[]) => {
        setSelectedHeadsItems(
            selectedValues.map((value) => ({
                fmH_Id: value.toString()
            }))
        );
    };

    return (
        <div className={`${termname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Category Dropdown */}
                <div className='flex items-center justify-center gap-3'>
                    <Label htmlFor='fmcC_Id'>
                        Category<span className='text-red-500'>*</span>:
                    </Label>
                    <div className='w-64'>
                        <Controller
                            name='fmcC_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Category' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Category...
                                            </SelectItem>
                                        ) : (
                                            category?.data?.map((item) => (
                                                <SelectItem key={item.fmcC_Id} value={item.fmcC_Id.toString()}>
                                                    {item.fmcC_ConcessionName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmcC_Id && <FormError>{errors.fmcC_Id.message}</FormError>}
                    </div>
                </div>

                {/* Group Dropdown */}
                <div className='flex items-center justify-center gap-3'>
                    <Label htmlFor='FMG_Id'>
                        Group<span className='text-red-500'>*</span>:
                    </Label>
                    <div className='w-64'>
                        <Controller
                            name='FMG_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(v) => {
                                        const id = Number(v);
                                        field.onChange(id);
                                        setSelectedGroupId(id);
                                    }}
                                    value={field.value?.toString() || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Group' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groupLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Groups...
                                            </SelectItem>
                                        ) : (
                                            group?.data?.map((item) => (
                                                <SelectItem key={item.fmG_Id} value={item.fmG_Id.toString()}>
                                                    {item.fmG_GroupName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.FMG_Id && <FormError>{errors.FMG_Id.message}</FormError>}
                    </div>
                </div>

                {/* Heads MultiSelect */}
                <div className='flex items-center justify-center gap-3'>
                    <Label htmlFor='fmH_Ids'>
                        Heads<span className='text-red-500'>*</span>:
                    </Label>
                    <div className='w-64'>
                        <Controller
                            name='fmH_Ids'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        heads?.data?.map((data) => ({
                                            label: data.fmH_FeeName || '',
                                            value: data.fmH_Id.toString()
                                        })) ?? []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleHeadSelection(selectedValues);
                                    }}
                                    defaultValue={selectedHeadsItems.map((data) => data.fmH_Id?.toString())}
                                    value={selectedHeadsItems.map((data) => data.fmH_Id?.toString())}
                                    placeholder={
                                        headsLoading ? 'Loading Heads...' : !selectedGroupId ? 'Select a group first' : 'Select Heads'
                                    }
                                    variant='inverted'
                                    disabled={headsLoading || !selectedGroupId}
                                />
                            )}
                        />
                        {errors.fmH_Ids && <FormError>{errors.fmH_Ids.message}</FormError>}
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={OnReset}
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
                            Update
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
