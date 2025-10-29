import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasterSpecialization';
import type { MasterSpecializationInput } from '@/types/hrms/master-specialization';
import { useState } from 'react';

export default function AddSpecializationForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterSpecialization(roleId);
    const [form, setForm] = useState<MasterSpecializationInput>({
        MI_Id: roleId,
        HRMSPL_SpecialisationName: '',
        HRMSPL_ActiveFlg: true
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

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
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            HRMSPL_SpecialisationName: e.target.value
                        }))
                    }
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
