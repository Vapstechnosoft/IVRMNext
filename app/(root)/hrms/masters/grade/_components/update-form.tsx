'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasterGrade';
import { gradeSchema } from '@/schemas/hrms/employee-category-schemas';
import type { GradeDetail } from '@/types/hrms/master-grade';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof gradeSchema.addOrUpdate>;

interface UpdateGradeFormProps {
    selectedRow: GradeDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateGradeForm({ selectedRow, onSuccess, className = '' }: UpdateGradeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGrade(roleId);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(gradeSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMG_Id: selectedRow.HRMG_Id,
                MI_Id: selectedRow.MI_Id,
                HRMG_GradeName: selectedRow.HRMG_GradeName,
                HRMG_GradeDisplayName: selectedRow.HRMG_GradeDisplayName,
                HRMG_PayScaleFrom: selectedRow.HRMG_PayScaleFrom,
                HRMG_IncrementOf: selectedRow.HRMG_IncrementOf,
                HRMG_PayScaleTo: selectedRow.HRMG_PayScaleTo,
                HRMG_Order: selectedRow.HRMG_Order,
                HRMG_ActiveFlag: selectedRow.HRMG_ActiveFlag
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync(data);

            if (response?.success) {
                toast.success(response.message || 'Grade updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update grade');
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
                            label='Grade Name'
                            required
                            id='HRMG_GradeName'
                            placeholder='Enter grade name'
                            {...register('HRMG_GradeName')}
                            error={errors.HRMG_GradeName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Display Name'
                            required
                            id='HRMG_GradeDisplayName'
                            placeholder='Enter display name'
                            {...register('HRMG_GradeDisplayName')}
                            error={errors.HRMG_GradeDisplayName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Order'
                            id='HRMG_Order'
                            placeholder='Enter order'
                            {...register('HRMG_Order', { valueAsNumber: true })}
                            error={errors.HRMG_Order?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputNumber
                            label='Pay Scale From'
                            required
                            id='HRMG_PayScaleFrom'
                            placeholder='Enter starting pay scale'
                            {...register('HRMG_PayScaleFrom', { valueAsNumber: true })}
                            error={errors.HRMG_PayScaleFrom?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Increment Of'
                            required
                            id='HRMG_IncrementOf'
                            placeholder='Enter increment amount'
                            {...register('HRMG_IncrementOf', { valueAsNumber: true })}
                            error={errors.HRMG_IncrementOf?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Pay Scale To'
                            required
                            id='HRMG_PayScaleTo'
                            placeholder='Enter maximum pay scale'
                            {...register('HRMG_PayScaleTo', { valueAsNumber: true })}
                            error={errors.HRMG_PayScaleTo?.message}
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
                            Update Grade
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
