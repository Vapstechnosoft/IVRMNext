'use client';
import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { examLoginPrivilegesSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { addorUpdateExamLoginPrivileges } from '@/server/exam/exam-module/exam-mapping/exam-login-privilages';
import type { IAcademicYear, IClass, ISection } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof examLoginPrivilegesSchema.addOrUpdate>;

export default function AddExamLoginPrivileges({ onSuccess }: { onSuccess?: () => void }) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(examLoginPrivilegesSchema.addOrUpdate),
        defaultValues: {
            asmaY_Id: 0,
            hrmE_Id: 0,
            ivrmulF_Id: 0,
            asmcL_Id: 0,
            sectionList: [],
            subjectList: [],
            subSubjectList: [],
            entryType: '',
            remarks: '',
            elp_ActiveFlag: true
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [userLogins, setUserLogins] = useState<any[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<ISection[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [subSubjects, setSubSubjects] = useState<any[]>([]);

    const { control, reset, watch } = methods;

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                setAcademicYears([
                    { asmaY_Id: 1, asmaY_Year: '2023-24' },
                    { asmaY_Id: 2, asmaY_Year: '2024-25' }
                ]);
                setEmployees([
                    { hrmE_Id: 101, hrmE_EmployeeFirstName: 'John' },
                    { hrmE_Id: 102, hrmE_EmployeeFirstName: 'Jane' }
                ]);
                setUserLogins([
                    { ivrmulF_Id: 1, userName: 'admin' },
                    { ivrmulF_Id: 2, userName: 'teacher1' }
                ]);
                setClasses([
                    { asmcL_Id: 1, asmcL_ClassName: '9th' },
                    { asmcL_Id: 2, asmcL_ClassName: '10th' }
                ]);
                setSections([
                    { asmS_Id: 1, asmC_SectionName: 'A' },
                    { asmS_Id: 2, asmC_SectionName: 'B' }
                ]);
                setSubjects([
                    { ismS_Id: 1, ismS_SubjectName: 'Math' },
                    { ismS_Id: 2, ismS_SubjectName: 'Science' }
                ]);
                setSubSubjects([
                    { issS_Id: 1, issS_SubSubjectName: 'Algebra' },
                    { issS_Id: 2, issS_SubSubjectName: 'Physics' }
                ]);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }
        fetchDropdowns();
    }, []);

    const onSubmit = async (data: FormFields) => {
        setIsSubmitting(true);
        try {
            const res = await addorUpdateExamLoginPrivileges(data);
            if (res.success) {
                toast.success('Exam Login Privilege added successfully!');
                reset();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.message);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save privilege');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
                    {/* Academic & Employee */}
                    <div className='grid grid-cols-2 gap-6'>
                        <Controller
                            control={control}
                            name='asmaY_Id'
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label>Academic Year</Label>
                                    <Select onValueChange={(val) => field.onChange(Number(val))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((y) => (
                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />

                        <Controller
                            control={control}
                            name='hrmE_Id'
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label>Employee</Label>
                                    <Select onValueChange={(val) => field.onChange(Number(val))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Employee' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((e) => (
                                                <SelectItem key={e.hrmE_Id} value={String(e.hrmE_Id)}>
                                                    {e.hrmE_EmployeeFirstName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* Class, Sections & Subjects */}
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Class (single select) */}
                        <Controller
                            control={control}
                            name='asmcL_Id'
                            render={({ field, fieldState }) => (
                                <CustomMultiSelectBox
                                    options={classes.map((c) => ({ label: c.asmcL_ClassName, value: String(c.asmcL_Id) }))}
                                    value={field.value ? [String(field.value)] : []} // wrap single value in array
                                    onChange={(vals: string[]) => field.onChange(vals.length ? Number(vals[0]) : 0)}
                                    label='Class'
                                    height='150px'
                                    isSearchRequired={true}
                                    error={fieldState?.error?.message}
                                />
                            )}
                        />

                        {/* Sections (multi-select) */}
                        <Controller
                            control={control}
                            name='sectionList'
                            render={({ field, fieldState }) => (
                                <CustomMultiSelectBox
                                    options={sections.map((s) => ({ label: s.asmC_SectionName, value: String(s.asmS_Id) }))}
                                    value={field.value?.map((v: any) => String(v.asmS_Id)) || []}
                                    onChange={(vals: string[]) => field.onChange(sections.filter((s) => vals.includes(String(s.asmS_Id))))}
                                    label='Sections'
                                    height='150px'
                                    isSearchRequired={true}
                                    error={fieldState?.error?.message}
                                />
                            )}
                        />

                        {/* Subjects (multi-select) */}
                        <Controller
                            control={control}
                            name='subjectList'
                            render={({ field, fieldState }) => (
                                <CustomMultiSelectBox
                                    options={subjects.map((s) => ({ label: s.ismS_SubjectName, value: String(s.ismS_Id) }))}
                                    value={field.value?.map((v: any) => String(v.ismS_Id)) || []}
                                    onChange={(vals: string[]) => field.onChange(subjects.filter((s) => vals.includes(String(s.ismS_Id))))}
                                    label='Subjects'
                                    height='150px'
                                    isSearchRequired={true}
                                    error={fieldState?.error?.message}
                                />
                            )}
                        />

                        {/* Sub-Subjects (multi-select) */}
                        <Controller
                            control={control}
                            name='subSubjectList'
                            render={({ field, fieldState }) => (
                                <CustomMultiSelectBox
                                    options={subSubjects.map((s) => ({ label: s.issS_SubSubjectName, value: String(s.issS_Id) }))}
                                    value={field.value?.map((v: any) => String(v.issS_Id)) || []}
                                    onChange={(vals: string[]) =>
                                        field.onChange(subSubjects.filter((s) => vals.includes(String(s.issS_Id))))
                                    }
                                    label='Sub-Subjects'
                                    height='150px'
                                    isSearchRequired={true}
                                    error={fieldState?.error?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Remarks & Buttons */}
                    <div className='mt-4 flex flex-col gap-4'>
                        <InputText name='remarks' label='Remarks' placeholder='Enter remarks' />
                        <div className='flex gap-4'>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
