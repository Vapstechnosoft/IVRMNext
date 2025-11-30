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
interface UpdateReligionCategoryMappingFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: ReligionCategoryMappingDetail;
}
export default function UpdateReligionCategoryMappingForm({ onSuccess, className = '', selectedRow: row }: UpdateReligionCategoryMappingFormProps) {
    const { data: response } = useReligionCategoryMapping();
    const { mutate: saveMapping, isPending } = useSaveReligionCategoryMapping();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(religionCategoryMappingSchema.addOrUpdate),
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            const rowWithCategoryIds = row as ReligionCategoryMappingDetail & {
                categoryids?: number[];
            };
            const categoryids =
                rowWithCategoryIds.categoryids && Array.isArray(rowWithCategoryIds.categoryids) && rowWithCategoryIds.categoryids.length > 0
                    ? rowWithCategoryIds.categoryids
                    : row.IMCC_Id
                      ? [row.IMCC_Id]
                      : [];
            reset({
                IMRCC_Id: row.IRCC_Id,
                MI_Id: HRMS_MI_ID,
                IVRMMR_Id: row.IVRMMR_Id,
                IMCC_Id: row.IMCC_Id || 0,
                categoryids: categoryids,
                IMRCC_ActiveFlag: row.IRCC_ActiveFlg,
                IMRCC_CreatedBy: 5,
                LogInUserId: 2
            });
        }
    }, [row, reset]);
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
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
            const validCategoryIds = data.categoryids.filter((id): id is number => typeof id === 'number' && !Number.isNaN(id) && id > 0);
            if (validCategoryIds.length === 0) {
                toast.error('Please select at least one valid category');
                return;
            }
            const rowWithCategoryIds = row as ReligionCategoryMappingDetail & { categoryids?: number[] };
            const originalCategoryIds =
                rowWithCategoryIds.categoryids &&
                Array.isArray(rowWithCategoryIds.categoryids) &&
                rowWithCategoryIds.categoryids.length > 0
                    ? rowWithCategoryIds.categoryids.sort((a, b) => a - b)
                    : row.IMCC_Id
                      ? [row.IMCC_Id]
                      : [];
            const currentCategoryIds = (data.categoryids || []).sort((a, b) => a - b);
            const hasChanges =
                row.IVRMMR_Id !== data.IVRMMR_Id ||
                row.IRCC_ActiveFlg !== data.IMRCC_ActiveFlag ||
                originalCategoryIds.length !== currentCategoryIds.length ||
                !originalCategoryIds.every((id, index) => id === currentCategoryIds[index]);
            if (!hasChanges) {
                toast.info('No changes detected. Nothing to update.');
                onSuccess?.();
                return;
            }
            const selectedReligion = religions.find((r: any) => r.IVRMMR_Id === data.IVRMMR_Id);
            if (!selectedReligion) {
                toast.error('Selected religion not found. Please select again.');
                return;
            }
            const categoryIds = validCategoryIds;
            const firstCategoryId = categoryIds.length > 0 ? categoryIds[0] : 0;
            if (firstCategoryId === 0) {
                toast.error('Please select at least one valid category');
                return;
            }
            const selectedCategories = categoryIds.map((id) => categories.find((c: any) => c.IMCC_Id === id)).filter(Boolean);
            const submitData = {
                MI_Id: data.MI_Id || 30,
                UserId: data.LogInUserId || 2,
                IVRMMR_Id: data.IVRMMR_Id,
                IMCC_Id: firstCategoryId,
                categoryids: categoryIds,
                IRCC_ActiveFlg: data.IMRCC_ActiveFlag ?? true,
                IRCC_Id: row.IRCC_Id,
                IRCC_UpdatedBy: data.IMRCC_CreatedBy || 5,
                IRCC_CreatedDate: row.IRCC_CreatedDate,
                IRCC_CreatedBy: row.IRCC_CreatedBy,
                IVRMMR_Name: selectedReligion?.IVRMMR_Name || '',
                IMCC_CategoryName: selectedCategories[0]?.IMCC_CategoryName || '',
                IMCC_CategoryCode: selectedCategories[0]?.IMCC_CategoryCode || '',
                IMCC_CategoryDesc: selectedCategories[0]?.IMCC_CategoryDesc || ''
            };
            saveMapping(submitData, {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || 'Mapping updated successfully');
                        onSuccess?.();
                    } else {
                        const errorMessage = response.message || '';
                        const isDuplicateError = errorMessage.toLowerCase().includes('duplicate');
                        if (isDuplicateError) {
                            toast.error(
                                `Duplicate entry detected. The combination of Religion and Category already exists.`
                            );
                        } else {
                            toast.error(response.message || 'Failed to update mapping');
                        }
                    }
                },
                onError: (error: any) => {
                    const errorMessage = error.message || '';
                    const isDuplicateError = errorMessage.toLowerCase().includes('duplicate');
                    if (isDuplicateError) {
                        toast.error(`Duplicate entry: The combination already exists.`);
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
    const data = response?.data as any;
    const religions = data?.religion_list || data?.data?.religion_list || [];
    const categories = data?.caste_list || data?.data?.caste_list || [];
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
    const rowWithCategoryIds = row as ReligionCategoryMappingDetail & { categoryids?: number[] };
    const defaultCategoryIds =
        rowWithCategoryIds.categoryids && Array.isArray(rowWithCategoryIds.categoryids) && rowWithCategoryIds.categoryids.length > 0
            ? rowWithCategoryIds.categoryids
            : row.IMCC_Id
              ? [row.IMCC_Id]
              : [];
    const defaultCategoryStringValues = defaultCategoryIds.map((id) => id.toString());
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
                                    const uniqueValues = Array.from(new Set(field.value || []));
                                    const stringValues = uniqueValues.map((id) => id.toString());
                                    const multiSelectKey = `category-${row.IRCC_Id}-${stringValues.join(',')}`;
                                    return (
                                        <MultiSelect
                                            key={multiSelectKey}
                                            options={categoryOptions}
                                            defaultValue={defaultCategoryStringValues}
                                            onValueChange={(values) => {
                                                const uniqueNumbers = Array.from(new Set(values.map((v) => Number(v))));
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
                {/* Action Buttons */}
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
                        disabled={isSubmitting || isPending || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Mapping
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
