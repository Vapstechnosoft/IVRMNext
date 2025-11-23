import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterProfessionalTax } from '@/hooks/hrms/useMasters';
import { PROFESSIONAL_TAX_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterProfessionalTaxInput, ProfessionalTaxDetail } from '@/types/hrms/master-professional-tax';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProfessionalTaxFormProps {
    selectedRow?: ProfessionalTaxDetail;
    onSuccess?: () => void;
}

export default function ProfessionalTaxForm({ selectedRow, onSuccess }: ProfessionalTaxFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterProfessionalTax(roleId);
    const isEditMode = !!selectedRow;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterProfessionalTaxInput>({
        defaultValues: {
            MI_Id: roleId,
            HRMPT_SalaryFrom: 0,
            HRMPT_SalaryTo: 0,
            HRMPT_PTax: 0,
            HRMPT_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMPT_Id: selectedRow.HRMPT_Id,
                MI_Id: selectedRow.MI_Id,
                HRMPT_SalaryFrom: selectedRow.HRMPT_SalaryFrom,
                HRMPT_SalaryTo: selectedRow.HRMPT_SalaryTo,
                HRMPT_PTax: selectedRow.HRMPT_PTax,
                HRMPT_ActiveFlag: selectedRow.HRMPT_ActiveFlag
            });
        }
        // else: no selected row, form remains empty
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterProfessionalTaxInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);

            if (res?.success) {
                const successMsg =
                    res?.message || (isEditMode ? 'Professional tax updated successfully' : 'Professional tax added successfully');
                toast.success(successMsg);

                if (!isEditMode) {
                    reset();
                }
                refetchAll();

                if (onSuccess) {
                    onSuccess();
                }
                // else: onSuccess callback not provided
            } else {
                const errorMsg = res?.message || (isEditMode ? 'Failed to update professional tax' : 'Failed to add professional tax');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔴 Error caught in form onSubmit:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error response data:', error?.response?.data);

            const errorMsg = error?.message || (isEditMode ? 'Failed to update professional tax' : 'Failed to add professional tax');
            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMPT_SalaryFrom'>
                    Salary From <span className='text-destructive'>*</span>
                </Label>
                <Controller
                    name='HRMPT_SalaryFrom'
                    control={control}
                    rules={PROFESSIONAL_TAX_VALIDATION.HRMPT_AmountFrom}
                    render={({ field }) => <Input type='number' id='HRMPT_SalaryFrom' value={field.value} onChange={field.onChange} />}
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
                    render={({ field }) => <Input type='number' id='HRMPT_SalaryTo' value={field.value} onChange={field.onChange} />}
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
                    render={({ field }) => <Input type='number' id='HRMPT_PTax' value={field.value} onChange={field.onChange} />}
                />
                {errors.HRMPT_PTax && <FormError>{errors.HRMPT_PTax.message}</FormError>}
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
