import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasters';
import { LOAN_TYPE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterLoanDetail, MasterLoanInput } from '@/types/hrms/master-loan';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LoanFormProps {
    selectedRow?: MasterLoanDetail;
    onSuccess?: () => void;
}

export default function LoanForm({ selectedRow, onSuccess }: LoanFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterLoan(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterLoanInput>({
        defaultValues: {
            MI_Id: roleId,
            HRML_LoanType: '',
            HRML_Max: 0,
            HRMLN_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMLN_Id: selectedRow.HRMLN_Id,
                MI_Id: selectedRow.MI_Id,
                HRML_LoanType: selectedRow.HRML_LoanType,
                HRML_Max: selectedRow.HRML_Max,
                HRMLN_ActiveFlag: selectedRow.HRMLN_ActiveFlag
            });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterLoanInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(isEditMode ? 'Loan type updated successfully' : 'Loan type added successfully');
                if (onSuccess) onSuccess();
            }
        } catch (_error) {
            toast.error(isEditMode ? 'Failed to update loan type' : 'Failed to add loan type');
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRML_LoanType'>
                    Loan Type <span className='text-destructive'>*</span>
                </Label>
                <InputText id='HRML_LoanType' placeholder='Enter loan type' {...register('HRML_LoanType', LOAN_TYPE_VALIDATION.loanType)} />
                {errors.HRML_LoanType && <FormError>{errors.HRML_LoanType.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRML_Max'>
                    Maximum Amount <span className='text-destructive'>*</span>
                </Label>
                <Controller
                    name='HRML_Max'
                    control={control}
                    rules={LOAN_TYPE_VALIDATION.maxLoanAmount}
                    render={({ field }) => <Input type='number' id='HRML_Max' value={field.value} onChange={field.onChange} />}
                />
                {errors.HRML_Max && <FormError>{errors.HRML_Max.message}</FormError>}
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
