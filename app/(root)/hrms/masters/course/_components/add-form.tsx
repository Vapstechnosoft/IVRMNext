import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterCourse } from '@/hooks/hrms/useMasterCourse';
import type { MasterCourseInput } from '@/types/hrms/master-course';
import { useState } from 'react';

export default function AddCourseForm({
    onSuccess
}: {
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterCourse(roleId);
    const [form, setForm] = useState<MasterCourseInput>({
        MI_Id: roleId,
        HRMC_QulaificationName: '',
        HRMC_QualificationDesc: '',
        HRMC_Order: 0,
        HRMC_ActiveFlag: true,
        HRMC_DefaultQualFag: false,
        HRMC_SpecialisationFlag: false
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await saveMutation.mutateAsync(form);
        if (res?.success && onSuccess) onSuccess();
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={onSubmit}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMC_QulaificationName'>
                    Qualification Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='HRMC_QulaificationName'
                    placeholder='Enter qualification name'
                    value={form.HRMC_QulaificationName}
                    onChange={(e) => setForm((f) => ({ ...f, HRMC_QulaificationName: e.target.value }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMC_QualificationDesc'>
                    Description <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='HRMC_QualificationDesc'
                    placeholder='Enter description'
                    value={form.HRMC_QualificationDesc}
                    onChange={(e) => setForm((f) => ({ ...f, HRMC_QualificationDesc: e.target.value }))}
                    required
                />
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMC_Order'>Order</Label>
                <Input
                    id='HRMC_Order'
                    type='number'
                    placeholder='Enter order'
                    value={form.HRMC_Order}
                    onChange={(e) => setForm((f) => ({ ...f, HRMC_Order: Number(e.target.value) }))}
                />
            </div>
            <div className='flex items-center gap-4 pt-7'>
                <label className='flex items-center gap-2'>
                    <Checkbox
                        checked={form.HRMC_DefaultQualFag}
                        onCheckedChange={(checked) => setForm((f) => ({ ...f, HRMC_DefaultQualFag: !!checked }))}
                    />
                    <span>Default Qualification</span>
                </label>
                <label className='flex items-center gap-2'>
                    <Checkbox
                        checked={form.HRMC_SpecialisationFlag}
                        onCheckedChange={(checked) => setForm((f) => ({ ...f, HRMC_SpecialisationFlag: !!checked }))}
                    />
                    <span>Has Specialization</span>
                </label>
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2'>
                    Save
                </Button>
            </div>
        </form>
    );
}
