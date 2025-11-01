'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useReligionCategoryMapping, useSaveReligionCategoryMapping } from '@/hooks/hrms/useMasters';
import { religionCategoryMappingSchema } from '@/schemas/hrms/religion-category-mapping-schemas';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof religionCategoryMappingSchema.addOrUpdate>;

interface ReligionCategoryMappingFormProps {
    selectedRow?: ReligionCategoryMappingDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function ReligionCategoryMappingForm({ selectedRow, onSuccess, className = '' }: ReligionCategoryMappingFormProps) {
    const { data: response } = useReligionCategoryMapping();
    const { mutate: saveMapping, isPending } = useSaveReligionCategoryMapping();
    const isEditMode = !!selectedRow;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(religionCategoryMappingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: HRMS_MI_ID,
            IVRMMR_Id: 0,
            IMCC_Id: 0,
            IMRCC_ActiveFlag: true,
            IMRCC_CreatedBy: 5,
            LogInUserId: 2
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                IMRCC_Id: selectedRow.IRCC_Id,
                MI_Id: HRMS_MI_ID,
                IVRMMR_Id: selectedRow.IVRMMR_Id,
                IMCC_Id: selectedRow.IMCC_Id,
                IMRCC_ActiveFlag: selectedRow.IRCC_ActiveFlg,
                IMRCC_CreatedBy: 5,
                LogInUserId: 2
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const submitData = isEditMode
                ? {
                      MI_Id: data.MI_Id,
                      UserId: data.LogInUserId || 2,
                      IVRMMR_Id: data.IVRMMR_Id,
                      IMCC_Id: data.IMCC_Id,
                      IRCC_ActiveFlg: data.IMRCC_ActiveFlag,
                      IRCC_Id: selectedRow.IRCC_Id,
                      IRCC_UpdatedBy: data.IMRCC_CreatedBy || 5
                  }
                : {
                      MI_Id: data.MI_Id,
                      UserId: data.LogInUserId || 2,
                      IVRMMR_Id: data.IVRMMR_Id,
                      IMCC_Id: data.IMCC_Id,
                      IRCC_ActiveFlg: data.IMRCC_ActiveFlag,
                      IRCC_CreatedBy: data.IMRCC_CreatedBy || 5
                  };

            saveMapping(submitData, {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || (isEditMode ? 'Mapping updated successfully' : 'Mapping saved successfully'));
                        if (!isEditMode) reset();
                        onSuccess?.();
                    } else {
                        toast.error(response.message || (isEditMode ? 'Failed to update mapping' : 'Failed to save mapping'));
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || 'An error occurred');
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    const religions = response?.data?.religion_list || [];
    const categories = response?.data?.caste_list || [];

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='IVRMMR_Id'>
                                Religion <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='IVRMMR_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger id='IVRMMR_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select religion' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {religions.map((religion: any) => (
                                                <SelectItem key={religion.IVRMMR_Id} value={religion.IVRMMR_Id?.toString()}>
                                                    {religion.IVRMMR_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRMMR_Id && <FormError>{errors.IVRMMR_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='IMCC_Id'>
                                Category <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='IMCC_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger id='IMCC_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category: any) => (
                                                <SelectItem key={category.IMCC_Id} value={category.IMCC_Id?.toString()}>
                                                    {category.IMCC_CategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IMCC_Id && <FormError>{errors.IMCC_Id.message}</FormError>}
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isEditMode ? 'Update Mapping' : 'Save Mapping'}
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
