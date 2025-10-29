import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasterLeaveYear';
import type { MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { useState } from 'react';

export default function AddLeaveYearForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterLeaveYear(roleId);
    const [form, setForm] = useState<MasterLeaveYearInput>({
        MI_Id: roleId,
        HRMLY_LeaveYear: '',
        HRMLY_FromDate: '',
        HRMLY_ToDate: '',
        HRMLY_ActiveFlag: true,
        HRMLY_LeaveYearOrder: 1
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

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
                    onChange={(e) => setForm((f) => ({ ...f, HRMLY_LeaveYear: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, HRMLY_FromDate: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, HRMLY_ToDate: e.target.value }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYearOrder'>Order</Label>
                <InputNumber
                    id='HRMLY_LeaveYearOrder'
                    placeholder='Enter order'
                    value={form.HRMLY_LeaveYearOrder}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            HRMLY_LeaveYearOrder: Number(e.target.value)
                        }))
                    }
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
