import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasterLeaveYear';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { useEffect, useState } from 'react';

export default function UpdateLeaveYearForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: LeaveYearDetail;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterLeaveYear(roleId);
    const [form, setForm] = useState<MasterLeaveYearInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                HRMLY_Id: selectedRow.HRMLY_Id,
                MI_Id: selectedRow.MI_Id,
                HRMLY_LeaveYear: selectedRow.HRMLY_LeaveYear,
                HRMLY_FromDate: selectedRow.HRMLY_FromDate.split('T')[0],
                HRMLY_ToDate: selectedRow.HRMLY_ToDate.split('T')[0],
                HRMLY_ActiveFlag: selectedRow.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: selectedRow.HRMLY_LeaveYearOrder
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
                <Label htmlFor='HRMLY_LeaveYear'>
                    Leave Year <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMLY_LeaveYear'
                    placeholder='e.g., 2025-2026'
                    value={form.HRMLY_LeaveYear}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMLY_LeaveYear: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_FromDate'>
                    From Date <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='HRMLY_FromDate'
                    type='date'
                    value={form.HRMLY_FromDate}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMLY_FromDate: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_ToDate'>
                    To Date <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='HRMLY_ToDate'
                    type='date'
                    value={form.HRMLY_ToDate}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMLY_ToDate: e.target.value } : f))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYearOrder'>Order</Label>
                <InputNumber
                    id='HRMLY_LeaveYearOrder'
                    placeholder='Enter order'
                    value={form.HRMLY_LeaveYearOrder}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMLY_LeaveYearOrder: Number(e.target.value) } : f))}
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
