import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterProfessionalTax } from '@/hooks/hrms/useMasterProfessionalTax';
import type { MasterProfessionalTaxInput, ProfessionalTaxDetail } from '@/types/hrms/master-professional-tax';
import { useEffect, useState } from 'react';

export default function UpdateProfessionalTaxForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: ProfessionalTaxDetail;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterProfessionalTax(roleId);
    const [form, setForm] = useState<MasterProfessionalTaxInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                HRMPT_Id: selectedRow.HRMPT_Id,
                MI_Id: selectedRow.MI_Id,
                HRMPT_SalaryFrom: selectedRow.HRMPT_SalaryFrom,
                HRMPT_SalaryTo: selectedRow.HRMPT_SalaryTo,
                HRMPT_PTax: selectedRow.HRMPT_PTax,
                HRMPT_ActiveFlag: selectedRow.HRMPT_ActiveFlag
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
                <Label htmlFor='HRMPT_SalaryFrom'>
                    Salary From <span className='text-destructive'>*</span>
                </Label>
                <InputNumber
                    id='HRMPT_SalaryFrom'
                    placeholder='Enter salary from amount'
                    value={form.HRMPT_SalaryFrom}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMPT_SalaryFrom: Number(e.target.value) } : f))}
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMPT_SalaryTo: Number(e.target.value) } : f))}
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMPT_PTax: Number(e.target.value) } : f))}
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
