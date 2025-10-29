import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGender } from '@/hooks/hrms/useMasterGender';
import type { GenderItem, MasterGenderInput } from '@/types/hrms/master-gender';
import { useEffect, useState } from 'react';

export default function UpdateGenderForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: GenderItem;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterGender(roleId);
    const [form, setForm] = useState<MasterGenderInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                IVRMMG_Id: selectedRow.IVRMMG_Id,
                MI_Id: selectedRow.MI_Id,
                IVRMMG_GenderName: selectedRow.IVRMMG_GenderName,
                IVRMMG_ActiveFlag: selectedRow.IVRMMG_ActiveFlag
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
                <Label htmlFor='IVRMMG_GenderName'>
                    Gender Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='IVRMMG_GenderName'
                    placeholder='Enter gender name'
                    value={form.IVRMMG_GenderName}
                    onChange={(e) => setForm((f) => (f ? { ...f, IVRMMG_GenderName: e.target.value } : f))}
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
