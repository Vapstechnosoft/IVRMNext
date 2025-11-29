'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';

import { addOrUpdateExamStudentRemarks, getStudentDetails } from '@/server/exam/exam-module/marks-entry/exam-wise-student-remarks';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IExamWiseRemarksGrid, IExamWiseStudentRemarksStudent } from '@/types/exam/exam-module/exam-mapping';

import { useExamWiseRemarksDataGrid } from '@/hooks/exam/exammodule/marks-entry';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { z } from 'zod';
import { ExamWiseStudentRemarksColumns } from './exam-wise-student-remarks-columns';
export const studentRemarksSchema = z.object({
    mI_Id: z.coerce.number().optional(), // org id (optional)
    asmcL_Id: z.coerce.number(),
    emE_Id: z.coerce.number(),
    asmaY_Id: z.coerce.number(),
    asmS_Id: z.coerce.number(),

    studentdata_Remarks: z
        .array(
            z.object({
                amsT_Id: z.coerce.number(),
                emeR_Remarks: z
                    .string()
                    .max(250, 'Max 250 chars')
                    .nullable()
                    .transform((val) => val ?? '')
            })
        )
        .default([])
});

type FormFields = z.infer<typeof studentRemarksSchema>;

interface Props {
    orgId?: number;
    onSuccess?: () => void;
    rowData?: IExamWiseRemarksGrid;
}

export default function AddEditStudentRemarks({ orgId = 30, onSuccess, rowData }: Props) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(studentRemarksSchema),
        mode: 'onChange',
        defaultValues: {
            mI_Id: orgId,
            asmcL_Id: rowData?.asmcL_Id ?? 0,
            emE_Id: rowData?.emE_Id ?? 0,
            asmaY_Id: rowData?.asmaY_Id ?? 0,
            asmS_Id: rowData?.asmS_Id ?? 0,
            studentdata_Remarks: []
        }
    });

    const { control, handleSubmit, setValue, watch, reset } = methods;

    const [academicYears, setAcademicYears] = useState<IAcademicYearDropDown[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<IExamWiseStudentRemarksStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<IExamWiseStudentRemarksStudent[]>([]);
    const [preSelectedStudentIds, setPreSelectedStudentIds] = useState<string[]>([]);
    const [tableProps, setTableProps] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const asmcL_Id = useWatch({ control, name: 'asmcL_Id' });
    const asmS_Id = useWatch({ control, name: 'asmS_Id' });
    const emE_Id = useWatch({ control, name: 'emE_Id' });

    const { data: academicData, error: academicError } = useAcademicYearDropdown();
    const { refetchAll } = useExamWiseRemarksDataGrid();
    useEffect(() => {
        if (!rowData) return;
        handleSearch();
        reset(
            {
                mI_Id: orgId,
                asmcL_Id: rowData.asmcL_Id ?? 0,
                emE_Id: rowData.emE_Id ?? 0,
                asmaY_Id: rowData.asmaY_Id ?? 0,
                asmS_Id: rowData.asmS_Id ?? 0,
                studentdata_Remarks: []
            },
            { keepDirty: false }
        );
    }, [rowData, classes, sections, exams]);

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
        if (!asmaY_Id || !asmcL_Id || !emE_Id || !asmS_Id) {
            if (!rowData) {
                toast.error('Select all required fields before search');
            }
            return;
        }
        setIsLoading(true);
        setIsStudentsGridOpen(true);
        try {
            const { data } = await getStudentDetails(asmaY_Id, asmcL_Id, asmS_Id, emE_Id, 30);
            const studentList = Array.isArray(data) ? data.map((s: any) => ({ ...s, emeR_Remarks: s.emeR_Remarks })) : [];
            const preSelectedStudentIds = studentList.reduce<string[]>((acc, s, ind) => {
                if (s.emeR_Remarks && s.emeR_Remarks.trim().length > 0) {
                    acc.push(ind.toString());
                }
                return acc;
            }, []);

            setPreSelectedStudentIds(preSelectedStudentIds);
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
        if (!selectedStudents.length) {
            toast.error('No students found to save');
            return;
        }

        setIsSaving(true);
        try {
            const selectedIds = new Set(selectedStudents.map((s) => s.amsT_Id));

            const payload: FormFields = {
                ...data,
                studentdata_Remarks: students
                    .filter((s) => selectedIds.has(s.amsT_Id)) // take only selected students
                    .map((s) => ({
                        amsT_Id: s.amsT_Id,
                        emeR_Remarks: s.emeR_Remarks?.trim() || '' // take updated remarks from students[]
                    }))
            };

            const res = await addOrUpdateExamStudentRemarks(payload);
            if (res?.success) {
                toast.success(res.message || 'Remarks saved successfully');
                refetchAll();
                reset();
                setStudents([]);
                setTableProps({});
                onSuccess?.();
            } else {
                toast.error(res?.message || 'Failed to save remarks');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Something went wrong');
        } finally {
            setIsSaving(false);
            setIsStudentsGridOpen(false);
        }
    }

    const handleReset = () => {
        reset({
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0
        });
        setStudents([]);
    };

    const updateStudent = (id: number, remarks: string) => {
        setStudents((prev) => {
            const updated = prev.map((s) => (s.amsT_Id === id ? { ...s, emeR_Remarks: remarks } : s));

            // also update table props
            setTableProps((tp: any) => ({
                ...tp,
                data: updated
            }));

            return updated;
        });
    };

    // Pass to columns
    const columns = ExamWiseStudentRemarksColumns(updateStudent);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-xl bg-white p-6 shadow-md'>
                <div className='grid grid-cols-2 gap-6'>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-7 sm:flex-row sm:items-center'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
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
                                </div>

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
                    <div className='col-span-2 flex w-fit items-center justify-center gap-3'>
                        <Button type='button' variant='outline' onClick={handleReset}>
                            Reset
                        </Button>
                        <Button type='button' onClick={handleSearch}>
                            Search Students
                        </Button>
                    </div>
                </div>

                {isStudentsGridOpen && (
                    <>
                        <div className='mt-6'>
                            <GenericDataTable
                                {...tableProps}
                                columns={columns}
                                isLoading={isLoading}
                                onRowSelectionChange={(selectedRows: IExamWiseStudentRemarksStudent[]) => {
                                    const selectedRowIds = selectedRows.map((r) => String(r.amsT_Id));
                                    const selected = students.filter((s, index) => {
                                        const isSelected = selectedRowIds.includes(s.amsT_Id.toString());
                                        return isSelected;
                                    });

                                    setSelectedStudents(selected);
                                    setPreSelectedStudentIds(preSelectedStudentIds);

                                    setSelectedStudents(selected);
                                }}
                                defaultSelectedRowIds={preSelectedStudentIds}
                            />
                        </div>

                        <div className='flex w-fit justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={() => handleReset}>
                                Reset
                            </Button>
                            <Button type='submit'>{isSaving ? 'Saving...' : 'Save Student Remarks'}</Button>
                        </div>
                    </>
                )}
            </form>
        </FormProvider>
    );
}
