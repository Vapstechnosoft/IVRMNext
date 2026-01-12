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
    mI_Id: z.coerce.number().optional(),
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
    // Keys to force re-render of selects
    const [classKey, setClassKey] = useState(0);
    const [sectionKey, setSectionKey] = useState(0);
    const [examKey, setExamKey] = useState(0);

    // State for dropdown data
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);

    // Loading states for dropdowns
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    const [students, setStudents] = useState<IExamWiseStudentRemarksStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<IExamWiseStudentRemarksStudent[]>([]);
    const [preSelectedStudentIds, setPreSelectedStudentIds] = useState<string[]>([]);
    const [tableProps, setTableProps] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

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

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const asmcL_Id = useWatch({ control, name: 'asmcL_Id' });
    const asmS_Id = useWatch({ control, name: 'asmS_Id' });
    const emE_Id = useWatch({ control, name: 'emE_Id' });
    const { refetchAll } = useExamWiseRemarksDataGrid();

    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useAcademicYearDropdown();

    // Reset form when rowData changes
    useEffect(() => {
        if (!rowData) return;

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

        // Clear dependent states
        setClasses([]);
        setSections([]);
        setExams([]);
        setStudents([]);
        setIsStudentsGridOpen(false);

        // Force re-render of selects
        setClassKey((prev) => prev + 1);
        setSectionKey((prev) => prev + 1);
        setExamKey((prev) => prev + 1);
    }, [rowData, orgId, reset]);

    // ---------- Load Classes ----------
    useEffect(() => {
        if (!asmaY_Id || asmaY_Id === 0) {
            setClasses([]);
            setValue('asmcL_Id', 0);
            setClassKey((prev) => prev + 1);
            return;
        }

        const fetchClasses = async () => {
            setLoadingClasses(true);
            try {
                const { data } = await getClassDropDownByAcademicYearlist(asmaY_Id);
                const classData = Array.isArray(data) ? data : [];
                setClasses(classData);

                // Clear dependent data
                setSections([]);
                setExams([]);
                setStudents([]);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);

                // Force re-render
                setSectionKey((prev) => prev + 1);
                setExamKey((prev) => prev + 1);

                // If rowData exists and we have matching class, select it
                if (rowData?.asmcL_Id) {
                    const foundClass = classData.find((c) => c.asmcL_Id === rowData.asmcL_Id);
                    if (foundClass) {
                        setValue('asmcL_Id', rowData.asmcL_Id);
                    }
                } else {
                    setValue('asmcL_Id', 0);
                }

                if (classData.length === 0) {
                    toast.info('No classes found for selected academic year');
                }
            } catch {
                toast.error('Failed to load classes');
                setClasses([]);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, [asmaY_Id, setValue, rowData]);

    // ---------- Load Sections ----------
    useEffect(() => {
        if (!asmaY_Id || !asmcL_Id || asmcL_Id === 0) {
            setSections([]);
            setValue('asmS_Id', 0);
            setSectionKey((prev) => prev + 1);
            return;
        }

        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(asmaY_Id, asmcL_Id);
                const sectionData = Array.isArray(data) ? data : [];
                setSections(sectionData);

                // Clear dependent data
                setExams([]);
                setStudents([]);
                setValue('emE_Id', 0);

                // Force re-render
                setExamKey((prev) => prev + 1);

                // If rowData exists and we have matching section, select it
                if (rowData?.asmS_Id) {
                    const foundSection = sectionData.find((s) => s.asmS_Id === rowData.asmS_Id);
                    if (foundSection) {
                        setValue('asmS_Id', rowData.asmS_Id);
                    }
                } else {
                    setValue('asmS_Id', 0);
                }

                if (sectionData.length === 0) {
                    toast.info('No sections found for selected class');
                }
            } catch {
                toast.error('Failed to load sections');
                setSections([]);
            } finally {
                setLoadingSections(false);
            }
        };

        fetchSections();
    }, [asmaY_Id, asmcL_Id, setValue, rowData]);

    // ---------- Load Exams ----------
    useEffect(() => {
        if (!asmaY_Id || !asmcL_Id || !asmS_Id || asmS_Id === 0) {
            setExams([]);
            setValue('emE_Id', 0);
            setExamKey((prev) => prev + 1);
            return;
        }

        const fetchExams = async () => {
            setLoadingExams(true);
            try {
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(asmaY_Id, asmcL_Id, asmS_Id);
                const examData = Array.isArray(data) ? data : [];
                setExams(examData);

                // Clear students data
                setStudents([]);

                // If rowData exists and we have matching exam, select it
                if (rowData?.emE_Id) {
                    const foundExam = examData.find((e) => e.emE_Id === rowData.emE_Id);
                    if (foundExam) {
                        setValue('emE_Id', rowData.emE_Id);
                    }
                } else {
                    setValue('emE_Id', 0);
                }

                if (examData.length === 0) {
                    toast.info('No exams found for selected section');
                }
            } catch {
                toast.error('Failed to load exams');
                setExams([]);
            } finally {
                setLoadingExams(false);
            }
        };

        fetchExams();
    }, [asmaY_Id, asmcL_Id, asmS_Id, setValue, rowData]);

    async function handleSearch() {
        if (!asmaY_Id || !asmcL_Id || !emE_Id || !asmS_Id || asmaY_Id === 0 || asmcL_Id === 0 || emE_Id === 0 || asmS_Id === 0) {
            toast.error('Please select all required fields before search');
            return;
        }

        setIsLoading(true);
        setIsStudentsGridOpen(true);
        try {
            const { data } = await getStudentDetails(asmaY_Id, asmcL_Id, asmS_Id, emE_Id, 30);
            const studentList = Array.isArray(data) ? data.map((s: any) => ({ ...s, emeR_Remarks: s.emeR_Remarks || '' })) : [];

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
                studentList.map((s) => ({ amsT_Id: s.amsT_Id, emeR_Remarks: s.emeR_Remarks || '' }))
            );
        } catch (err: any) {
            toast.error(err?.message || 'Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(data: FormFields) {
        if (!selectedStudents.length) {
            setValidationErrors({});
            setTableProps((tp: any) => ({
                ...tp,
                lastUpdated: Date.now()
            }));
            toast.error('No students selected to save');
            return;
        }

        // Validate selected students have remarks
        const validationErrors: Record<number, string> = {};
        selectedStudents.forEach((student) => {
            if (!student.emeR_Remarks || student.emeR_Remarks.trim() === '') {
                validationErrors[student.amsT_Id] = 'Remarks are required for selected students';
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
            toast.error('Please add remarks for all selected students');
            return;
        }

        // Clear validation errors if validation passes
        setValidationErrors({});

        setIsSaving(true);
        try {
            const selectedIds = new Set(selectedStudents.map((s) => s.amsT_Id));

            const payload: FormFields = {
                ...data,
                studentdata_Remarks: students
                    .filter((s) => selectedIds.has(s.amsT_Id))
                    .map((s) => ({
                        amsT_Id: s.amsT_Id,
                        emeR_Remarks: s.emeR_Remarks?.trim() || ''
                    }))
            };

            const res = await addOrUpdateExamStudentRemarks(payload);
            if (res?.success) {
                toast.success(res.message || 'Remarks saved successfully');
                refetchAll();
                handleReset();
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
            mI_Id: orgId,
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            studentdata_Remarks: []
        });

        // Clear all state
        setClasses([]);
        setSections([]);
        setExams([]);
        setStudents([]);
        setSelectedStudents([]);
        setPreSelectedStudentIds([]);
        setTableProps({});
        setIsStudentsGridOpen(false);
        setValidationErrors({});

        // Force re-render of selects
        setClassKey((prev) => prev + 1);
        setSectionKey((prev) => prev + 1);
        setExamKey((prev) => prev + 1);
    };

    const updateStudent = (id: number, remarks: string) => {
        setStudents((prev) => {
            const updated = prev.map((s) => (s.amsT_Id === id ? { ...s, emeR_Remarks: remarks } : s));

            // Clear validation error for this student if remarks are now filled
            if (remarks && remarks.trim() !== '') {
                setValidationErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[id];
                    return newErrors;
                });
            }

            // also update table props
            setTableProps((tp: any) => ({
                ...tp,
                data: updated
            }));

            return updated;
        });
    };

    // Pass to columns
    const columns = ExamWiseStudentRemarksColumns(updateStudent, validationErrors);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-xl bg-white p-6 shadow-md'>
                <div className='grid grid-cols-2 gap-6'>
                    {/* Academic Year */}
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field, fieldState }) => (
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                <Label className='font-medium text-sm sm:w-32'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={academicYearLoading}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={academicYearLoading ? 'Loading Academic Year...' : 'Select Academic Year'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYearLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading Academic Year...
                                                </SelectItem>
                                            ) : academicYearError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading Academic Year
                                                </SelectItem>
                                            ) : academicYear?.data?.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No academic years available
                                                </SelectItem>
                                            ) : (
                                                academicYear?.data?.map((item) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
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
                                    <Select
                                        key={`class-${classKey}`}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={!asmaY_Id || asmaY_Id === 0 || loadingClasses}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingClasses
                                                        ? 'Loading classes...'
                                                        : !asmaY_Id || asmaY_Id === 0
                                                          ? 'Select Academic Year first'
                                                          : classes.length === 0
                                                            ? 'No classes available'
                                                            : 'Select Class'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingClasses ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading classes...
                                                </SelectItem>
                                            ) : classes.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No classes available
                                                </SelectItem>
                                            ) : (
                                                classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ))
                                            )}
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
                                    <Select
                                        key={`section-${sectionKey}`}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={!asmcL_Id || asmcL_Id === 0 || loadingSections}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingSections
                                                        ? 'Loading sections...'
                                                        : !asmcL_Id || asmcL_Id === 0
                                                          ? 'Select Class first'
                                                          : sections.length === 0
                                                            ? 'No sections available'
                                                            : 'Select Section'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingSections ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading sections...
                                                </SelectItem>
                                            ) : sections.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No sections available
                                                </SelectItem>
                                            ) : (
                                                sections.map((s) => (
                                                    <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))
                                            )}
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
                                    <Select
                                        key={`exam-${examKey}`}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value && field.value !== 0 ? String(field.value) : ''}
                                        disabled={!asmS_Id || asmS_Id === 0 || loadingExams}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingExams
                                                        ? 'Loading exams...'
                                                        : !asmS_Id || asmS_Id === 0
                                                          ? 'Select Section first'
                                                          : exams.length === 0
                                                            ? 'No exams available'
                                                            : 'Select Exam'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingExams ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading exams...
                                                </SelectItem>
                                            ) : exams.length === 0 ? (
                                                <SelectItem value='none' disabled>
                                                    No exams available
                                                </SelectItem>
                                            ) : (
                                                exams.map((e) => (
                                                    <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                        {e.emE_ExamName}
                                                    </SelectItem>
                                                ))
                                            )}
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
                        <Button
                            type='button'
                            onClick={handleSearch}
                            disabled={
                                !asmaY_Id ||
                                !asmcL_Id ||
                                !emE_Id ||
                                !asmS_Id ||
                                asmaY_Id === 0 ||
                                asmcL_Id === 0 ||
                                emE_Id === 0 ||
                                asmS_Id === 0
                            }>
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
                                    const selected = students.filter((s) => {
                                        return selectedRowIds.includes(s.amsT_Id.toString());
                                    });
                                    setSelectedStudents(selected);
                                }}
                                defaultSelectedRowIds={preSelectedStudentIds}
                            />
                        </div>

                        <div className='flex w-fit justify-end gap-2'>
                            <Button type='button' variant='outline' onClick={handleReset}>
                                Reset
                            </Button>
                            <Button type='submit' disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Student Remarks'}
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </FormProvider>
    );
}
