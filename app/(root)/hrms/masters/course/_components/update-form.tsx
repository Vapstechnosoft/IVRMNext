import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterCourse } from '@/hooks/hrms/useMasterCourse';
import type { CourseDetail, MasterCourseInput } from '@/types/hrms/master-course';
import { useEffect, useState } from 'react';

export default function UpdateCourseForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: CourseDetail;
    onSuccess?: () => void;
}) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterCourse(roleId);
    const [form, setForm] = useState<MasterCourseInput | null>(null);

    useEffect(() => {
        if (selectedRow) {
            setForm({
                HRMC_Id: selectedRow.HRMC_Id,
                MI_Id: selectedRow.MI_Id,
                HRMC_QulaificationName: selectedRow.HRMC_QulaificationName,
                HRMC_QualificationDesc: selectedRow.HRMC_QualificationDesc,
                HRMC_Order: selectedRow.HRMC_Order,
                HRMC_ActiveFlag: selectedRow.HRMC_ActiveFlag,
                HRMC_DefaultQualFag: selectedRow.HRMC_DefaultQualFag,
                HRMC_SpecialisationFlag: selectedRow.HRMC_SpecialisationFlag
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
                <Label htmlFor='HRMC_QulaificationName'>
                    Qualification Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                    id='HRMC_QulaificationName'
                    placeholder='Enter qualification name'
                    value={form.HRMC_QulaificationName}
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMC_QulaificationName: e.target.value } : f))}
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMC_QualificationDesc: e.target.value } : f))}
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
                    onChange={(e) => setForm((f) => (f ? { ...f, HRMC_Order: Number(e.target.value) } : f))}
                />
            </div>
            <div className='flex items-center gap-4 pt-7'>
                <label className='flex items-center gap-2'>
                    <Checkbox
                        checked={form.HRMC_DefaultQualFag}
                        onCheckedChange={(checked) => setForm((f) => (f ? { ...f, HRMC_DefaultQualFag: !!checked } : f))}
                    />
                    <span>Default Qualification</span>
                </label>
                <label className='flex items-center gap-2'>
                    <Checkbox
                        checked={form.HRMC_SpecialisationFlag}
                        onCheckedChange={(checked) => setForm((f) => (f ? { ...f, HRMC_SpecialisationFlag: !!checked } : f))}
                    />
                    <span>Has Specialization</span>
                </label>
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2'>
                    Update
                </Button>
            </div>
        </form>
    );
}
