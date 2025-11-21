'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useReligionCategoryMapping, useSaveReligionCategoryMapping } from '@/hooks/hrms/useMasters';
import { religionCategoryMappingSchema } from '@/schemas/hrms/religion-category-mapping-schemas';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
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
            categoryids: [],
            IMRCC_ActiveFlag: true,
            IMRCC_CreatedBy: 5,
            LogInUserId: 2
        }
    });

    useEffect(() => {
        if (selectedRow) {
            // In edit mode, use the single IMCC_Id as an array for multi-select
            // The API response has single IMCC_Id per row, so we convert it to array
            // Also check if categoryids exists in the response (for multi-select support)
            const rowWithCategoryIds = selectedRow as ReligionCategoryMappingDetail & {
                categoryids?: number[];
            };
            const categoryids =
                rowWithCategoryIds.categoryids && Array.isArray(rowWithCategoryIds.categoryids) && rowWithCategoryIds.categoryids.length > 0
                    ? rowWithCategoryIds.categoryids
                    : selectedRow.IMCC_Id
                      ? [selectedRow.IMCC_Id]
                      : [];

            reset({
                IMRCC_Id: selectedRow.IRCC_Id,
                MI_Id: HRMS_MI_ID,
                IVRMMR_Id: selectedRow.IVRMMR_Id,
                IMCC_Id: selectedRow.IMCC_Id || 0,
                categoryids: categoryids,
                IMRCC_ActiveFlag: selectedRow.IRCC_ActiveFlg,
                IMRCC_CreatedBy: 5,
                LogInUserId: 2
            });
        } else {
            // Reset to default values when not in edit mode
            reset({
                MI_Id: HRMS_MI_ID,
                IVRMMR_Id: 0,
                IMCC_Id: 0,
                categoryids: [],
                IMRCC_ActiveFlag: true,
                IMRCC_CreatedBy: 5,
                LogInUserId: 2
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // Validate that required fields are selected - use strict validation
            if (!data.IVRMMR_Id || data.IVRMMR_Id === 0 || Number.isNaN(data.IVRMMR_Id)) {
                toast.error('Please select a religion');
                return;
            }

            if (
                !data.categoryids ||
                !Array.isArray(data.categoryids) ||
                data.categoryids.length === 0 ||
                data.categoryids.every((id) => !id || id === 0)
            ) {
                toast.error('Please select at least one category');
                return;
            }

            // Filter out any invalid category IDs (0, null, undefined, NaN)
            const validCategoryIds = data.categoryids.filter((id): id is number => typeof id === 'number' && !Number.isNaN(id) && id > 0);

            if (validCategoryIds.length === 0) {
                toast.error('Please select at least one valid category');
                return;
            }

            // In edit mode, check if data has actually changed
            if (isEditMode && selectedRow) {
                // Get category IDs for comparison - convert single IMCC_Id to array if needed
                const rowWithCategoryIds = selectedRow as ReligionCategoryMappingDetail & { categoryids?: number[] };
                const originalCategoryIds =
                    rowWithCategoryIds.categoryids &&
                    Array.isArray(rowWithCategoryIds.categoryids) &&
                    rowWithCategoryIds.categoryids.length > 0
                        ? rowWithCategoryIds.categoryids.sort((a, b) => a - b)
                        : selectedRow.IMCC_Id
                          ? [selectedRow.IMCC_Id]
                          : [];

                const currentCategoryIds = (data.categoryids || []).sort((a, b) => a - b);

                // Compare all relevant fields
                const hasChanges =
                    selectedRow.IVRMMR_Id !== data.IVRMMR_Id ||
                    selectedRow.IRCC_ActiveFlg !== data.IMRCC_ActiveFlag ||
                    originalCategoryIds.length !== currentCategoryIds.length ||
                    !originalCategoryIds.every((id, index) => id === currentCategoryIds[index]);

                // If no changes, show info message and return early
                if (!hasChanges) {
                    toast.info('No changes detected. Nothing to update.');
                    onSuccess?.();
                    return;
                }
            }

            // Get religion name from dropdown - ensure we have a valid religion
            const selectedReligion = religions.find((r: any) => r.IVRMMR_Id === data.IVRMMR_Id);
            if (!selectedReligion) {
                toast.error('Selected religion not found. Please select again.');
                return;
            }

            // Get category names from dropdowns (for multi-select)
            // Use only valid category IDs (filter out 0, null, undefined, NaN)
            const categoryIds = validCategoryIds; // Use the filtered valid IDs
            const firstCategoryId = categoryIds.length > 0 ? categoryIds[0] : 0;

            if (firstCategoryId === 0) {
                toast.error('Please select at least one valid category');
                return;
            }
            const selectedCategories = categoryIds.map((id) => categories.find((c: any) => c.IMCC_Id === id)).filter(Boolean);

            // Ensure IMCC_Id is set (can be 0 or the first category ID for backward compatibility)
            // In edit mode, explicitly include IRCC_Id to ensure backend knows it's an update, not a new record
            const submitData = isEditMode
                ? {
                      MI_Id: data.MI_Id || 30,
                      UserId: data.LogInUserId || 2,
                      IVRMMR_Id: data.IVRMMR_Id, // Use the validated value directly (no || 0 fallback)
                      IMCC_Id: firstCategoryId, // Use the validated value directly
                      categoryids: categoryIds, // Use the validated array
                      IRCC_ActiveFlg: data.IMRCC_ActiveFlag ?? true,
                      IRCC_Id: selectedRow!.IRCC_Id,
                      IRCC_UpdatedBy: data.IMRCC_CreatedBy || 5,
                      IRCC_CreatedDate: selectedRow!.IRCC_CreatedDate,
                      IRCC_CreatedBy: selectedRow!.IRCC_CreatedBy,
                      IVRMMR_Name: selectedReligion?.IVRMMR_Name || '',
                      // Use first category for backward compatibility fields
                      IMCC_CategoryName: selectedCategories[0]?.IMCC_CategoryName || '',
                      IMCC_CategoryCode: selectedCategories[0]?.IMCC_CategoryCode || '',
                      IMCC_CategoryDesc: selectedCategories[0]?.IMCC_CategoryDesc || ''
                  }
                : {
                      MI_Id: data.MI_Id || 30,
                      UserId: data.LogInUserId || 2,
                      IVRMMR_Id: data.IVRMMR_Id, // Use the validated value directly (no || 0 fallback)
                      IMCC_Id: firstCategoryId, // Use the validated value directly
                      categoryids: categoryIds, // Use the validated array
                      IRCC_ActiveFlg: data.IMRCC_ActiveFlag ?? true,
                      IRCC_CreatedBy: data.IMRCC_CreatedBy || 5,
                      IVRMMR_Name: selectedReligion?.IVRMMR_Name || '',
                      // Use first category for backward compatibility fields
                      IMCC_CategoryName: selectedCategories[0]?.IMCC_CategoryName || '',
                      IMCC_CategoryCode: selectedCategories[0]?.IMCC_CategoryCode || '',
                      IMCC_CategoryDesc: selectedCategories[0]?.IMCC_CategoryDesc || ''
                  };

            saveMapping(submitData, {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || (isEditMode ? 'Mapping updated successfully' : 'Mapping saved successfully'));
                        if (!isEditMode) reset();
                        onSuccess?.();
                    } else {
                        // Check if it's a duplicate error
                        const errorMessage = response.message || '';
                        const isDuplicateError = errorMessage.toLowerCase().includes('duplicate');

                        if (isDuplicateError && isEditMode) {
                            toast.error(
                                `Duplicate entry detected. The combination of Religion and Category already exists. If you're updating this record, ensure IRCC_Id (${submitData.IRCC_Id || 0}) is being properly sent to the backend.`
                            );
                        } else {
                            toast.error(response.message || (isEditMode ? 'Failed to update mapping' : 'Failed to save mapping'));
                        }
                    }
                },
                onError: (error: any) => {
                    const errorMessage = error.message || '';
                    const isDuplicateError = errorMessage.toLowerCase().includes('duplicate');

                    if (isDuplicateError && isEditMode) {
                        toast.error(
                            `Duplicate entry: The combination already exists. Please check that you're not creating a duplicate record.`
                        );
                    } else {
                        toast.error(error.message || 'An error occurred');
                    }
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    // Extract religion_list and caste_list from the new response structure
    // Response structure: { data: { data: { mapping, religion_list, caste_list }, religion_list, caste_list, ... } }
    const data = response?.data as any;
    const religions = data?.religion_list || data?.data?.religion_list || [];
    const categories = data?.caste_list || data?.data?.caste_list || [];

    // Convert categories to options format for MultiSelect
    // Filter out duplicates by IMCC_Id to prevent React key errors
    const categoryOptions = useMemo(() => {
        const seen = new Set<string>();
        return categories
            .filter((category: any) => {
                const id = category.IMCC_Id?.toString() || '';
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .map((category: any) => ({
                label: category.IMCC_CategoryName || '',
                value: category.IMCC_Id?.toString() || ''
            }));
    }, [categories]);

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
                                render={({ field }) => {
                                    // Ensure value is properly set - handle 0 vs undefined
                                    const selectValue = field.value && field.value > 0 ? field.value.toString() : '';

                                    return (
                                        <Select
                                            value={selectValue}
                                            onValueChange={(value) => {
                                                const numValue = Number(value);
                                                if (numValue > 0) {
                                                    field.onChange(numValue);
                                                }
                                            }}>
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
                                    );
                                }}
                            />
                            {errors.IVRMMR_Id && <FormError>{errors.IVRMMR_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='categoryids'>
                                Category <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='categoryids'
                                control={control}
                                render={({ field }) => {
                                    // Remove duplicates from field.value to prevent React key errors
                                    const uniqueValues = Array.from(new Set(field.value || []));
                                    const stringValues = uniqueValues.map((id) => id.toString());
                                    // Use a key based on selectedRow ID to force re-mount when editing different rows
                                    const multiSelectKey =
                                        isEditMode && selectedRow
                                            ? `category-${selectedRow.IRCC_Id}-${stringValues.join(',')}`
                                            : `category-new-${stringValues.join(',')}`;

                                    return (
                                        <MultiSelect
                                            key={multiSelectKey} // Force re-render when editing different rows or values change
                                            options={categoryOptions}
                                            defaultValue={stringValues}
                                            onValueChange={(values) => {
                                                // Remove duplicates and convert string[] to number[]
                                                const uniqueNumbers = Array.from(new Set(values.map((v) => Number(v))));
                                                // Only update if values actually changed (prevents unnecessary re-renders)
                                                const currentUnique = Array.from(new Set(field.value || [])).sort((a, b) => a - b);
                                                const newUnique = uniqueNumbers.sort((a, b) => a - b);
                                                if (
                                                    currentUnique.length !== newUnique.length ||
                                                    !currentUnique.every((val, idx) => val === newUnique[idx])
                                                ) {
                                                    field.onChange(uniqueNumbers);
                                                }
                                            }}
                                            placeholder='Select categories'
                                            maxCount={3}
                                            maxHeight={300}
                                            className='w-full'
                                        />
                                    );
                                }}
                            />
                            {errors.categoryids && <FormError>{errors.categoryids.message}</FormError>}
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
