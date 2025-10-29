import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasterSpecialization';
import type { MasterSpecializationInput, SpecializationItem } from '@/types/hrms/master-specialization';
import { useEffect, useState } from 'react';

export default function UpdateSpecializationForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: SpecializationItem;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterSpecialization(roleId);
    const [form, setForm] = useState<MasterSpecializationInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                HRMSPL_Id: selectedRow.HRMSPL_Id,
                MI_Id: selectedRow.MI_Id,
                HRMSPL_SpecialisationName: selectedRow.HRMSPL_SpecialisationName,
                HRMSPL_ActiveFlg: selectedRow.HRMSPL_ActiveFlg
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
                <Label htmlFor='HRMSPL_SpecialisationName'>
                    Specialization Name <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMSPL_SpecialisationName'
                    placeholder='Enter specialization name'
                    value={form.HRMSPL_SpecialisationName}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMSPL_SpecialisationName: e.target.value } : f))}
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
