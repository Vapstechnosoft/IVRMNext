import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterBank } from '@/hooks/hrms/useMasters';
import { BANK_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { BankItem, MasterBankInput } from '@/types/hrms/master-bank';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface BankFormProps {
    selectedRow?: BankItem; // undefined = add mode, provided = edit mode
    onSuccess?: () => void;
}

export default function BankForm({ selectedRow, onSuccess }: BankFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterBank(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<MasterBankInput>({
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

    // Populate form when in edit mode
    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMBD_Id: selectedRow.HRMBD_Id,
                MI_Id: selectedRow.MI_Id,
                HRMBD_BankName: selectedRow.HRMBD_BankName,
                HRMBD_BranchName: selectedRow.HRMBD_BranchName,
                HRMBD_BankAccountNo: selectedRow.HRMBD_BankAccountNo,
                HRMBD_IFSCCode: selectedRow.HRMBD_IFSCCode,
                HRMBD_BankAddress: selectedRow.HRMBD_BankAddress,
                HRMBD_ActiveFlag: selectedRow.HRMBD_ActiveFlag
            });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterBankInput) => {
        if (isEditMode) {
        } else {
        }

        if (isEditMode && !data.HRMBD_Id) {
            console.warn('⚠️ [BROWSER] Edit mode but no HRMBD_Id!');
        }

        try {
            const res = await saveMutation.mutateAsync(data);

            if (isEditMode) {
                // Check if IFSC was updated in response
                // For edit, check top-level response first (contains updated record)
                if (res?.data) {
                    const _topLevelIFSC = res.data.HRMBD_IFSCCode;
                    const topLevelId = res.data.HRMBD_Id;

                    // Try to find the updated bank in the list by ID
                    const updatedBankInList = res.data.bankdetailList?.find((bank: any) => bank.HRMBD_Id === data.HRMBD_Id);
                    const _responseBank =
                        updatedBankInList || (topLevelId === data.HRMBD_Id ? res.data : res.data.bankdetailList?.[0] || res.data);
                }
            }

            if (res?.success) {
                toast.success(res?.message || 'Bank saved successfully');
                if (!isEditMode) {
                    reset();
                }
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                console.error('❌ [BROWSER] Save failed:', res?.message);
                toast.error(res?.message || 'Failed to save bank');
            }

            if (isEditMode) {
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || error?.data?.message || 'Failed to save bank';
            console.error('🔴 [BROWSER] Error:', errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden fields for IDs */}
            {isEditMode && <input type='hidden' {...register('HRMBD_Id', { valueAsNumber: true })} />}
            <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_BankName'>
                    Bank Name <span className='text-destructive'>*</span>
                </Label>
                <InputText id='HRMBD_BankName' placeholder='Enter bank name' {...register('HRMBD_BankName', BANK_VALIDATION.bankName)} />
                {errors.HRMBD_BankName && <FormError>{errors.HRMBD_BankName.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_BranchName'>
                    Branch Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_BranchName'
                    placeholder='Enter branch name'
                    {...register('HRMBD_BranchName', BANK_VALIDATION.branchName)}
                />
                {errors.HRMBD_BranchName && <FormError>{errors.HRMBD_BranchName.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_BankAccountNo'>
                    Account Number <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_BankAccountNo'
                    placeholder='Enter account number'
                    {...register('HRMBD_BankAccountNo', BANK_VALIDATION.accountNumber)}
                />
                {errors.HRMBD_BankAccountNo && <FormError>{errors.HRMBD_BankAccountNo.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_IFSCCode'>
                    IFSC Code <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_IFSCCode'
                    placeholder='Enter IFSC code (e.g., ABCD0123456)'
                    {...register('HRMBD_IFSCCode', BANK_VALIDATION.ifscCode)}
                />
                {errors.HRMBD_IFSCCode && <FormError>{errors.HRMBD_IFSCCode.message}</FormError>}
            </div>
            <div className='col-span-full'>
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='HRMBD_BankAddress'>
                        Bank Address <span className='text-destructive'>*</span>
                    </Label>
                    <InputText
                        id='HRMBD_BankAddress'
                        placeholder='Enter bank address'
                        {...register('HRMBD_BankAddress', BANK_VALIDATION.bankAddress)}
                    />
                    {errors.HRMBD_BankAddress && <FormError>{errors.HRMBD_BankAddress.message}</FormError>}
                </div>
            </div>
            <div className='col-span-full flex gap-2'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending || (isEditMode && !isDirty)}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
                {isEditMode && !isDirty && <span className='mt-2 flex items-center text-muted-foreground text-sm'>No changes made</span>}
            </div>
        </form>
    );
}
