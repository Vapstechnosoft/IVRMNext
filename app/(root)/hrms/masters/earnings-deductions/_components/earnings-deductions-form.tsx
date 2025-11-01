import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import { EARNING_DEDUCTION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { EarningsDeductionDetail, MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface EarningsDeductionsFormProps {
    selectedRow?: EarningsDeductionDetail;
    onSuccess?: () => void;
}

export default function EarningsDeductionsForm({ selectedRow, onSuccess }: EarningsDeductionsFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterEarningsDeductions(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterEarningsDeductionsInput>({
        defaultValues: {
            MI_Id: roleId,
            HRMED_Name: '',
            HRMED_EDTypeFlag: 'Regular',
            HRMED_EarnDedFlag: 'Earning',
            HRMED_AmountPercentFlag: 'Amount',
            HRMED_AmountPercent: '0',
            HRMED_ActiveFlag: true,
            HRMED_RoundOffFlag: 'No',
            HRMED_Order: 0
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMED_Id: selectedRow.HRMED_Id,
                MI_Id: selectedRow.MI_Id,
                HRMED_Name: selectedRow.HRMED_Name,
                HRMED_EDTypeFlag: selectedRow.HRMED_EDTypeFlag,
                HRMED_EarnDedFlag: selectedRow.HRMED_EarnDedFlag,
                HRMED_AmountPercentFlag: selectedRow.HRMED_AmountPercentFlag,
                HRMED_AmountPercent: selectedRow.HRMED_AmountPercent,
                HRMED_ActiveFlag: selectedRow.HRMED_ActiveFlag,
                HRMED_RoundOffFlag: selectedRow.HRMED_RoundOffFlag,
                HRMED_Order: selectedRow.HRMED_Order
            });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterEarningsDeductionsInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(isEditMode ? 'Earning/Deduction updated successfully' : 'Earning/Deduction added successfully');
                if (onSuccess) onSuccess();
            }
        } catch (_error) {
            toast.error(isEditMode ? 'Failed to update earning/deduction' : 'Failed to add earning/deduction');
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_Name'>
                    Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMED_Name'
                    placeholder='Enter earning/deduction name'
                    {...register('HRMED_Name', EARNING_DEDUCTION_VALIDATION.name)}
                />
                {errors.HRMED_Name && <FormError>{errors.HRMED_Name.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_EarnDedFlag'>
                    Type <span className='text-destructive'>*</span>
                </Label>
                <select
                    id='HRMED_EarnDedFlag'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    {...register('HRMED_EarnDedFlag', EARNING_DEDUCTION_VALIDATION.type)}>
                    <option value='Earning'>Earning</option>
                    <option value='Deduction'>Deduction</option>
                </select>
                {errors.HRMED_EarnDedFlag && <FormError>{errors.HRMED_EarnDedFlag.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_AmountPercentFlag'>
                    Calculation Type <span className='text-destructive'>*</span>
                </Label>
                <select
                    id='HRMED_AmountPercentFlag'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    {...register('HRMED_AmountPercentFlag')}>
                    <option value='Amount'>Amount</option>
                    <option value='Percentage'>Percentage</option>
                </select>
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_AmountPercent'>
                    Value <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMED_AmountPercent'
                    placeholder='Enter value'
                    {...register('HRMED_AmountPercent', EARNING_DEDUCTION_VALIDATION.value)}
                />
                {errors.HRMED_AmountPercent && <FormError>{errors.HRMED_AmountPercent.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_Order'>Order</Label>
                <Input
                    type='number'
                    id='HRMED_Order'
                    {...register('HRMED_Order', {
                        valueAsNumber: true
                    })}
                />
                {errors.HRMED_Order && <FormError>{errors.HRMED_Order.message}</FormError>}
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
