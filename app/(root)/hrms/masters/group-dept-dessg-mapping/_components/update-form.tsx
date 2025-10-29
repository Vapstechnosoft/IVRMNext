'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useGroupDeptDessgMapping, useSaveGroupDeptDessgMapping } from '@/hooks/hrms/useGroupDeptDessgMapping';
import { groupDeptDessgMappingSchema } from '@/schemas/hrms/group-dept-dessg-mapping-schemas';
import type { GroupDeptDessgMappingDetail } from '@/types/hrms/group-dept-dessg-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof groupDeptDessgMappingSchema.addOrUpdate>;

interface UpdateGroupDeptDessgMappingFormProps {
    selectedRow: GroupDeptDessgMappingDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateGroupDeptDessgMappingForm({ selectedRow, onSuccess, className = '' }: UpdateGroupDeptDessgMappingFormProps) {
    const { data: response } = useGroupDeptDessgMapping();
    const { mutate: saveMapping, isPending } = useSaveGroupDeptDessgMapping();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(groupDeptDessgMappingSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                hrgtddS_Id: selectedRow.HRGTDDS_Id,
                mI_Id: HRMS_MI_ID,
                hrmgT_Id: selectedRow.HRMGT_Id,
                hrmD_Id: selectedRow.HRMD_Id,
                hrmdeS_Id: selectedRow.HRMDES_Id,
                hrgtddS_ActiveFlg: selectedRow.HRGTDDS_ActiveFlg,
                hrgtddS_CreatedBy: 5,
                logInUserId: 5
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            saveMapping(
                {
                    ...data,
                    hrgtddS_Id: selectedRow.HRGTDDS_Id,
                    hrgtddS_UpdatedBy: 5
                },
                {
                    onSuccess: (response) => {
                        if (response.success) {
                            toast.success(response.message || 'Mapping updated successfully');
                            onSuccess?.();
                        } else {
                            toast.error(response.message || 'Failed to update mapping');
                        }
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'An error occurred');
                    }
                }
            );
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    const groupTypes = response?.data?.groupTypedropdown || [];
    const departments = response?.data?.departmentdropdown || [];
    const designations = response?.data?.designationdropdown || [];

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Group Type */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmgT_Id'>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmgT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='hrmgT_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select group type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupTypes.map((group) => (
                                                <SelectItem key={group.HRMGT_Id} value={String(group.HRMGT_Id)}>
                                                    {group.HRMGT_EmployeeGroupType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmgT_Id && <FormError>{errors.hrmgT_Id.message}</FormError>}
                        </div>

                        {/* Department */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmD_Id'>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmD_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='hrmD_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select department' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.HRMD_Id} value={String(dept.HRMD_Id)}>
                                                    {dept.HRMD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmD_Id && <FormError>{errors.hrmD_Id.message}</FormError>}
                        </div>

                        {/* Designation */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='hrmdeS_Id'>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='hrmdeS_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='hrmdeS_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select designation' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designations.map((desig) => (
                                                <SelectItem key={desig.HRMDES_Id} value={String(desig.HRMDES_Id)}>
                                                    {desig.HRMDES_DesignationName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmdeS_Id && <FormError>{errors.hrmdeS_Id.message}</FormError>}
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
                        disabled={isSubmitting || isPending}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Mapping
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
