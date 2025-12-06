'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCasteCategoryDropdown, useReligionDropdown } from '@/hooks/hrms/useEmployeeRegister';
import { useReligionCategoryMappingCRUD } from '@/hooks/hrms/useMasters';
import { religionCategoryMappingSchema } from '@/schemas/hrms/religion-category-mapping-schemas';
import { saveReligionCategoryMapping } from '@/server/hrms/hrmsConfig/master/religion-category-mapping';
import type { ICasteCategoryDropdown, IReligionDropdown } from '@/types/hrms/hrms-config/employee';
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

export default function UpdateReligionCategoryMappingForm({
    onSuccess,
    className = '',
    selectedRow: row
}: UpdateReligionCategoryMappingFormProps) {
    const { refetchAll } = useReligionCategoryMappingCRUD();

    // Religion dropdown - API: /api/MasterDropDown/GeAllReligionList
    const { data: religionDropdownResponse } = useReligionDropdown();
    const religionDropdown: IReligionDropdown[] = Array.isArray(religionDropdownResponse)
        ? religionDropdownResponse
        : (religionDropdownResponse as any)?.data || [];

    // Caste Category dropdown - API: /api/MasterDropDown/GeAllCasteCategoriesList
    const { data: casteCategoryDropdownResponse } = useCasteCategoryDropdown();
    const casteCategoryDropdown: ICasteCategoryDropdown[] = Array.isArray(casteCategoryDropdownResponse)
        ? casteCategoryDropdownResponse
        : (casteCategoryDropdownResponse as any)?.data || [];

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
                IVRMMR_Id: row.IVRMMR_Id,
                IMCC_Id: row.IMCC_Id || 0,
                categoryids: categoryids
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const rowWithCategoryIds = row as ReligionCategoryMappingDetail & { categoryids?: number[] };
            const originalCategoryIds =
                rowWithCategoryIds.categoryids && Array.isArray(rowWithCategoryIds.categoryids) && rowWithCategoryIds.categoryids.length > 0
                    ? rowWithCategoryIds.categoryids.sort((a, b) => a - b)
                    : row.IMCC_Id
                      ? [row.IMCC_Id]
                      : [];
            const currentCategoryIds = (data.categoryids || []).sort((a, b) => a - b);
            const hasChanges =
                row.IVRMMR_Id !== data.IVRMMR_Id ||
                originalCategoryIds.length !== currentCategoryIds.length ||
                !originalCategoryIds.every((id, index) => id === currentCategoryIds[index]);
            if (!hasChanges) {
                toast.info('No changes detected. Nothing to update.');
                onSuccess?.();
                return;
            }
            const payload = {
                IRCC_Id: row.IRCC_Id,
                IVRMMR_Id: data.IVRMMR_Id,
                IMCC_Ids: data.categoryids || [],
                UserId: 0
            };
            const response = await saveReligionCategoryMapping(payload);

            if (response?.success) {
                toast.success(response?.message || 'Mapping updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update mapping');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update mapping');
        }
    };
    const handleReset = () => {
        reset();
    };

    // Transform caste category dropdown for MultiSelect component
    const categoryOptions = useMemo(() => {
        return casteCategoryDropdown
            .filter((category: ICasteCategoryDropdown) => {
                return category.key != null && category.key !== '' && String(category.key).trim() !== '';
            })
            .map((category: ICasteCategoryDropdown) => ({
                label: category.value || String(category.key),
                value: category.key?.toString().trim() || '',
                _index: 0
            }))
            .filter((opt) => opt.value !== '');
    }, [casteCategoryDropdown]);
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
                                                {religionDropdown
                                                    .filter((religion: IReligionDropdown) => {
                                                        return (
                                                            religion.key != null &&
                                                            religion.key !== '' &&
                                                            String(religion.key).trim() !== ''
                                                        );
                                                    })
                                                    .map((religion: IReligionDropdown) => {
                                                        const key = religion.key?.toString().trim();
                                                        if (!key || key === '') return null;
                                                        const value = religion.value || String(religion.key);
                                                        return (
                                                            <SelectItem key={religion.key} value={key}>
                                                                {value}
                                                            </SelectItem>
                                                        );
                                                    })
                                                    .filter(Boolean)}
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
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
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
