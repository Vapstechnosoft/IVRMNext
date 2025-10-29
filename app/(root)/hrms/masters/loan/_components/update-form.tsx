import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasterLoan';
import type { MasterLoanDetail, MasterLoanInput } from '@/types/hrms/master-loan';
import { useEffect, useState } from 'react';

export default function UpdateLoanForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: MasterLoanDetail;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterLoan(roleId);
    const [form, setForm] = useState<MasterLoanInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                HRMLN_Id: selectedRow.HRMLN_Id,
                MI_Id: selectedRow.MI_Id,
                HRML_LoanType: selectedRow.HRML_LoanType,
                HRML_Max: selectedRow.HRML_Max,
                HRMLN_ActiveFlag: selectedRow.HRMLN_ActiveFlag
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
                <Label htmlFor='HRML_LoanType'>
                    Loan Type <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRML_LoanType'
                    placeholder='Enter loan type'
                    value={form.HRML_LoanType}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRML_LoanType: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRML_Max'>
                    Maximum Amount <span className='text-destructive'>*</span>
                </Label>
                <InputNumber
                    id='HRML_Max'
                    placeholder='Enter maximum amount'
                    value={form.HRML_Max}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRML_Max: Number(e.target.value) } : f))}
                    required
                />
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2'>
                    Update
                </Button>
            </div>
        </form>
    );
}
