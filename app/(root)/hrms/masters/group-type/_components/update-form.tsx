'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGroupType } from '@/hooks/hrms/useMasterGroupType';
import { groupTypeSchema } from '@/schemas/hrms/employee-category-schemas';
import type { GroupTypeDetail } from '@/types/hrms/master-group-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof groupTypeSchema.addOrUpdate>;

interface UpdateGroupTypeFormProps {
    selectedRow: GroupTypeDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateGroupTypeForm({ selectedRow, onSuccess, className = '' }: UpdateGroupTypeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGroupType(roleId);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(groupTypeSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMGT_Id: selectedRow.HRMGT_Id,
                MI_Id: selectedRow.MI_Id,
                HRMGT_EmployeeGroupType: selectedRow.HRMGT_EmployeeGroupType,
                HRMGT_Code: selectedRow.HRMGT_Code,
                HRMGT_Order: selectedRow.HRMGT_Order,
                HRMGT_ActiveFlag: selectedRow.HRMGT_ActiveFlag
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync(data);

            if (response?.success) {
                toast.success(response.message || 'Group type updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update group type');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Group Type Name'
                            required
                            id='HRMGT_EmployeeGroupType'
                            placeholder='Enter group type name'
                            {...register('HRMGT_EmployeeGroupType')}
                            error={errors.HRMGT_EmployeeGroupType?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Code'
                            required
                            id='HRMGT_Code'
                            placeholder='Enter code'
                            {...register('HRMGT_Code')}
                            error={errors.HRMGT_Code?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Order'
                            id='HRMGT_Order'
                            placeholder='Enter order'
                            {...register('HRMGT_Order', { valueAsNumber: true })}
                            error={errors.HRMGT_Order?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
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
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Group Type
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
