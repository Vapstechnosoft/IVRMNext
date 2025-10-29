import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGender } from '@/hooks/hrms/useMasterGender';
import type { MasterGenderInput } from '@/types/hrms/master-gender';
import { useState } from 'react';

export default function AddGenderForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterGender(roleId);
    const [form, setForm] = useState<MasterGenderInput>({
        MI_Id: roleId,
        IVRMMG_GenderName: '',
        IVRMMG_ActiveFlag: true
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={onSubmit}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='IVRMMG_GenderName'>
                    Gender Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='IVRMMG_GenderName'
                    placeholder='Enter gender name'
                    value={form.IVRMMG_GenderName}
                    onChange={(e) => setForm((f) => ({ ...f, IVRMMG_GenderName: e.target.value }))}
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
