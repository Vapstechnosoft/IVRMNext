import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterMaritalStatus } from '@/hooks/hrms/useMasterMaritalStatus';
import type { MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import { useState } from 'react';

export default function AddMaritalStatusForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterMaritalStatus(roleId);
    const [form, setForm] = useState<MasterMaritalStatusInput>({
        MI_Id: roleId,
        IVRMMMS_MaritalStatus: '',
        IVRMMMS_ActiveFlag: true
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={onSubmit}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='IVRMMMS_MaritalStatus'>
                    Marital Status <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='IVRMMMS_MaritalStatus'
                    placeholder='Enter marital status'
                    value={form.IVRMMMS_MaritalStatus}
                    onChange={(e) => setForm((f) => ({ ...f, IVRMMMS_MaritalStatus: e.target.value }))}
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
