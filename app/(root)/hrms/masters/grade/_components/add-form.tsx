'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasterGrade';
import { gradeSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof gradeSchema.addOrUpdate>;

interface AddGradeFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddGradeForm({ onSuccess, className = '' }: AddGradeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGrade(roleId);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(gradeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMG_GradeName: '',
            HRMG_GradeDisplayName: '',
            HRMG_PayScaleFrom: 0,
            HRMG_IncrementOf: 0,
            HRMG_PayScaleTo: 0,
            HRMG_Order: 0,
            HRMG_ActiveFlag: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync(data);

            if (response?.success) {
                toast.success(response.message || 'Grade saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save grade');
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
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Grade
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
