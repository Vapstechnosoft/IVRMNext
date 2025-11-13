'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterGrade } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { ExamSubjectWizardSchema, SubSubjectSubExamSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getCategoryDropDownByAcademicYearlist } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import {
    addOrUpdateExamSubjectWizard,
    getSubSubjectSubExamList,
    getSubjectsByCategory
} from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import { getExamsByCategoryandAcademicYear } from '@/server/exam/exam-module/masters/exam';
import { getMasterSubExamDropdownList } from '@/server/exam/exam-module/masters/sub-exam';
import { getMasterSubSubjectDropdownList } from '@/server/exam/exam-module/masters/sus-subject';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';
import type { ICategory, IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import SubExamModal from './subexam-model';
import SubjectTable from './subject-table';
import SubSubjectModal from './subsubject-modal';
import SubSubjectSubExamModal from './subsubject-subexam-model';

type FormFields = z.infer<typeof ExamSubjectWizardSchema.addOrUpdate>;

/**
 * AddExamSubjectWizard
 *
 * - Builds the final payload to match the expected API structure.
 * - Converts date strings into `YYYY-MM-DDT00:00:00` format required by backend.
 * - Keeps all UI & loader behaviour intact.
 */
export default function AddExamSubjectWizard({ onSuccess, rowData }: { onSuccess?: () => void; rowData?: IExamSubjectWizard }) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(ExamSubjectWizardSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            EYCE_Id: 0,
            EYC_Id: undefined,
            EMGR_Id: undefined,
            EYCE_SubExamFlg: false,
            EYCE_SubSubjectFlg: false,
            EYCE_ActiveFlg: true,
            EYCE_AttendanceFromDate: '',
            EYCE_AttendanceToDate: '',
            exams_list: [],
            yearly_category_exam_subjects: [],
            exm_subject_subexams_list: [],
            exm_subject_subsubjects_list: [],
            exm_subject_subsubjects_subexam: [],
            Temp_Subject_Order: [],
            EYCE_BestOfApplicableFlg: false,
            EYCE_BestOf: undefined,
            EMCA_Id: undefined
        }
    });

    const { watch, setValue, getValues, handleSubmit, formState, trigger } = methods;
    const { errors, isSubmitting } = formState;

    // dropdown states
    const [academicYears, setAcademicYears] = useState<IAcademicYearDropDown[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [exams, setExams] = useState<{ EME_Id: number; EME_ExamName: string; checked?: boolean }[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [gradeList, setGradeList] = useState<IMasterGrade[]>([]);

    const watchYear = watch('ASMAY_Id');
    const watchCategory = watch('EYC_Id');
    const watchEMCA_ID = watch('EMCA_Id');
    const watchSubExam = watch('EYCE_SubExamFlg');
    const watchSubSubject = watch('EYCE_SubSubjectFlg');
    const watchGrade = watch('EMGR_Id');

    // modals
    const [subExamModalState, setSubExamModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [subSubjectModalState, setSubSubjectModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [subSubjectSubExamModalState, setSubSubjectSubExamModalState] = useState<{ open: boolean; subject?: any }>({ open: false });

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: gradeData, isLoading: loadingGrade, error: gradeError } = useMasterGrade();
    // populate controlled dropdowns on mount / when data arrives
    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYears([]);
        } else if (academicData?.data && Array.isArray(academicData.data)) {
            const formattedYears: IAcademicYearDropDown[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id?.toString() ?? '',
                asmaY_Year: item.asmaY_Year ?? '',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formattedYears);
        } else {
            setAcademicYears([]);
        }

        if (gradeError) {
            toast.error(gradeError.message || 'Error fetching grades');
            setGradeList([]);
        } else if (gradeData?.data && Array.isArray(gradeData.data)) {
            const formattedGrades: IMasterGrade[] = gradeData.data.map((item: any) => ({
                emgR_Id: item.emgR_Id?.toString() ?? '',
                emgR_GradeName: item.emgR_GradeName ?? '',
                emgR_MarksPerFlag: item.emgR_MarksPerFlag ?? 'm',
                emgR_ActiveFlag: item.emgR_ActiveFlag ?? true,
                grade_list: [],
                mI_Id: item.mI_Id
            }));
            setGradeList(formattedGrades);
        } else {
            setGradeList([]);
        }
    }, [academicData, academicError, gradeData, gradeError]);

    // when rowData (edit) is provided, populate top-level fields
    useEffect(() => {
        if (!rowData) return;

        setValue('EYCE_Id', rowData.eycE_Id || 0);
        setValue('ASMAY_Id', rowData.asmaY_Id ?? rowData.asmaY_Id ?? undefined);
        setValue('EYC_Id', rowData.eyC_Id ?? undefined);
        setValue('EMCA_Id', rowData.emcA_Id ?? undefined);
        setValue('EMGR_Id', rowData.emgR_Id ?? undefined);
        setValue('EYCE_AttendanceFromDate', rowData.eycE_AttendanceFromDate ?? '');
        setValue('EYCE_AttendanceToDate', rowData.eycE_AttendanceToDate ?? '');
        setValue('EYCE_SubExamFlg', rowData.eycE_SubExamFlg ?? false);
        setValue('EYCE_SubSubjectFlg', rowData.eycE_SubSubjectFlg ?? false);
        setValue('EYCE_ActiveFlg', rowData.eycE_ActiveFlg ?? true);
        setValue('EYCE_BestOfApplicableFlg', rowData.eycE_BestOfApplicableFlg ?? false);
        setValue('EYCE_BestOf', rowData.eycE_BestOf ?? undefined);
    }, [rowData, setValue]);

    // when academic year changes -> fetch categories for that year
    useEffect(() => {
        if (!watchYear) return;
        async function fetchRelated() {
            try {
                const { data: cats } = await getCategoryDropDownByAcademicYearlist(30, Number(watchYear));
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
                setCategories([]);
            }
        }
        fetchRelated();
    }, [watchYear]);

    // when category (and EMCA_Id) changes -> fetch exams and subjects
    useEffect(() => {
        if (!watchEMCA_ID) return;

        // Fetch exams only when Category or EMCA changes
        (async () => {
            try {
                const { data: ex } = await getExamsByCategoryandAcademicYear(30, Number(watchYear), Number(watchEMCA_ID));
                const mappedExams = Array.isArray(ex)
                    ? ex.map((e: any) => ({
                          EME_Id: e.emE_Id ?? e.EME_Id,
                          EME_ExamName: e.emE_ExamName ?? e.EME_ExamName,
                          checked: false
                      }))
                    : [];
                setExams(mappedExams);
                if (mappedExams.length === 0) toast.info('No Exams mapped to this Category.');
            } catch (err) {
                setExams([]);
                toast.error('Failed to load exams.');
            }
        })();
    }, [watchCategory, watchEMCA_ID]);

    useEffect(() => {
        if (!watchCategory || !watchEMCA_ID) return;

        // Fetch subjects when Category, EMCA, or Grade changes
        (async () => {
            try {
                const { data: subj } = await getSubjectsByCategory(30, Number(watchCategory));
                const formattedSubjects = Array.isArray(subj)
                    ? subj.map((s: any) => ({
                          ISMS_Id: s.ismS_Id ?? s.ISMS_Id,
                          ISMS_SubjectName: s.ismS_SubjectName ?? s.ISMS_SubjectName,
                          EYCES_MaxMarks: s.EYCES_MaxMarks ?? 0,
                          EYCES_MinMarks: s.EYCES_MinMarks ?? 0,
                          EMGR_Id: watchGrade ?? s.EMGR_Id ?? undefined,
                          EYCES_SubExamFlg: false,
                          EYCES_SubSubjectFlg: false,
                          EYCES_ActiveFlg: true,
                          subExamConfig: s.subExamConfig ?? [],
                          subSubjectConfig: s.subSubjectConfig ?? [],
                          subSubjectSubExamConfig: s.subSubjectSubExamConfig ?? [],
                          Exam_Subject_PT_GradeList: []
                      }))
                    : [];
                setSubjects(formattedSubjects);
                setValue('yearly_category_exam_subjects', formattedSubjects);
            } catch (err) {
                const fallback = [
                    {
                        ISMS_Id: 1,
                        ISMS_SubjectName: 'Kannada',
                        EYCES_MaxMarks: 100,
                        EYCES_MinMarks: 35,
                        EMGR_Id: watchGrade ?? 0
                    },
                    {
                        ISMS_Id: 2,
                        ISMS_SubjectName: 'French',
                        EYCES_MaxMarks: 22,
                        EYCES_MinMarks: 22,
                        EMGR_Id: watchGrade ?? 0
                    }
                ];
                setSubjects(fallback);
                setValue('yearly_category_exam_subjects', fallback);
                toast.error('Failed to load subjects.');
            }
        })();
    }, [watchCategory, watchEMCA_ID, watchGrade, setValue]);

    // propagate grade changes into subjects state
    useEffect(() => {
        if (watchGrade) {
            setSubjects((prev) => prev.map((s) => ({ ...s, EMGR_Id: Number(watchGrade) || s.EMGR_Id })));
        }
    }, [watchGrade]);

    // ------------------- Modal open/prepare handlers -------------------
    const onOpenSubExamModal = async (subject: any) => {
        try {
            setSubExamModalState({ open: true, subject });
            const { data: list } = await getMasterSubExamDropdownList(30);
            setSubExamModalState({ open: true, subject: { ...subject, list } });
        } catch {
            setSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: [
                        { EMSE_Id: 1, EMSE_SubExamName: 'Internal Test' },
                        { EMSE_Id: 2, EMSE_SubExamName: 'Viva' }
                    ]
                }
            });
        }
    };

    const onOpenSubSubjectModal = async (subject: any) => {
        try {
            setSubSubjectModalState({ open: true, subject });
            const { data: list } = await getMasterSubSubjectDropdownList(30);
            setSubSubjectModalState({ open: true, subject: { ...subject, list } });
        } catch {
            setSubSubjectModalState({
                open: true,
                subject: {
                    ...subject,
                    list: [
                        { EMSS_Id: 1, EMSS_SubSubjectName: 'Theory' },
                        { EMSS_Id: 2, EMSS_SubSubjectName: 'Practical' }
                    ]
                }
            });
        }
    };

    const onOpenSubSubjectSubExamModal = async (subject: any) => {
        try {
            setSubSubjectSubExamModalState({ open: true, subject });
            const { data: list } = await getSubSubjectSubExamList(30);
            setSubSubjectSubExamModalState({ open: true, subject: { ...subject, list } });
        } catch {
            setSubSubjectSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: [
                        { EMSE_Id: 1, EMSE_SubExamName: 'Internal Test' },
                        { EMSE_Id: 2, EMSE_SubExamName: 'Viva' }
                    ]
                }
            });
        }
    };
    const toBackendDate = (d?: string | null) => {
        if (!d) return '';
        if (d.includes('T')) return d;
        return `${d.split('T')[0] ?? d}T00:00:00`;
    };
    // ------------------- Save handlers for modals (they update subjects state) -------------------
    const handleSaveSubExam = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ISMS_Id === subjectId ? { ...s, subExamConfig: selectedList, EYCES_SubExamFlg: selectedList.length > 0 } : s
            )
        );
        setSubExamModalState({ open: false });
    };

    const handleSaveSubSubject = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ISMS_Id === subjectId ? { ...s, subSubjectConfig: selectedList, EYCES_SubSubjectFlg: selectedList.length > 0 } : s
            )
        );
        setSubSubjectModalState({ open: false });
    };

    const handleSaveSubSubjectSubExam = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ISMS_Id === subjectId ? { ...s, subSubjectSubExamConfig: selectedList, EYCES_SubSubjectFlg: selectedList.length > 0 } : s
            )
        );
        setSubSubjectSubExamModalState({ open: false });
    };

    // ------------------- Helper to convert date to required backend ISO format -------------------

    // ------------------- Builder functions for nested lists -------------------
    const buildExmSubjectSubExamsList = () => {
        return subjects
            .filter((s) => Array.isArray(s.subExamConfig) && s.subExamConfig.length > 0)
            .map((s) => ({
                ISMS_Id: s.ISMS_Id,
                sub_exam_list: s.subExamConfig.map((se: any, idx: number) => ({
                    EYCESSE_Id: se.EYCESSE_Id ?? 0,
                    EYCES_Id: se.EYCES_Id ?? 0,
                    ISMS_Id: s.ISMS_Id,
                    EMSE_Id: se.EMSE_Id ?? se.emsE_Id ?? se.EMSE_Id,
                    EMGR_Id: se.EMGR_Id ?? s.EMGR_Id ?? null,
                    EYCESSE_MaxMarks: Number(se.EYCESSE_MaxMarks ?? se.eycessS_MaxMarks ?? 0) || 0,
                    EYCESSE_MinMarks: Number(se.EYCESSE_MinMarks ?? se.eycessS_MinMarks ?? 0) || 0,
                    EYCESSE_ExemptedFlg: !!(se.EYCESSE_ExemptedFlg ?? se.eycessS_ExemptedFlg),
                    EYCESSE_ExemptedPer: Number(se.EYCESSE_ExemptedPer ?? se.eycessS_ExemptedPer ?? 0) || 0,
                    EYCESSE_ActiveFlg: se.EYCESSE_ActiveFlg ?? true,
                    EYCESSE_SubExamOrder: se.EYCESSE_SubExamOrder ?? idx + 1,
                    EYCESSS_MarksFlg: !!(se.EYCESSS_MarksFlg ?? se.eycessS_MarksFlg),
                    EYCESSS_GradesFlg: !!(se.EYCESSS_GradesFlg ?? se.eycessS_GradesFlg),
                    EYCESSS_AplResultFlg: !!(se.EYCESSS_AplResultFlg ?? se.eycessS_AplResultFlg),
                    EYCESSS_MarksEntryMax: Number(se.EYCESSS_MarksEntryMax ?? se.eycessS_MarksEntryMax ?? 0) || 0
                }))
            }));
    };

    const buildExmSubjectSubsubjectsList = () => {
        return subjects
            .filter((s) => Array.isArray(s.subSubjectConfig) && s.subSubjectConfig.length > 0)
            .map((s) => ({
                ISMS_Id: s.ISMS_Id,
                sub_subjs_list: s.subSubjectConfig.map((ss: any, idx: number) => ({
                    EYCESSS_Id: ss.EYCESSS_Id ?? 0,
                    EYCES_Id: ss.EYCES_Id ?? 0,
                    ISMS_Id: s.ISMS_Id,
                    EMSS_Id: ss.EMSS_Id ?? ss.emsS_Id ?? ss.EMSS_Id,
                    EMGR_Id: ss.EMGR_Id ?? s.EMGR_Id ?? null,
                    EYCESSS_MaxMarks: Number(ss.EYCESSS_MaxMarks ?? ss.eycessS_MaxMarks ?? 0) || 0,
                    EYCESSS_MinMarks: Number(ss.EYCESSS_MinMarks ?? ss.eycessS_MinMarks ?? 0) || 0,
                    EYCESSS_ExemptedFlg: !!(ss.EYCESSS_ExemptedFlg ?? ss.eycessS_ExemptedFlg),
                    EYCESSS_ExemptedPer: Number(ss.EYCESSS_ExemptedPer ?? ss.eycessS_ExemptedPer ?? 0) || 0,
                    EYCESSS_ActiveFlg: ss.EYCESSS_ActiveFlg ?? true,
                    EYCESSS_SubSubjectOrder: ss.EYCESSS_SubSubjectOrder ?? idx + 1
                }))
            }));
    };

    const buildExmSubjectSubsubjectsSubexamList = () => {
        return subjects
            .filter((s) => Array.isArray(s.subSubjectSubExamConfig) && s.subSubjectSubExamConfig.length > 0)
            .map((s) => ({
                ISMS_Id: s.ISMS_Id,
                sub_subject_sub_exam_list: s.subSubjectSubExamConfig.map((ss: any) => ({
                    EYCESSS_Id: ss.EYCESSS_Id ?? 0,
                    EYCES_Id: ss.EYCES_Id ?? 0,
                    EMSS_Id: ss.EMSS_Id ?? ss.emsS_Id ?? 0,
                    EMSE_Id: ss.EMSE_Id ?? ss.emse_Id ?? 0,
                    EMGR_Id: ss.EMGR_Id ?? s.EMGR_Id ?? null,
                    EYCESSS_MaxMarks: Number(ss.ECYSES_MaxMarks ?? ss.eycessS_MaxMarks ?? 0) || 0,
                    EYCESSS_MinMarks: Number(ss.ECYSES_MinMarks ?? ss.eycessS_MinMarks ?? 0) || 0,
                    EYCESSS_ExemptedFlg: !!(ss.EYCESSS_ExemptedFlg ?? ss.eycessS_ExemptedFlg),
                    EYCESSS_ExemptedPer: Number(ss.EYCESSS_ExemptedPer ?? ss.eycessS_ExemptedPer ?? 0) || 0,
                    EYCESSS_ActiveFlg: ss.EYCESSS_ActiveFlg ?? true,
                    EYCESSS_SubSubjectOrder: ss.EYCESSS_SubSubjectOrder ?? 0
                }))
            }));
    };

    // ------------------- Final Submit -------------------
    const onSubmit = async (values: any) => {
        try {
            const ok = await trigger();
            if (!ok) {
                toast.error('Fix validation errors before saving');
                return;
            }

            const exm_subject_subexams_list = buildExmSubjectSubExamsList();
            const exm_subject_subsubjects_list = buildExmSubjectSubsubjectsList();
            const exm_subject_subsubjects_subexam = buildExmSubjectSubsubjectsSubexamList();

            const exams_list = exams
                .filter((e) => e.checked)
                .map((e) => ({
                    EME_Id: e.EME_Id,
                    EME_ExamName: e.EME_ExamName,
                    checked: true
                }));

            const checkedSubjects = (subjects?.length > 0 ? subjects : (values.yearly_category_exam_subjects ?? [])).filter(
                (s: any) => s.checkedvalue === true
            );

            if (checkedSubjects.length === 0) {
                toast.error('Select at least one subject');
            }

            const yearly_category_exam_subjects = checkedSubjects.map((s: any, index: number) => ({
                EYCES_Id: s.EYCES_Id ?? 0,
                EYCE_Id: s.EYCE_Id ?? 0,
                ISMS_Id: s.ISMS_Id,
                EMGR_Id: s.EMGR_Id ?? 0,
                EYCES_MaxMarks: Number(s.EYCES_MaxMarks ?? 0),
                EYCES_MinMarks: Number(s.EYCES_MinMarks ?? 0),
                EYCES_MarksEntryMax: Number(s.EYCES_MarksEntryMax ?? 0),
                EYCES_SubExamFlg: Boolean(s.EYCES_SubExamFlg ?? false),
                EYCES_SubSubjectFlg: Boolean(s.EYCES_SubSubjectFlg ?? false),
                EYCES_ActiveFlg: Boolean(s.EYCES_ActiveFlg ?? true),
                EYCES_SubjectOrder: s.EYCES_SubjectOrder ?? index + 1,
                Exam_Subject_PT_GradeList: s.Exam_Subject_PT_GradeList ?? []
            }));

            const finalPayload = {
                ...values,
                UserId: 0,
                MI_Id: 0,
                ASMAY_Id: Number(values.ASMAY_Id) ?? 0,
                ASMAY_Year: '',
                EYCE_BestOfApplicableFlg: values.EYCE_BestOfApplicableFlg ?? true,
                EYCE_BestOf: values.EYCE_BestOf ?? 5,
                EYCE_AttendanceFromDate: toBackendDate(values.EYCE_AttendanceFromDate),
                EYCE_AttendanceToDate: toBackendDate(values.EYCE_AttendanceToDate),
                exams_list,
                yearly_category_exam_subjects,
                exm_subject_subexams_list,
                exm_subject_subsubjects_list,
                exm_subject_subsubjects_subexam,
                Temp_Subject_Order: values.Temp_Subject_Order ?? []
            };
            const res = await addOrUpdateExamSubjectWizard(finalPayload);
            if (res.success) toast.success('Exam Subject Wizard saved successfully');
            else toast.error(res.message);

            onSuccess?.();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Failed to save Exam Subject Wizard');
        }
    };

    const isTopFieldsFilled = watchYear && watchCategory;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CollapsibleSection defaultOpen>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left */}
                        <div className='space-y-4'>
                            <div>
                                <Label>Academic Year *</Label>
                                <Select value={watchYear?.toString() ?? ''} onValueChange={(val) => setValue('ASMAY_Id', Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((y) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                            </div>

                            <div>
                                <Label>Category *</Label>
                                <Select
                                    value={watchCategory?.toString() ?? ''}
                                    onValueChange={(val) => {
                                        const selectedCategory = categories.find((c) => c.eyC_Id.toString() === val);
                                        if (selectedCategory) {
                                            setValue('EYC_Id', Number(selectedCategory.eyC_Id));
                                            setValue('EMCA_Id', Number(selectedCategory.emcA_Id)); // store EMCA_Id for exam fetch
                                        }
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Category' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.emcA_Id} value={c.eyC_Id.toString()}>
                                                {c.emcA_CategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.EYC_Id && <FormError>{errors.EYC_Id.message}</FormError>}
                            </div>

                            <div>
                                <CustomMultiSelectBox
                                    label='Exam *'
                                    options={exams.map((ex) => ({
                                        label: ex.EME_ExamName,
                                        value: ex.EME_Id.toString()
                                    }))}
                                    value={exams.filter((ex) => ex.checked).map((ex) => ex.EME_Id.toString())}
                                    onChange={(selectedValues) => {
                                        const updatedExams = exams.map((ex) => ({
                                            ...ex,
                                            checked: selectedValues.includes(ex.EME_Id.toString())
                                        }));
                                        setExams(updatedExams);
                                    }}
                                    isSearchRequired={true}
                                    height='220px'
                                />
                            </div>
                        </div>

                        {/* Right */}
                        <div className='space-y-4'>
                            <div>
                                <Label>Grade *</Label>
                                <Select value={watchGrade?.toString() ?? ''} onValueChange={(val) => setValue('EMGR_Id', Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Grade' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeList.map((g) => (
                                            <SelectItem key={g.emgR_Id} value={g.emgR_Id.toString()}>
                                                {g.emgR_GradeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.EMGR_Id && <FormError>{errors.EMGR_Id.message}</FormError>}
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <Controller
                                    control={methods.control}
                                    name='EYCE_AttendanceFromDate'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Attendance From'
                                            placeholder='Select Attendance From Date'
                                            fromDate={new Date()}
                                        />
                                    )}
                                />

                                <Controller
                                    control={methods.control}
                                    name='EYCE_AttendanceToDate'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Attendance To'
                                            placeholder='Select Attendance To Date'
                                            fromDate={new Date(watch('EYCE_AttendanceFromDate'))}
                                        />
                                    )}
                                />
                            </div>

                            <div className='mt-2 flex items-center gap-4'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='subExamCheckbox'
                                        checked={watchSubExam}
                                        onCheckedChange={(v) => setValue('EYCE_SubExamFlg', Boolean(v))}
                                        disabled={!isTopFieldsFilled}
                                    />
                                    <label htmlFor='subExamCheckbox' className='font-medium text-sm'>
                                        Sub Exam Applicable
                                    </label>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='subSubjectCheckbox'
                                        checked={watchSubSubject}
                                        onCheckedChange={(v) => setValue('EYCE_SubSubjectFlg', Boolean(v))}
                                        disabled={!isTopFieldsFilled}
                                    />
                                    <label htmlFor='subSubjectCheckbox' className='font-medium text-sm'>
                                        Sub Subject Applicable
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject Table */}
                    <div className='mt-6'>
                        <SubjectTable
                            initialSubjects={subjects}
                            setParentSubjects={setSubjects}
                            showSubExamColumn={watchSubExam ?? false}
                            showSubSubjectColumn={watchSubSubject ?? false}
                            onOpenSubExamModal={onOpenSubExamModal}
                            onOpenSubSubjectModal={onOpenSubSubjectModal}
                            onOpenSubSubjectSubExamModal={onOpenSubSubjectSubExamModal}
                            gradeList={gradeList}
                        />
                    </div>

                    <div className='mt-6 flex w-fit gap-4'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type='button' variant='outline' onClick={() => window.location.reload()}>
                            Cancel
                        </Button>
                    </div>
                </CollapsibleSection>

                {/* Modals */}
                <SubExamModal
                    open={subExamModalState.open}
                    subject={subExamModalState.subject}
                    onClose={() => setSubExamModalState({ open: false })}
                    onSave={handleSaveSubExam}
                    gradeList={gradeList}
                    schema={SubSubjectSubExamSchema}
                />
                <SubSubjectModal
                    open={subSubjectModalState.open}
                    subject={subSubjectModalState.subject}
                    onClose={() => setSubSubjectModalState({ open: false })}
                    onSave={handleSaveSubSubject}
                    gradeList={gradeList}
                    schema={SubSubjectSubExamSchema}
                />
                <SubSubjectSubExamModal
                    open={subSubjectSubExamModalState.open}
                    subject={subSubjectSubExamModalState.subject}
                    onClose={() => setSubSubjectSubExamModalState({ open: false })}
                    onSave={handleSaveSubSubjectSubExam}
                    gradeList={gradeList}
                    schema={SubSubjectSubExamSchema}
                />
            </form>
        </FormProvider>
    );
}
