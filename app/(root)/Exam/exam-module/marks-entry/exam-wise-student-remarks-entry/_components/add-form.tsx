'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';

import { addOrUpdateExamStudentRemarks } from '@/server/exam/exam-module/marks-entry/exam-wise-student-remarks';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IExamWiseStudentRemarksStudent } from '@/types/exam/exam-module/exam-mapping';

import { z } from 'zod';
import { ExamWiseStudentRemarksColumns } from './exam-wise-student-remarks-columns';

export const studentRemarksSchema = z.object({
    mI_Id: z.number(),
    asmcL_Id: z.number(),
    emE_Id: z.number(),
    asmaY_Id: z.number(),
    asmS_Id: z.number(),
    studentdata_Remarks: z.array(
        z.object({
            amsT_Id: z.number(),
            emeR_Remarks: z
                .string()
                .min(1, 'Remarks required')
                .max(250, 'Max 250 chars')
                .transform((val) => val ?? '') // ensures null becomes empty string
        })
    )
});

type FormFields = z.infer<typeof studentRemarksSchema>;

interface Props {
    orgId?: number;
    onSuccess?: () => void;
}

export default function AddEditStudentRemarks({ orgId = 30, onSuccess }: Props) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(studentRemarksSchema),
        mode: 'onChange',
        defaultValues: {
            mI_Id: orgId,
            asmcL_Id: 0,
            emE_Id: 0,
            asmaY_Id: 0,
            asmS_Id: 0,
            studentdata_Remarks: []
        }
    });

    const { control, handleSubmit, setValue, watch, reset } = methods;

    const [academicYears, setAcademicYears] = useState<IAcademicYearDropDown[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<IExamWiseStudentRemarksStudent[]>([]);
    const [tableProps, setTableProps] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const asmcL_Id = useWatch({ control, name: 'asmcL_Id' });
    const asmS_Id = useWatch({ control, name: 'asmS_Id' });
    const emE_Id = useWatch({ control, name: 'emE_Id' });

    const { data: academicData, error: academicError } = useAcademicYearDropdown();

    useEffect(() => {
        // Academic Years
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYears([]);
        } else if (academicData?.data && Array.isArray(academicData.data)) {
            const formattedYears: IAcademicYearDropDown[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id,
                asmaY_Year: item.asmaY_Year ?? '',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formattedYears);
        } else {
            setAcademicYears([]);
        }
    }, [academicData, academicError]);

    // ---------- Load Classes ----------
    useEffect(() => {
        if (!asmaY_Id) return;
        (async () => {
            try {
                const { data } = await getClassDropDownByAcademicYearlist(asmaY_Id);
                setClasses(Array.isArray(data) ? data : []);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load classes');
            }
        })();
    }, [asmaY_Id, setValue]);

    // ---------- Load Sections ----------
    useEffect(() => {
        if (!asmaY_Id || !asmcL_Id) return;
        (async () => {
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(asmaY_Id, asmcL_Id);
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load sections');
            }
        })();
    }, [asmaY_Id, asmcL_Id, setValue]);

    useEffect(() => {
        if (!asmaY_Id || !asmcL_Id || !asmS_Id) return;
        (async () => {
            try {
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(asmaY_Id, asmcL_Id, asmS_Id);
                setExams(Array.isArray(data) ? data : []);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load exams');
            }
        })();
    }, [asmaY_Id, asmcL_Id, asmS_Id, setValue]);

    async function handleSearch() {
        if (!asmaY_Id || !asmcL_Id || !emE_Id) {
            toast.error('Select all required fields before search');
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await getStudentsByClassSectionExam(asmaY_Id, asmcL_Id, emE_Id);
            const studentList = Array.isArray(data) ? data.map((s: any) => ({ ...s, emeR_Remarks: '' })) : [];
            setStudents(studentList);
            setTableProps(
                useDataTableProps({
                    data: studentList,
                    total: studentList.length,
                    pageIndex: 0,
                    pageSize: 10
                })
            );
            setValue(
                'studentdata_Remarks',
                studentList.map((s) => ({ amsT_Id: s.amsT_Id, emeR_Remarks: s.emeR_Remarks }))
            );
        } catch (err: any) {
            toast.error(err?.message || 'Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(data: FormFields) {
        if (!students.length) {
            toast.error('No students found to save');
            return;
        }
        try {
            const payload: FormFields = {
                ...data,
                studentdata_Remarks: students.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    emeR_Remarks: s.emeR_Remarks ?? '' // convert null to empty string
                }))
            };

            const res = await addOrUpdateExamStudentRemarks(payload);
            if (res?.success) {
                toast.success(res.message || 'Remarks saved successfully');
                reset();
                setStudents([]);
                setTableProps({});
                onSuccess?.();
            } else {
                toast.error(res?.message || 'Failed to save remarks');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Something went wrong');
        }
    }
    // inside your component
    const updateStudent = (index: number, updated: IExamWiseStudentRemarksStudent) => {
        setStudents((prev) => {
            const newStudents = [...prev];
            newStudents[index] = updated;

            // update tableProps data
            setTableProps((prevProps: any) => ({
                ...prevProps,
                data: newStudents
            }));

            return newStudents;
        });
    };

    // generate columns with callback
    const columns = ExamWiseStudentRemarksColumns(updateStudent);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-xl bg-white p-6 shadow-md'>
                <div className='grid grid-cols-2 gap-6'>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field, fieldState }) => (
                            <div>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>

                                <Select
                                    key={field.value} // <— forces remount when value changes
                                    value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                    onValueChange={(val) => field.onChange(Number(val))}>
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
                    {/* Class */}
                    <Controller
                        control={control}
                        name='asmcL_Id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                <Label className='font-medium text-sm sm:w-32'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((c) => (
                                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                    {c.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            </div>
                        )}
                    />

                    {/* Section */}
                    <Controller
                        control={control}
                        name='asmS_Id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                <Label className='font-medium text-sm sm:w-32'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((s) => (
                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            </div>
                        )}
                    />

                    {/* Exam */}
                    <Controller
                        control={control}
                        name='emE_Id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                <Label className='font-medium text-sm sm:w-32'>
                                    Exam Name <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Exam' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exams.map((e) => (
                                                <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                    {e.emE_ExamName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            </div>
                        )}
                    />
                    <div className='flex items-end'>
                        <Button type='button' onClick={handleSearch}>
                            Search Students
                        </Button>
                    </div>
                </div>

                {students.length > 0 && (
                    <div className='mt-6'>
                        <GenericDataTable {...tableProps} columns={columns} isLoading={isLoading} />
                    </div>
                )}

                <div className='flex justify-end gap-2'>
                    <Button type='submit'>Save</Button>
                    <Button type='button' variant='outline' onClick={() => reset()}>
                        Reset
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
