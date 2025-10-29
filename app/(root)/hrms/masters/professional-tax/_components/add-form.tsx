import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterProfessionalTax } from '@/hooks/hrms/useMasterProfessionalTax';
import type { MasterProfessionalTaxInput } from '@/types/hrms/master-professional-tax';
import { useState } from 'react';

export default function AddProfessionalTaxForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterProfessionalTax(roleId);
    const [form, setForm] = useState<MasterProfessionalTaxInput>({
        MI_Id: roleId,
        HRMPT_SalaryFrom: 0,
        HRMPT_SalaryTo: 0,
        HRMPT_PTax: 0,
        HRMPT_ActiveFlag: true
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={onSubmit}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMPT_SalaryFrom'>
                    Salary From <span className='text-destructive'>*</span>
                </Label>
                <InputNumber
                    id='HRMPT_SalaryFrom'
                    placeholder='Enter salary from amount'
                    value={form.HRMPT_SalaryFrom}
                    onChange={(e) => setForm((f) => ({ ...f, HRMPT_SalaryFrom: Number(e.target.value) }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMPT_SalaryTo'>
                    Salary To <span className='text-destructive'>*</span>
                </Label>
                <InputNumber
                    id='HRMPT_SalaryTo'
                    placeholder='Enter salary to amount'
                    value={form.HRMPT_SalaryTo}
                    onChange={(e) => setForm((f) => ({ ...f, HRMPT_SalaryTo: Number(e.target.value) }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMPT_PTax'>
                    Professional Tax Amount <span className='text-destructive'>*</span>
                </Label>
                <InputNumber
                    id='HRMPT_PTax'
                    placeholder='Enter professional tax amount'
                    value={form.HRMPT_PTax}
                    onChange={(e) => setForm((f) => ({ ...f, HRMPT_PTax: Number(e.target.value) }))}
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
