import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasterEarningsDeductions';
import type { MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { useState } from 'react';

export default function AddEarningsDeductionsForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterEarningsDeductions(roleId);
    const [form, setForm] = useState<MasterEarningsDeductionsInput>({
        MI_Id: roleId,
        HRMED_Name: '',
        HRMED_EDTypeFlag: 'Regular',
        HRMED_EarnDedFlag: 'Earning',
        HRMED_AmountPercentFlag: 'Amount',
        HRMED_AmountPercent: '0',
        HRMED_ActiveFlag: true,
        HRMED_RoundOffFlag: 'No',
        HRMED_Order: 0
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={onSubmit}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_Name'>
                    Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMED_Name'
                    placeholder='Enter earning/deduction name'
                    value={form.HRMED_Name}
                    onChange={(e) => setForm((f) => ({ ...f, HRMED_Name: e.target.value }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_EarnDedFlag'>
                    Type <span className='text-destructive'>*</span>
                </Label>
                <select
                    id='HRMED_EarnDedFlag'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    value={form.HRMED_EarnDedFlag}
                    onChange={(e) => setForm((f) => ({ ...f, HRMED_EarnDedFlag: e.target.value }))}>
                    <option value='Earning'>Earning</option>
                    <option value='Deduction'>Deduction</option>
                </select>
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_AmountPercentFlag'>
                    Calculation Type <span className='text-destructive'>*</span>
                </Label>
                <select
                    id='HRMED_AmountPercentFlag'
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    value={form.HRMED_AmountPercentFlag}
                    onChange={(e) => setForm((f) => ({ ...f, HRMED_AmountPercentFlag: e.target.value }))}>
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
                    value={form.HRMED_AmountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, HRMED_AmountPercent: e.target.value }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_Order'>Order</Label>
                <InputNumber
                    id='HRMED_Order'
                    placeholder='Enter order'
                    value={form.HRMED_Order}
                    onChange={(e) => setForm((f) => ({ ...f, HRMED_Order: Number(e.target.value) }))}
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
