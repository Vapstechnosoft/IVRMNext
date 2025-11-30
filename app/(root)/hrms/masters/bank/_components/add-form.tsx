'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterBank } from '@/hooks/hrms/useMasters';
import { BANK_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterBankInput } from '@/types/hrms/master-bank';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface AddBankFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddBankForm({ onSuccess, className = '' }: AddBankFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterBank(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterBankInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMBD_BankName: '',
            HRMBD_BranchName: '',
            HRMBD_BankAccountNo: '',
            HRMBD_IFSCCode: '',
            HRMBD_BankAddress: '',
            HRMBD_ActiveFlag: true
        }
    });
    const onSubmit = async (data: MasterBankInput) => {
        const sanitizedData: MasterBankInput = {
            ...data,
            HRMBD_BankName: data.HRMBD_BankName?.trim() || '',
            HRMBD_BranchName: data.HRMBD_BranchName?.trim() || '',
            HRMBD_BankAddress: data.HRMBD_BankAddress?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Bank saved successfully');
                reset();
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to save bank');
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || error?.data?.message || 'Failed to save bank';
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
                    <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMBD_BankName'>
                            Bank Name <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMBD_BankName'
                            placeholder='Enter bank name'
                            maxLength={BANK_VALIDATION.HRMBK_BankName.maxLength?.value}
                            error={errors.HRMBD_BankName?.message}
                            {...register('HRMBD_BankName', BANK_VALIDATION.HRMBK_BankName)}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMBD_BranchName'>
                            Branch Name <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMBD_BranchName'
                            placeholder='Enter branch name'
                            maxLength={BANK_VALIDATION.HRMBK_BranchName.maxLength?.value}
                            error={errors.HRMBD_BranchName?.message}
                            {...register('HRMBD_BranchName', BANK_VALIDATION.HRMBK_BranchName)}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMBD_BankAccountNo'>
                            Account Number <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMBD_BankAccountNo'
                            placeholder='Enter account number'
                            maxLength={BANK_VALIDATION.HRMBK_AccountNumber.maxLength?.value}
                            error={errors.HRMBD_BankAccountNo?.message}
                            {...register('HRMBD_BankAccountNo', BANK_VALIDATION.HRMBK_AccountNumber)}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMBD_IFSCCode'>
                            IFSC Code <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMBD_IFSCCode'
                            placeholder='Enter IFSC code (e.g., ABCD0123456)'
                            maxLength={11}
                            error={errors.HRMBD_IFSCCode?.message}
                            {...register('HRMBD_IFSCCode', BANK_VALIDATION.HRMBK_IFSCCode)}
                        />
                    </div>
                    <div className='col-span-full'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMBD_BankAddress'>Bank Address</Label>
                            <HRMSInputText
                                id='HRMBD_BankAddress'
                                placeholder='Enter bank address'
                                maxLength={BANK_VALIDATION.HRMBK_BankAddress.maxLength?.value}
                                error={errors.HRMBD_BankAddress?.message}
                                {...register('HRMBD_BankAddress', BANK_VALIDATION.HRMBK_BankAddress)}
                            />
                        </div>
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
                            Save Bank
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
