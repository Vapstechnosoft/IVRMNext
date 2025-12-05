'use client';

import { Button } from '@/components/ui/button';
import { InputNumber } from '@/components/ui/extension/input-number';
import { useMasterProfessionalTax } from '@/hooks/hrms/useMasters';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateMasterProfessionalTax } from '@/server/hrms/hrmsConfig/master/professional-tax';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hrmsMasterSchemas.professionalTax.add>;

interface AddProfessionalTaxFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddProfessionalTaxForm({ onSuccess, className = '' }: AddProfessionalTaxFormProps) {
    const { refetchAll } = useMasterProfessionalTax();

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.professionalTax.add),
        mode: 'onChange',
        defaultValues: {
            hrmpT_SalaryFrom: 0,
            hrmpT_SalaryTo: 0,
            hrmpT_PTax: 0
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                hrmpT_Id: 0,
                hrmpT_SalaryFrom: data.hrmpT_SalaryFrom || 0,
                hrmpT_SalaryTo: data.hrmpT_SalaryTo || 0,
                hrmpT_PTax: data.hrmpT_PTax || 0
            };
            const response = await addOrUpdateMasterProfessionalTax(payload);

            if (response?.success) {
                toast.success(response?.message || 'Professional tax saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save professional tax');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save professional tax');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <Controller
                            name='hrmpT_SalaryFrom'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Salary From'
                                    required
                                    id='hrmpT_SalaryFrom'
                                    value={field.value}
                                    maxDigits={10}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmpT_SalaryFrom?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        <Controller
                            name='hrmpT_SalaryTo'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Salary To'
                                    required
                                    id='hrmpT_SalaryTo'
                                    value={field.value}
                                    maxDigits={10}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmpT_SalaryTo?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        <Controller
                            name='hrmpT_PTax'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Professional Tax Amount'
                                    required
                                    id='hrmpT_PTax'
                                    value={field.value}
                                    maxDigits={10}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmpT_PTax?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                    </div>
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
                            Save Professional Tax
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
