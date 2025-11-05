import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterMaritalStatus } from '@/hooks/hrms/useMasters';
import { MARITAL_STATUS_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MaritalStatusDetail, MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface MaritalStatusFormProps {
    selectedRow?: MaritalStatusDetail;
    onSuccess?: () => void;
}

export default function MaritalStatusForm({ selectedRow, onSuccess }: MaritalStatusFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterMaritalStatus(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterMaritalStatusInput>({
        defaultValues: {
            MI_Id: roleId,
            IVRMMMS_MaritalStatus: '',
            IVRMMMS_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            console.log('📝 [MARITAL STATUS FORM] Edit mode - Loading selectedRow:', JSON.stringify(selectedRow, null, 2));
            reset({
                IVRMMMS_Id: selectedRow.IVRMMMS_Id,
                MI_Id: selectedRow.MI_Id,
                IVRMMMS_MaritalStatus: selectedRow.IVRMMMS_MaritalStatus,
                IVRMMMS_ActiveFlag: selectedRow.IVRMMMS_ActiveFlag
            });
            console.log('📝 [MARITAL STATUS FORM] Form reset with edit data');
        } else {
            console.log('📝 [MARITAL STATUS FORM] Add mode - No selectedRow');
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterMaritalStatusInput) => {
        console.log('🔵 ========== MARITAL STATUS FORM SUBMIT ==========');
        console.log('🔵 Form Data:', JSON.stringify(data, null, 2));
        console.log('🔵 Is Edit Mode:', isEditMode);
        console.log('🔵 IVRMMMS_Id in data:', data.IVRMMMS_Id);
        console.log('🔵 Role ID:', roleId);
        console.log('🔵 Form Errors:', errors);
        
        try {
            console.log('🟡 Calling saveMutation.mutateAsync...');
            const res = await saveMutation.mutateAsync(data);
            
            console.log('🟢 ========== API RESPONSE ==========');
            console.log('🟢 Response:', JSON.stringify(res, null, 2));
            console.log('🟢 Response success:', res?.success);
            console.log('🟢 Response message:', res?.message);
            console.log('🟢 ====================================');
            
            if (res?.success) {
                console.log('✅ Success! Showing toast:', res?.message);
                const successMsg = res?.message || (isEditMode ? 'Marital status updated successfully' : 'Marital status added successfully');
                toast.success(successMsg);
                
                if (!isEditMode) {
                    console.log('✅ Resetting form (add mode)');
                    reset();
                }
                
                console.log('✅ Calling refetchAll');
                refetchAll();
                
                if (onSuccess) {
                    console.log('✅ Calling onSuccess callback');
                    onSuccess();
                } else {
                    console.log('⚠️ No onSuccess callback provided');
                }
            } else {
                console.log('❌ API returned success=false. Message:', res?.message);
                const errorMsg = res?.message || (isEditMode ? 'Failed to update marital status' : 'Failed to add marital status');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.log('🔴 ========== ERROR ==========');
            console.error('🔴 Error caught in form onSubmit:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error response data:', error?.response?.data);
            console.log('🔴 ============================');
            
            const errorMsg = error?.message || (isEditMode ? 'Failed to update marital status' : 'Failed to add marital status');
            toast.error(errorMsg);
        }
        
        console.log('🔵 ========== FORM SUBMIT END ==========');
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='IVRMMMS_MaritalStatus'>
                    Marital Status <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='IVRMMMS_MaritalStatus'
                    placeholder='Enter marital status'
                    {...register('IVRMMMS_MaritalStatus', MARITAL_STATUS_VALIDATION.maritalStatus)}
                />
                {errors.IVRMMMS_MaritalStatus && <FormError>{errors.IVRMMMS_MaritalStatus.message}</FormError>}
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
