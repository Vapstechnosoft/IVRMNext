'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterProfessionalTax } from '@/hooks/hrms/useMasters';
import { PROFESSIONAL_TAX_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterProfessionalTaxInput } from '@/types/hrms/master-professional-tax';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface AddProfessionalTaxFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddProfessionalTaxForm({ onSuccess, className = '' }: AddProfessionalTaxFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterProfessionalTax(roleId);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterProfessionalTaxInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMPT_SalaryFrom: 0,
            HRMPT_SalaryTo: 0,
            HRMPT_PTax: 0,
            HRMPT_ActiveFlag: true
        }
    });
    const onSubmit = async (data: MasterProfessionalTaxInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(res?.message || 'Professional tax added successfully');
                reset();
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to add professional tax');
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to add professional tax';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={className}>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMPT_SalaryFrom'>
                            Salary From <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='HRMPT_SalaryFrom'
                            control={control}
                            rules={PROFESSIONAL_TAX_VALIDATION.HRMPT_AmountFrom}
                            render={({ field }) => (
                                <Input
                                    type='number'
                                    id='HRMPT_SalaryFrom'
                                    value={field.value}
                                    onChange={field.onChange}
                                    aria-invalid={errors.HRMPT_SalaryFrom ? true : undefined}
                                    data-error={errors.HRMPT_SalaryFrom ? 'true' : undefined}
                                />
                            )}
                        />
                        {errors.HRMPT_SalaryFrom && <FormError>{errors.HRMPT_SalaryFrom.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMPT_SalaryTo'>
                            Salary To <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='HRMPT_SalaryTo'
                            control={control}
                            rules={PROFESSIONAL_TAX_VALIDATION.HRMPT_AmountTo}
                            render={({ field }) => (
                                <Input
                                    type='number'
                                    id='HRMPT_SalaryTo'
                                    value={field.value}
                                    onChange={field.onChange}
                                    aria-invalid={errors.HRMPT_SalaryTo ? true : undefined}
                                    data-error={errors.HRMPT_SalaryTo ? 'true' : undefined}
                                />
                            )}
                        />
                        {errors.HRMPT_SalaryTo && <FormError>{errors.HRMPT_SalaryTo.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMPT_PTax'>
                            Professional Tax Amount <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='HRMPT_PTax'
                            control={control}
                            rules={PROFESSIONAL_TAX_VALIDATION.HRMPT_ProfessionalTax}
                            render={({ field }) => (
                                <Input
                                    type='number'
                                    id='HRMPT_PTax'
                                    value={field.value}
                                    onChange={field.onChange}
                                    aria-invalid={errors.HRMPT_PTax ? true : undefined}
                                    data-error={errors.HRMPT_PTax ? 'true' : undefined}
                                />
                            )}
                        />
                        {errors.HRMPT_PTax && <FormError>{errors.HRMPT_PTax.message}</FormError>}
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
