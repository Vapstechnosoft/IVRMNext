import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterBank } from '@/hooks/hrms/useMasterBank';
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
    const { saveMutation } = useMasterBank(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
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
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(isEditMode ? 'Bank updated successfully' : 'Bank added successfully');
                if (onSuccess) onSuccess();
            }
        } catch (_error) {
            toast.error(isEditMode ? 'Failed to update bank' : 'Failed to add bank');
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
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
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
