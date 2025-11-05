import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasters';
import { LOAN_TYPE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterLoanDetail, MasterLoanInput } from '@/types/hrms/master-loan';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LoanFormProps {
    selectedRow?: MasterLoanDetail;
    onSuccess?: () => void;
}

export default function LoanForm({ selectedRow, onSuccess }: LoanFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterLoan(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
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
            console.log('📝 [LOAN FORM] Edit mode - Loading selectedRow:', JSON.stringify(selectedRow, null, 2));
            const formData = {
                HRMLN_Id: selectedRow.HRMLN_Id,
                MI_Id: selectedRow.MI_Id,
                HRML_LoanType: selectedRow.HRML_LoanType,
                HRML_Max: selectedRow.HRML_Max,
                HRMLN_ActiveFlag: selectedRow.HRMLN_ActiveFlag
            };
            console.log('📝 [FORM] Resetting form with data:', JSON.stringify(formData, null, 2));
            reset(formData);
            console.log('📝 [FORM] Form reset complete');
        } else {
            console.log('📝 [LOAN FORM] Add mode - No selectedRow');
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterLoanInput) => {
        console.log('🔵 ========== LOAN FORM SUBMIT ==========');
        console.log('🔵 [FORM] onSubmit called');
        console.log('🔵 [FORM] Is Edit Mode:', isEditMode);
        console.log('🔵 [FORM] Form data received:', JSON.stringify(data, null, 2));
        
        try {
            const res = await saveMutation.mutateAsync(data);
            console.log('🟢 [FORM] Loan response:', JSON.stringify(res, null, 2));
            
            if (res?.success) {
                console.log('✅ [FORM] Save successful');
                toast.success(isEditMode ? 'Loan type updated successfully' : 'Loan type added successfully');
                if (!isEditMode) {
                    console.log('📝 [FORM] Add mode - resetting form');
                    reset();
                }
                console.log('📝 [FORM] Calling refetchAll...');
                refetchAll();
                console.log('📝 [FORM] Calling onSuccess callback');
                if (onSuccess) onSuccess();
            } else {
                console.log('❌ [FORM] Save failed - response.success is false');
                toast.error(res?.message || (isEditMode ? 'Failed to update loan type' : 'Failed to add loan type'));
            }
        } catch (error: any) {
            console.log('🔴 [FORM] Caught exception in onSubmit:', error);
            toast.error(isEditMode ? 'Failed to update loan type' : 'Failed to add loan type');
        }
        
        console.log('🔵 ========== LOAN FORM SUBMIT END ==========');
    };

    const handleReset = () => {
        reset();
    };

    return (
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <input type='hidden' {...register('HRMLN_Id')} />
            <input type='hidden' {...register('MI_Id')} />
            
            <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRML_LoanType'>
                            Loan Type <span className='text-destructive'>*</span>
                        </Label>
                        <InputText 
                            id='HRML_LoanType' 
                            placeholder='Enter loan type' 
                            {...register('HRML_LoanType', LOAN_TYPE_VALIDATION.loanType)} 
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        {errors.HRML_LoanType && <FormError>{errors.HRML_LoanType.message}</FormError>}
                    </div>
                    
                    <Controller
                        name='HRML_Max'
                        control={control}
                        rules={LOAN_TYPE_VALIDATION.maxLoanAmount}
                        render={({ field }) => (
                            <InputNumber
                                label='Maximum Amount'
                                required
                                id='HRML_Max'
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.HRML_Max?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        )}
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
                    disabled={isSubmitting || (isEditMode && !isDirty)}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        {isEditMode ? 'Update Loan Type' : 'Save Loan Type'}
                    </div>
                </Button>
            </div>
        </form>
    );
}
