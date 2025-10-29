import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasterEarningsDeductions';
import type { EarningsDeductionDetail, MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { useEffect, useState } from 'react';

export default function UpdateEarningsDeductionsForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: EarningsDeductionDetail;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterEarningsDeductions(roleId);
    const [form, setForm] = useState<MasterEarningsDeductionsInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                HRMED_Id: selectedRow.HRMED_Id,
                MI_Id: selectedRow.MI_Id,
                HRMED_Name: selectedRow.HRMED_Name,
                HRMED_EDTypeFlag: selectedRow.HRMED_EDTypeFlag,
                HRMED_EarnDedFlag: selectedRow.HRMED_EarnDedFlag,
                HRMED_AmountPercentFlag: selectedRow.HRMED_AmountPercentFlag,
                HRMED_AmountPercent: selectedRow.HRMED_AmountPercent,
                HRMED_ActiveFlag: selectedRow.HRMED_ActiveFlag,
                HRMED_RoundOffFlag: selectedRow.HRMED_RoundOffFlag,
                HRMED_Order: selectedRow.HRMED_Order
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
                <Label htmlFor='HRMED_Name'>
                    Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMED_Name'
                    placeholder='Enter earning/deduction name'
                    value={form.HRMED_Name}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMED_Name: e.target.value } : f))}
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMED_EarnDedFlag: e.target.value } : f))}>
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMED_AmountPercentFlag: e.target.value } : f))}>
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMED_AmountPercent: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMED_Order'>Order</Label>
                <InputNumber
                    id='HRMED_Order'
                    placeholder='Enter order'
                    value={form.HRMED_Order}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMED_Order: Number(e.target.value) } : f))}
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
