import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterBank } from '@/hooks/hrms/useMasterBank';
import type { BankItem, MasterBankInput } from '@/types/hrms/master-bank';
import { useEffect, useState } from 'react';

export default function UpdateBankForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: BankItem;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterBank(roleId);
    const [form, setForm] = useState<MasterBankInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
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
    }, [selectedRow]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

    if (!form) return null;

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={onSubmit}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_BankName'>
                    Bank Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_BankName'
                    placeholder='Enter bank name'
                    value={form.HRMBD_BankName}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMBD_BankName: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_BranchName'>
                    Branch Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_BranchName'
                    placeholder='Enter branch name'
                    value={form.HRMBD_BranchName}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMBD_BranchName: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_BankAccountNo'>
                    Account Number <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_BankAccountNo'
                    placeholder='Enter account number'
                    value={form.HRMBD_BankAccountNo}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMBD_BankAccountNo: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMBD_IFSCCode'>
                    IFSC Code <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMBD_IFSCCode'
                    placeholder='Enter IFSC code'
                    value={form.HRMBD_IFSCCode}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMBD_IFSCCode: e.target.value } : f))}
                    required
                />
            </div>
            <div className='col-span-full'>
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='HRMBD_BankAddress'>
                        Bank Address <span className='text-destructive'>*</span>
                    </Label>
                    <InputText
                        id='HRMBD_BankAddress'
                        placeholder='Enter bank address'
                        value={form.HRMBD_BankAddress}
                        onChange={(e) => setForm((f) => (f ? { ...f, HRMBD_BankAddress: e.target.value } : f))}
                        required
                    />
                </div>
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2'>
                    Update
                </Button>
            </div>
        </form>
    );
}
