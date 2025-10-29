import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasterLoan';
import type { MasterLoanInput } from '@/types/hrms/master-loan';
import { useState } from 'react';

export default function AddLoanForm({ onSuccess }: { onSuccess?: () => void }) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterLoan(roleId);
    const [form, setForm] = useState<MasterLoanInput>({
        MI_Id: roleId,
        HRML_LoanType: '',
        HRML_Max: 0,
        HRMLN_ActiveFlag: true
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

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
                    onChange={(e) => setForm((f) => ({ ...f, HRML_LoanType: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, HRML_Max: Number(e.target.value) }))}
                    required
                />
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2'>
                    Save
                </Button>
            </div>
        </form>
    );
}
