'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useGroupDeptDessgMapping, useSaveGroupDeptDessgMapping } from '@/hooks/hrms/useMasters';
import { groupDeptDessgMappingSchema } from '@/schemas/hrms/group-dept-dessg-mapping-schemas';
import type { GroupDeptDessgMappingDetail, GroupDeptDessgMappingInput } from '@/types/hrms/group-dept-dessg-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof groupDeptDessgMappingSchema.addOrUpdate>;

interface MappingFormProps {
    selectedRow?: GroupDeptDessgMappingDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function MappingForm({ selectedRow, onSuccess, className = '' }: MappingFormProps) {
    const { data: response } = useGroupDeptDessgMapping();
    const { mutate: saveMapping, isPending } = useSaveGroupDeptDessgMapping();
    const isEditMode = !!selectedRow;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(groupDeptDessgMappingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            mI_Id: HRMS_MI_ID,
            hrmgT_Id: 0,
            hrmD_Id: 0,
            hrmdeS_Id: 0,
            designationids: [],
            hrgtddS_ActiveFlg: true,
            hrgtddS_CreatedBy: 5,
            logInUserId: 5
        }
    });

    useEffect(() => {
        if (selectedRow) {
            // In edit mode, use the single HRMDES_Id as an array for multi-select
            // The API response has single HRMDES_Id per row, so we convert it to array
            // Also check if designationids exists in the response (for multi-select support)
            const rowWithDesignationIds = selectedRow as GroupDeptDessgMappingDetail & {
                designationids?: number[];
            };
            const designationids =
                rowWithDesignationIds.designationids &&
                Array.isArray(rowWithDesignationIds.designationids) &&
                rowWithDesignationIds.designationids.length > 0
                    ? rowWithDesignationIds.designationids
                    : selectedRow.HRMDES_Id
                      ? [selectedRow.HRMDES_Id]
                      : [];

            const formData = {
                hrgtddS_Id: selectedRow.HRGTDDS_Id,
                mI_Id: HRMS_MI_ID,
                hrmgT_Id: selectedRow.HRMGT_Id,
                hrmD_Id: selectedRow.HRMD_Id,
                hrmdeS_Id: selectedRow.HRMDES_Id || 0,
                designationids: designationids,
                hrgtddS_ActiveFlg: selectedRow.HRGTDDS_ActiveFlg,
                hrgtddS_CreatedBy: 5,
                logInUserId: 5
            };
            reset(formData);
        } else {
            // Reset form when selectedRow is cleared (add mode)
            reset({
                mI_Id: HRMS_MI_ID,
                hrmgT_Id: 0,
                hrmD_Id: 0,
                hrmdeS_Id: 0,
                designationids: [],
                hrgtddS_ActiveFlg: true,
                hrgtddS_CreatedBy: 5,
                logInUserId: 5
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // In edit mode, check if data has actually changed
            if (isEditMode && selectedRow) {
                // Get designation IDs for comparison - convert single HRMDES_Id to array if needed
                const originalDesignationIds =
                    selectedRow.designationids && Array.isArray(selectedRow.designationids) && selectedRow.designationids.length > 0
                        ? selectedRow.designationids.sort((a, b) => a - b)
                        : selectedRow.HRMDES_Id
                          ? [selectedRow.HRMDES_Id]
                          : [];

                const currentDesignationIds = (data.designationids || []).sort((a, b) => a - b);

                // Compare all relevant fields
                const hasChanges =
                    selectedRow.HRMGT_Id !== data.hrmgT_Id ||
                    selectedRow.HRMD_Id !== data.hrmD_Id ||
                    selectedRow.HRGTDDS_ActiveFlg !== data.hrgtddS_ActiveFlg ||
                    originalDesignationIds.length !== currentDesignationIds.length ||
                    !originalDesignationIds.every((id, index) => id === currentDesignationIds[index]);

                // If no changes, show info message and return early
                if (!hasChanges) {
                    toast.info('No changes detected. Nothing to update.');
                    onSuccess?.();
                    return;
                }
            }

            // Ensure hrmdeS_Id is set (can be 0 or the first designation ID for backward compatibility)
            // In edit mode, explicitly include HRGTDDS_Id to ensure backend knows it's an update, not a new record
            const submitData: GroupDeptDessgMappingInput = {
                ...data,
                hrmdeS_Id: data.hrmdeS_Id || (data.designationids && data.designationids.length > 0 ? data.designationids[0] : 0),
                // Always include hrgtddS_Id in edit mode to ensure backend excludes this record from duplicate check
                hrgtddS_Id: isEditMode && selectedRow ? selectedRow.HRGTDDS_Id : data.hrgtddS_Id || 0,
                // Include UpdatedBy only in edit mode
                ...(isEditMode && selectedRow
                    ? {
                          hrgtddS_UpdatedBy: 5,
                          // Preserve original CreatedBy and CreatedDate in edit mode
                          hrgtddS_CreatedBy: selectedRow.HRGTDDS_CreatedBy,
                          hrgtddS_CreatedDate: selectedRow.HRGTDDS_CreatedDate
                      }
                    : {})
            };

            saveMapping(submitData, {
                onSuccess: (response) => {
                    if (response.success) {
                        toast.success(response.message || (isEditMode ? 'Mapping updated successfully' : 'Mapping saved successfully'));
                        if (!isEditMode) {
                            reset();
                        }
                        onSuccess?.();
                    } else {
                        // Check if it's a duplicate error
                        const errorMessage = response.message || '';
                        const isDuplicateError = errorMessage.toLowerCase().includes('duplicate');

                        if (isDuplicateError && isEditMode) {
                            toast.error(
                                `Duplicate entry detected. The combination of Group Type, Department, and Designation(s) already exists. If you're updating this record, ensure HRGTDDS_Id (${submitData.hrgtddS_Id || 0}) is being properly sent to the backend.`
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

    // Memoize arrays to prevent unnecessary re-renders
    // Extract from response structure: response.data.data.groupTypedropdown (nested in ApiResponse)
    // The API returns: { success, message, data: { data: { groupTypedropdown, ... }, groupTypedropdown, ... } }
    const groupTypes = useMemo(() => {
        const responseData = response?.data as any;
        // Try nested structure first (data.data.groupTypedropdown), then root level (data.groupTypedropdown)
        return responseData?.data?.groupTypedropdown || responseData?.groupTypedropdown || [];
    }, [response?.data]);
    const departments = useMemo(() => {
        const responseData = response?.data as any;
        // Try nested structure first (data.data.departmentdropdown), then root level (data.departmentdropdown)
        return responseData?.data?.departmentdropdown || responseData?.departmentdropdown || [];
    }, [response?.data]);
    const designations = useMemo(() => {
        const responseData = response?.data as any;
        // Try nested structure first (data.data.designationdropdown), then root level (data.designationdropdown)
        return responseData?.data?.designationdropdown || responseData?.designationdropdown || [];
    }, [response?.data]);

    // Convert designations to MultiSelect format
    // Use index to ensure uniqueness even if there are duplicate IDs
    const designationOptions = useMemo(() => {
        return designations.map((desig: any, index: number) => ({
            label: desig.HRMDES_DesignationName,
            value: desig.HRMDES_Id?.toString(),
            // Store original index for debugging if needed
            _index: index
        }));
    }, [designations]);

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmgT_Id'>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmgT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={`group-select-${selectedRow?.HRGTDDS_Id || 'new'}-${field.value}`}
                                        value={field.value?.toString() || ''}
                                        onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger id='hrmgT_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select group type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupTypes.map((group: any, index: number) => (
                                                <SelectItem key={`group-${group.HRMGT_Id}-${index}`} value={group.HRMGT_Id?.toString()}>
                                                    {group.HRMGT_EmployeeGroupType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmgT_Id && <FormError>{errors.hrmgT_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmD_Id'>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmD_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={`dept-select-${selectedRow?.HRGTDDS_Id || 'new'}-${field.value}`}
                                        value={field.value?.toString() || ''}
                                        onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger id='hrmD_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select department' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept: any, index: number) => (
                                                <SelectItem key={`dept-${dept.HRMD_Id}-${index}`} value={dept.HRMD_Id?.toString()}>
                                                    {dept.HRMD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmD_Id && <FormError>{errors.hrmD_Id.message}</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5 md:col-span-3'>
                            <Label htmlFor='designationids'>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='designationids'
                                control={control}
                                render={({ field }) => {
                                    const stringValues = field.value?.map((id) => id.toString()) || [];
                                    // Use a key based on selectedRow ID to force re-mount when editing different rows
                                    const multiSelectKey =
                                        isEditMode && selectedRow
                                            ? `designation-${selectedRow.HRGTDDS_Id}-${stringValues.join(',')}`
                                            : `designation-new-${stringValues.join(',')}`;
                                    return (
                                        <MultiSelect
                                            key={multiSelectKey} // Force re-render when editing different rows or values change
                                            options={designationOptions}
                                            defaultValue={stringValues}
                                            onValueChange={(values) => {
                                                // Convert string[] to number[]
                                                field.onChange(values.map((v) => Number(v)));
                                            }}
                                            placeholder='Select designations'
                                            maxCount={3}
                                            maxHeight={300}
                                            className='w-full'
                                        />
                                    );
                                }}
                            />
                            {errors.designationids && <FormError>{errors.designationids.message}</FormError>}
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
