'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { vvehpc_examreportcardSchema } from '@/schemas/exam/exam-module/reports';

import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof vvehpc_examreportcardSchema.addOrUpdate> & {
    applicableFlag: boolean;
    nonApplicableFlag: boolean;
    page_size: number;
};

export default function ProgressCardReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(vvehpc_examreportcardSchema.addOrUpdate),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_AdmNo: number; amsT_Id: number; studentName?: string | null; amsT_FatherName?: string | null; amsT_DOB?: string | null; amaY_RollNo?: number | null }[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const studentList = useWatch({ control, name: 'studentList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [_loadingStudents, setLoadingStudents] = useState(false);

    // Store selected display names directly to avoid find() returning undefined
    const [selectedClassNameState, setSelectedClassNameState] = useState<string>('');
    const [selectedSectionNameState, setSelectedSectionNameState] = useState<string>('');
    const [selectedExamNameState, setSelectedExamNameState] = useState<string>('');
    const [selectedYearNameState, setSelectedYearNameState] = useState<string>('');

    const hasStudentsSelected = Array.isArray(studentList) && studentList.length > 0;

    // Academic Year (GET /fee_class_category/academicyearlist via useAcademicYearDropdown)
    useEffect(() => {
        if (academicData) {
            const rawList: any[] = Array.isArray(academicData)
                ? academicData
                : Array.isArray(academicData?.data)
                ? academicData.data
                : Array.isArray(academicData?.academicyearlist)
                ? academicData.academicyearlist
                : [];
            const formatted = rawList.map((i: any) => ({
                asmaY_Id: i.asmaY_Id ?? i.ASMAY_Id ?? 0,
                asmaY_Year: i.asmaY_Year ?? i.ASMAY_Year ?? ''
            }));
            setAcademicYears(formatted);
        }
    }, [academicData]);

    // Class (GET /exam_master_category/class_drop_down_by_academic_year_list/{asmaY_Id})
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const res: any = await getClassDropDownByAcademicYearlist(selectedYear);
                const rawList = Array.isArray(res) ? res : res?.data || res?.classlist || [];
                setClasses(rawList.map((c: any) => ({
                    asmcL_Id: c.asmcL_Id ?? c.ASMCL_Id ?? 0,
                    asmcL_ClassName: c.asmcL_ClassName ?? c.ASMCL_ClassName ?? ''
                })));
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setAllStudentsSelected(false);
            } catch (err) {
                console.error('Error loading classes:', err);
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    // Section (GET /exam_master_category/sections_drop_down_by_class_list/{asmcL_Id}/{asmaY_Id})
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const res: any = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                const rawList = Array.isArray(res) ? res : res?.data || res?.sectionlist || [];
                setSections(rawList.map((s: any) => ({
                    asmS_Id: s.asmS_Id ?? s.ASMS_Id ?? 0,
                    asmC_SectionName: s.asmC_SectionName ?? s.ASMC_SectionName ?? ''
                })));
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setAllStudentsSelected(false);
            } catch (err) {
                console.error('Error loading sections:', err);
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // Exam & Students (GET /exam_master/... & GET /exam_master_category/students_drop_down_by_year_class_section_list...)
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                setLoadingExams(true);

                const [studRes, examRes]: [any, any] = await Promise.all([
                    getStudentsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).catch(() => null),
                    getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).catch(() => null)
                ]);

                // Students List
                const studList = Array.isArray(studRes) ? studRes : studRes?.data || studRes?.studentlist || [];
                const validStudents = studList.filter((s: any) => !!(s?.amsT_Id || s?.AMST_Id));
                setStudents(validStudents.map((s: any) => ({
                    amsT_Id: s.amsT_Id ?? s.AMST_Id,
                    amsT_AdmNo: s.amsT_AdmNo ?? s.AMST_AdmNo,
                    studentName: s.studentName || s.studentname || `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || s.AMST_MiddleName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim(),
                    amsT_FatherName: s.amsT_FatherName ?? s.AMST_FatherName ?? s.fatherName ?? null,
                    amsT_DOB: s.amsT_DOB ?? s.AMST_DOB ?? null,
                    amaY_RollNo: s.amaY_RollNo ?? s.AMAY_RollNo ?? null
                })));
                setValue('studentList', []);
                setAllStudentsSelected(false);

                // Exams List
                const examList = Array.isArray(examRes) ? examRes : examRes?.data || examRes?.examlist || [];
                setExams(examList.map((e: any) => ({
                    emE_Id: e.emE_Id ?? e.EME_Id ?? 0,
                    emE_ExamName: e.emE_ExamName ?? e.EME_ExamName ?? ''
                })));
                setValue('emE_Id', 0);
            } catch (err) {
                console.error('Error loading exams and students:', err);
                toast.error('Failed to load filter options');
            } finally {
                setLoadingStudents(false);
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: FormFields) => {
        if (!hasStudentsSelected) {
            toast.error('Please select at least one student');
            return;
        }

        // Prefer stored display names (set on dropdown change) over find() lookup
        const selectedClassObj = classes.find((c) => c.asmcL_Id === data.asmcL_Id);
        const selectedSectionObj = sections.find((s) => s.asmS_Id === data.asmS_Id);
        const selectedExamObj = exams.find((e) => e.emE_Id === data.emE_Id);
        const selectedYearObj = academicYears.find((y) => y.asmaY_Id === data.asmaY_Id);

        const resolvedClassName = selectedClassNameState || selectedClassObj?.asmcL_ClassName || '';
        const resolvedSectionName = selectedSectionNameState || selectedSectionObj?.asmC_SectionName || '';
        const resolvedExamName = selectedExamNameState || selectedExamObj?.emE_ExamName || '';
        const resolvedYearName = selectedYearNameState || selectedYearObj?.asmaY_Year || '';

        const currentDateTime = new Date().toISOString();
        const studentArr = data.studentList.map((s) => ({
            amsT_Id: s.amsT_Id,
            AMST_Id: s.amsT_Id,
            studentName: s.studentName,
            amsT_AdmNo: s.amsT_AdmNo,
            amsT_FatherName: (s as any).amsT_FatherName ?? null,
            amsT_DOB: (s as any).amsT_DOB ?? null,
            amaY_RollNo: (s as any).amaY_RollNo ?? null
        }));
        const payload: any = {
            asmaY_Id: data.asmaY_Id,
            asmcL_Id: data.asmcL_Id,
            asmS_Id: data.asmS_Id,
            emE_Id: data.emE_Id,
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: data.asmS_Id,
            EME_Id: data.emE_Id,
            selectedClassName: resolvedClassName,
            selectedSectionName: resolvedSectionName,
            selectedExamName: resolvedExamName,
            selectedYearName: resolvedYearName,
            selectedStudents: data.studentList,
            amsT_Ids: data.studentList.map((s) => s.amsT_Id).join(','),
            temp_Amstids: studentArr,
            Temp_AmstIds: studentArr,
            studentlist: studentArr,
            fromDate: currentDateTime,
            toDate: currentDateTime
        };
        console.log('[VVEHPC ICSE] Payload class/section:', resolvedClassName, '/', resolvedSectionName);
        if (onSuccess) {
            await onSuccess(payload);
        }
    };
    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue('studentList', [...students], { shouldValidate: true });
            setAllStudentsSelected(true);
        } else {
            setValue('studentList', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    const handleStudentChange = (selectedValues: string[]) => {
        const selected = students.filter((s) => selectedValues.includes(s.amsT_Id.toString()));
        setValue('studentList', selected, { shouldValidate: true });
        setAllStudentsSelected(selected.length === students.length && students.length > 0);
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-6'>
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
                                                    key={field.value}
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        const yr = academicYears.find((y) => String(y.asmaY_Id) === v);
                                                        setSelectedYearNameState(yr?.asmaY_Year || '');
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading ? (
                                                            <SelectItem value='0' disabled>
                                                                Academic Year is loading...
                                                            </SelectItem>
                                                        ) : academicYears.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Academic Year found
                                                            </SelectItem>
                                                        ) : (
                                                            academicYears.map((y) => (
                                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                    {y.asmaY_Year}
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
                                                    key={field.value}
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        const cls = classes.find((c) => String(c.asmcL_Id) === v);
                                                        setSelectedClassNameState(cls?.asmcL_ClassName || '');
                                                        setSelectedSectionNameState('');
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingClasses ? (
                                                            <SelectItem value='0' disabled>
                                                                Classes are loading...
                                                            </SelectItem>
                                                        ) : classes.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Classes found
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
                                                    key={field.value}
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        const sec = sections.find((s) => String(s.asmS_Id) === v);
                                                        setSelectedSectionNameState(sec?.asmC_SectionName || '');
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingSections ? (
                                                            <SelectItem value='0' disabled>
                                                                Sections are loading...
                                                            </SelectItem>
                                                        ) : sections.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Sections found
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
                                                    key={field.value}
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        const exam = exams.find((e) => String(e.emE_Id) === v);
                                                        setSelectedExamNameState(exam?.emE_ExamName || '');
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Exam' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingExams ? (
                                                            <SelectItem value='0' disabled>
                                                                Exams are loading...
                                                            </SelectItem>
                                                        ) : exams.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Exams found
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
                            </div>

                            <div className='space-y-6'>
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='studentList'
                                            render={({ field, fieldState }) => (
                                                <CustomMultiSelectBox
                                                    options={students.map((s) => ({
                                                        label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                        value: s.amsT_Id.toString()
                                                    }))}
                                                    onChange={handleStudentChange}
                                                    value={field.value?.map((s: any) => s.amsT_Id.toString()) ?? []}
                                                    placeholder='Select Students'
                                                    height='200px'
                                                    isSearchRequired
                                                    error={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='my-6 border-gray-300' />

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || !hasStudentsSelected}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setStudents([]);
                                }}
                                className='min-w-[100px]'>
                                Clear
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
