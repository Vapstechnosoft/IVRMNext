'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExamSubjectWizard, useExamSubjectWizardDetails } from '@/hooks/exam/exammodule/exam-mapping';
import { useMasterGrade } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { ExamSubjectWizardSchema, SubSubjectSubExamSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getCategoryDropDowByExamYearCategoryList } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import {
    addOrUpdateExamSubjectWizard,
    getExamDropdownForWizardSubjectMapping,
    getSubExamsMappedList,
    getSubSubjectSubExamList,
    getSubSubjectsAndSubExamsMappedList,
    getSubSubjectsMappedList,
    getSubjectsByCategory
} from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import { getMasterSubExamDropdownList } from '@/server/exam/exam-module/masters/sub-exam';
import { getMasterSubSubjectDropdownList } from '@/server/exam/exam-module/masters/sus-subject';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IExamSubjectWizard, IExamSubjectWizardDetails } from '@/types/exam/exam-module/exam-mapping';
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
            exm_subject_subexams_list: [],
            exm_subject_subsubjects_list: [],
            exm_subject_subsubjects_subexam: [],
            Temp_Subject_Order: [],
            EYCE_BestOfApplicableFlg: false,
            EYCE_BestOf: undefined,
            EMCA_Id: undefined
        }
    });

    const { watch, setValue, getValues, handleSubmit, formState, trigger, control, reset } = methods;
    const { errors, isSubmitting } = formState;

    // dropdown states
    const [academicYears, setAcademicYears] = useState<IAcademicYearDropDown[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [exams, setExams] = useState<{ EME_Id: number; EME_ExamName: string; checked?: boolean }[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [gradeList, setGradeList] = useState<IMasterGrade[]>([]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
    const { data: gradeData, error: gradeError } = useMasterGrade();
    const { data: response } = useExamSubjectWizardDetails(30, rowData?.eycE_Id ? rowData?.eycE_Id : 0);
    const { refetchAll } = useExamSubjectWizard();

    const convertToISO = (dateStr: string) => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`; // convert to YYYY-MM-DD
    };

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
        setValue('ASMAY_Id', rowData.asmaY_Id ?? undefined);
        setValue('EYC_Id', rowData.eyC_Id ?? undefined);
        setValue('EMCA_Id', rowData.emcA_Id ?? undefined);
        setValue('EMGR_Id', rowData.emgR_Id ?? undefined);
        setValue('EYCE_AttendanceFromDate', convertToISO(rowData.eycE_AttendanceFromDate));
        setValue('EYCE_AttendanceToDate', convertToISO(rowData.eycE_AttendanceToDate));
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
                const { data: cats } = await getCategoryDropDowByExamYearCategoryList(30, Number(watchYear));
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
        if (!watchCategory) return;

        // Fetch exams only when Category or EMCA changes
        (async () => {
            try {
                const { data: ex } = await getExamDropdownForWizardSubjectMapping(Number(watchCategory));

                const mappedExams = Array.isArray(ex)
                    ? ex.map((e: any) => ({
                          EME_Id: e.emE_Id ?? e.EME_Id,
                          EME_ExamName: e.emE_ExamName ?? e.EME_ExamName,
                          checked: rowData?.emE_Id === (e.emE_Id ?? e.EME_Id)
                      }))
                    : [];

                // If rowData exists, merge it into mappedExams
                if (rowData) {
                    const rowExam = {
                        EME_Id: rowData.emE_Id,
                        EME_ExamName: rowData.emE_ExamName,
                        checked: true
                    };

                    // Avoid duplicate entry
                    const examExists = mappedExams.some((ex) => ex.EME_Id === rowExam.EME_Id);

                    const updatedExams = examExists
                        ? mappedExams.map((ex) => (ex.EME_Id === rowExam.EME_Id ? { ...ex, checked: true } : ex))
                        : [rowExam, ...mappedExams];

                    setExams(updatedExams);

                    // If you want to update the form:
                    // setValue('exams_list', [{ EME_Id: rowData.emE_Id }]);
                } else {
                    setExams(mappedExams);
                }

                if (mappedExams.length === 0) toast.info('No Exams mapped to this Category.');
            } catch (err) {
                setExams([]);
                toast.error('Failed to load exams.');
            }
        })();
    }, [watchCategory, rowData]);
    useEffect(() => {
        if (formState.isSubmitted) {
            // 1️ No subject selected
            const hasSelectedSubject = Array.isArray(subjects) && subjects.some((s: any) => s.checkedvalue === true);
            if (!hasSelectedSubject) {
                toast.error('Select at least one subject before saving');
                return; // stop here — don’t show other errors
            }
            // 2️ Extract first validation error
            const errors = formState.errors as Record<string, any>;
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                const errorObj = errors[firstErrorKey];
                let errorMessage = '';

                // Try different structures (string / nested / array)
                if (typeof errorObj?.message === 'string') {
                    errorMessage = errorObj.message;
                } else if (Array.isArray(errorObj)) {
                    for (const item of errorObj) {
                        if (item && typeof item.message === 'string') {
                            errorMessage = item.message;
                            break;
                        }
                    }
                } else if (errorObj && typeof errorObj === 'object') {
                    for (const key in errorObj) {
                        const nested = errorObj[key];
                        if (nested?.message) {
                            errorMessage = nested.message;
                            break;
                        }
                    }
                }

                if (errorMessage) {
                    toast.error(errorMessage);
                    return; // show only the first one
                }
            }
        }
    }, [formState.isSubmitted, formState.errors, getValues]);
    // Setting Subjects
    useEffect(() => {
        if (!watchCategory || !watchEMCA_ID) return;

        (async () => {
            try {
                const { data: subj } = await getSubjectsByCategory(30, Number(watchCategory));

                const formattedSubjects = Array.isArray(subj)
                    ? subj.map((s: any) => ({
                          ISMS_Id: s.ismS_Id ?? s.ISMS_Id,
                          ISMS_SubjectName: s.ismS_SubjectName ?? s.ISMS_SubjectName,
                          EYCES_MaxMarks: s.EYCES_MaxMarks ?? 0,
                          EYCES_MinMarks: s.EYCES_MinMarks ?? 0,
                          EYCES_MarksEntryMax: s.EYCES_MarksEntryMax ?? 0,
                          EMGR_Id: watchGrade ?? s.EMGR_Id ?? undefined,
                          EYCES_Id: s.eyceS_Id ?? s.EYCES_Id,
                          EYCES_SubExamFlg: false,
                          EYCES_SubSubjectFlg: false,
                          EYCES_ActiveFlg: true,
                          EYCES_MarksGradeEntryFlg: 'M',
                          EYCES_MarksDisplayFlg: s.eyceS_MarksDisplayFlg ?? false,
                          EYCES_GradeDisplayFlg: s.eyceS_GradeDisplayFlg ?? false,
                          EYCES_AplResultFlg: s.eyceS_AplResultFlg ?? false,
                          subExamConfig: s.subExamConfig ?? [],
                          EYCES_SubjectOrder: s.eyceS_SubjectOrder ?? 0,
                          subSubjectConfig: s.subSubjectConfig ?? [],
                          subSubjectSubExamConfig: s.subSubjectSubExamConfig ?? [],
                          Exam_Subject_PT_GradeList: []
                      }))
                    : [];

                setSubjects(formattedSubjects);

                if (rowData) {
                    if (rowData?.eycE_Id && response) {
                        const apiResponse = response as unknown as {
                            success: boolean;
                            message: string;
                            data: IExamSubjectWizardDetails[];
                        };

                        const data = apiResponse?.data || [];
                        const updatedSubjects: any[] = [];

                        for (const s of formattedSubjects) {
                            const dataObject = data.find((d: any) => d.ismS_Id === s.ISMS_Id);

                            const updated: any = {
                                ISMS_Id: s.ISMS_Id,
                                ISMS_SubjectName: s.ISMS_SubjectName,
                                EYCES_Id: dataObject?.eyceS_Id ?? s.EYCES_Id ?? 0,
                                EMGR_Id: rowData.emgR_Id ?? undefined,
                                EYCES_MaxMarks: dataObject?.eyceS_MaxMarks ?? s.EYCES_MaxMarks ?? 0,
                                EYCES_MinMarks: dataObject?.eyceS_MinMarks ?? s.EYCES_MinMarks ?? 0,
                                EYCES_MarksEntryMax: dataObject?.eyceS_MarksEntryMax ?? s.EYCES_MarksEntryMax ?? 0,
                                checkedvalue: !!dataObject,

                                EYCES_SubExamFlg: dataObject?.eyceS_SubExamFlg ?? s.EYCES_SubExamFlg ?? false,
                                EYCES_SubSubjectFlg: dataObject?.eyceS_SubSubjectFlg ?? s.EYCES_SubSubjectFlg ?? false,
                                EYCES_ActiveFlg: dataObject?.eyceS_ActiveFlg ?? s.EYCES_ActiveFlg ?? true,

                                EYCES_SubjectOrder: dataObject?.eyceS_SubjectOrder ?? s.EYCES_SubjectOrder ?? 0,
                                EYCES_MarksGradeEntryFlg: dataObject?.eyceS_MarksGradeEntryFlg ?? s.EYCES_MarksGradeEntryFlg ?? 'M',

                                EYCES_MarksDisplayFlg: dataObject?.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? false,
                                EYCES_GradeDisplayFlg: dataObject?.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? false,
                                EYCES_AplResultFlg: dataObject?.eyceS_AplResultFlg ?? s.EYCES_AplResultFlg ?? false,

                                subExamConfig: s.subExamConfig ?? [],
                                subSubjectConfig: s.subSubjectConfig ?? [],
                                subSubjectSubExamConfig: s.subSubjectSubExamConfig ?? [],
                                Exam_Subject_PT_GradeList: s.Exam_Subject_PT_GradeList ?? []
                            };

                            // ---------------------------
                            // YOUR FLAG-BASED MAPPING LOGIC
                            // (Syntax-fixed only, no changes)
                            // ---------------------------
                            // Sub-Subject Mapping
                            if (updated.EYCES_SubSubjectFlg && !updated.EYCES_SubExamFlg) {
                                const { data: mappedList } = await getSubSubjectsMappedList(30, updated.EYCES_Id);
                                if (mappedList?.length) {
                                    updated.subSubjectConfig = mappedList.map(mapToSubSubjectConfig);
                                }
                            }

                            // Sub-Exam Mapping
                            if (updated.EYCES_SubExamFlg && !updated.EYCES_SubSubjectFlg) {
                                const { data: mappedList } = await getSubExamsMappedList(30, updated.EYCES_Id);
                                if (mappedList?.length) {
                                    updated.subExamConfig = mappedList.map(mapToSubExamConfig);
                                }
                            }

                            // Sub-Subject-Sub-Exam Mapping
                            if (updated.EYCES_SubSubjectFlg && updated.EYCES_SubExamFlg) {
                                const { data: mappedList } = await getSubSubjectsAndSubExamsMappedList(30, updated.EYCES_Id);
                                if (mappedList?.length) {
                                    updated.subSubjectSubExamConfig = mappedList.map(mapToSubSubjeSubExamctConfig);
                                }
                            }

                            updatedSubjects.push(updated);
                        }

                        setSubjects(updatedSubjects);
                    } else {
                        setSubjects(formattedSubjects);
                    }
                }
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
                toast.error('Failed to load subjects.');
            }
        })();
    }, [rowData, watchCategory, watchEMCA_ID, response, setValue]);

    // ------------------- Modal open/prepare handlers -------------------
    const onOpenSubExamModal = async (subject: any) => {
        try {
            setSubExamModalState({ open: true, subject });

            // Master dropdown
            const { data: list } = await getMasterSubExamDropdownList(30);
            const safeList = Array.isArray(list) ? list : [];

            const configList = Array.isArray(subject.subExamConfig) ? subject.subExamConfig : [];

            // Merge logic
            const updatedList = safeList.map((item: any) => {
                const cfg = configList.find((c: any) => c.EMSE_Id === item.emsE_Id);

                if (!cfg) {
                    return { ...item, checkedvalue: false };
                }

                return {
                    ...item,
                    ...cfg,
                    checkedvalue: true
                };
            });
            setSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: updatedList
                }
            });
        } catch (error) {
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

            // Fetch only master dropdown list
            const { data: list } = await getMasterSubSubjectDropdownList(30);
            const safeList = Array.isArray(list) ? list : [];
            // Use existing config instead of API call
            const safeSubSubjectList = Array.isArray(subject.subSubjectConfig) ? subject.subSubjectConfig : [];
            // Merge master list with config list
            const updatedList = safeList.map((item: any) => {
                const matched = safeSubSubjectList.find((ss: any) => ss.emsS_Id === item.emsS_Id);

                if (matched) {
                    return {
                        ...item,
                        ...matched,
                        checkedvalue: true
                    };
                }

                return {
                    ...item,
                    checkedvalue: false
                };
            });

            setSubSubjectModalState({
                open: true,
                subject: {
                    ...subject,
                    list: updatedList
                }
            });
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
            const safeList = Array.isArray(list) ? list : [];

            // Use existing config instead of mapped API call
            const safeConfigList = Array.isArray(subject.subSubjectSubExamConfig) ? subject.subSubjectSubExamConfig : [];

            const updatedList = safeList.map((item: any) => {
                const matched = safeConfigList.find((m: any) => m.emsS_Id === item.emsS_Id && m.emsE_Id === item.emsE_Id);

                if (matched) {
                    return {
                        ...item,
                        ...matched,
                        checkedvalue: true
                    };
                }

                return {
                    ...item,
                    checkedvalue: false
                };
            });

            setSubSubjectSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: updatedList
                }
            });
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
        toast.info('Sub Exams Data saved successfully.');
    };

    const handleSaveSubSubject = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ISMS_Id === subjectId ? { ...s, subSubjectConfig: selectedList, EYCES_SubSubjectFlg: selectedList.length > 0 } : s
            )
        );
        setSubSubjectModalState({ open: false });
        toast.info('Subject saved successfully.');
    };

    const handleSaveSubSubjectSubExam = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ISMS_Id === subjectId ? { ...s, subSubjectSubExamConfig: selectedList, EYCES_SubSubjectFlg: selectedList.length > 0 } : s
            )
        );
        setSubSubjectSubExamModalState({ open: false });
        toast.info('SubSubject and SubExam Data saved successfully.');
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
                    EMGR_Id: Number(se.EMGR_Id) ?? Number(s.EMGR_Id) ?? s.EMGR_Id ?? null,
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
                    EMGR_Id: Number(ss.EMGR_Id) ?? Number(s.EMGR_Id) ?? null,
                    EYCESSS_MaxMarks: Number(ss.EYCESSS_MaxMarks ?? ss.eycessS_MaxMarks ?? 0) || 0,
                    EYCESSS_MinMarks: Number(ss.EYCESSS_MinMarks ?? ss.eycessS_MinMarks ?? 0) || 0,
                    EYCESSS_ExemptedFlg: !!(ss.EYCESSS_ExemptedFlg ?? ss.eycessS_ExemptedFlg),
                    EYCESSS_ExemptedPer: Number(ss.EYCESSS_ExemptedPer ?? ss.eycessS_ExemptedPer ?? 0) || 0,
                    EYCESSS_MarksFlg: !!(ss.EYCESSS_MarksFlg ?? ss.eycessS_MarksFlg),
                    EYCESSS_GradesFlg: !!(ss.EYCESSS_GradesFlg ?? ss.eycessS_GradesFlg),
                    EYCESSS_AplResultFlg: !!(ss.EYCESSS_AplResultFlg ?? ss.eycessS_AplResultFlg),
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
                    EMGR_Id: Number(ss.EMGR_Id) ?? Number(s.EMGR_Id) ?? null,
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
                return;
            }

            const yearly_category_exam_subjects = checkedSubjects.map((s: any, index: number) => ({
                EYCES_Id: s.EYCES_Id ?? 0,
                EYCE_Id: s.EYCE_Id ?? 0,
                ISMS_Id: s.ISMS_Id,
                EMGR_Id: Number(s.EMGR_Id) ?? 0,
                EYCES_MaxMarks: Number(s.EYCES_MaxMarks ?? 0),
                EYCES_MinMarks: Number(s.EYCES_MinMarks ?? 0),
                EYCES_MarksEntryMax: Number(s.EYCES_MarksEntryMax ?? 0),
                EYCES_SubExamFlg: Boolean(s.EYCES_SubExamFlg ?? false),
                EYCES_SubSubjectFlg: Boolean(s.EYCES_SubSubjectFlg ?? false),
                EYCES_MarksGradeEntryFlg: s.EYCES_MarksGradeEntryFlg ?? 'M',
                EYCES_MarksDisplayFlg: Boolean(s.EYCES_MarksDisplayFlg ?? true),
                EYCES_GradeDisplayFlg: Boolean(s.EYCES_GradeDisplayFlg ?? true),
                EYCES_AplResultFlg: Boolean(s.EYCES_AplResultFlg ?? true),
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
            console.info('finalPayload', finalPayload);
            const res = await addOrUpdateExamSubjectWizard(finalPayload);
            if (res.success) toast.success('Exam Subject Wizard saved successfully');
            else toast.error(res.message);

            onSuccess?.();
            refetchAll();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Failed to save Exam Subject Wizard');
        }
    };
    const handleReset = () => {
        reset({
            UserId: 0,
            MI_Id: 0,
            ASMAY_Id: 0,
            ASMAY_Year: '',
            EYCE_BestOfApplicableFlg: true,
            EYCE_BestOf: 5,
            EYCE_AttendanceFromDate: '',
            EYCE_AttendanceToDate: '',
            exams_list: [],
            //yearly_category_exam_subjects: [],
            exm_subject_subexams_list: [],
            exm_subject_subsubjects_list: [],
            exm_subject_subsubjects_subexam: [],
            Temp_Subject_Order: []
        });
        setSubjects([]);
        setValue('exams_list', []);
        setExams([]);
    };

    const isTopFieldsFilled = watchYear && watchCategory;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CollapsibleSection defaultOpen>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left */}
                        <div className='space-y-4'>
                            <Controller
                                control={control}
                                name='ASMAY_Id'
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
                                            <SelectItem key={c.eyC_Id} value={c.eyC_Id.toString()}>
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
                            <Controller
                                control={control}
                                name='EMGR_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Grade <span className='text-red-500'>*</span>
                                        </Label>

                                        <Select
                                            key={field.value} // force remount to correctly display selected value
                                            value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Grade' />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {gradeList.map((g) => (
                                                    <SelectItem key={g.emgR_Id} value={String(g.emgR_Id)}>
                                                        {g.emgR_GradeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

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
                                            fromDate={today}
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
                            selectedGrade={watchGrade}
                        />
                    </div>

                    <div className='mt-6 flex w-fit gap-4'>
                        <Button type='button' variant='outline' onClick={handleReset}>
                            Reset
                        </Button>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
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

const mapToSubExamConfig = (r: any) => ({
    EYCESSE_Id: r.EYCESSE_Id ?? 0,
    EYCES_Id: 0,
    EMSE_Id: r.emsE_Id,
    EMGR_Id: Number(r.emgR_Id) || null,
    EYCESSE_MaxMarks: Number(r.eycessS_MaxMarks) || 0,
    EYCESSE_MinMarks: Number(r.eycessS_MinMarks) || 0,
    EYCESSE_ExemptedFlg: !!r.eycessS_ExemptedFlg,
    EYCESSE_ExemptedPer: Number(r.eycessS_ExemptedPer) || 0,
    EYCESSE_ActiveFlg: !!r.eycessS_ActiveFlg,
    EYCESSE_SubExamOrder: Number(r.eycessS_SubExamOrder) || 0,
    EYCESSS_MarksFlg: !!r.eycessS_MarksFlg,
    EYCESSS_GradesFlg: !!r.eycessS_GradesFlg,
    EYCESSS_AplResultFlg: !!r.eycessS_AplResultFlg,
    EYCESSS_MarksEntryMax: Number(r.eycessS_MarksEntryMax) || 0
});
const mapToSubSubjectConfig = (l: any) => ({
    eycessS_Id: l.eycessS_Id,
    emsS_Id: l.emsS_Id,
    eycessS_SubSubjectName: l.emsS_SubSubjectName,
    eycessS_SubSubjectCode: l.emsS_SubSubjectCode,
    checkedvalue: Boolean(l.checkedvalue),
    eycessS_MaxMarks: l.eycessS_MaxMarks ?? '',
    eycessS_MinMarks: l.eycessS_MinMarks ?? '',
    eycessS_MarksEntryMax: l.eycessS_MarksEntryMax ?? '',
    EMGR_Id: l.EMGR_Id ?? '',
    eycessS_ExemptedFlg: !!l.eycessS_ExemptedFlg,
    eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
    eycessS_MarksDisplayFlg: !!l.eycessS_MarksDisplayFlg,
    eycessS_GradeDisplayFlg: !!l.eycessS_GradeDisplayFlg,
    eycessS_AplResultFlg: !!l.eycessS_AplResultFlg,
    eycessS_SubSubjectOrder: l.emsS_Order
});
const mapToSubSubjeSubExamctConfig = (l: any) => ({
    eycessS_Id: l.eycessS_Id ?? undefined,
    eyceS_Id: l.eyceS_Id ?? undefined,
    ismS_Id: l.ismS_Id,
    emsS_Id: l.emsS_Id,
    checkedvalue: Boolean(l.checkedvalue) ?? false,
    emgR_GradeName: l.emgR_GradeName ?? '',
    ismS_SubjectName: l.ISMS_SubjectName ?? '',
    ismS_SubjectCode: l.ISMS_SubjectCode ?? '',
    emsS_SubSubjectName: l.emsS_SubSubjectName ?? '',
    emsS_SubSubjectCode: l.emsS_SubSubjectCode ?? '',
    emsE_SubExamName: l.emsE_SubExamName ?? '',
    emsE_SubExamCode: l.emsE_SubExamCode ?? '',
    eycessS_MaxMarks: l.eycessS_MaxMarks ?? '',
    eycessS_MinMarks: l.eycessS_MinMarks ?? '',
    eycessS_MarksEntryMax: l.eycessS_MarksEntryMax ?? '',
    eycessS_ExemptedFlg: !!l.eycessS_ExemptedFlg,
    eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
    eycessS_MarksFlg: !!l.eycessS_MarksFlg,
    eycessS_GradesFlg: !!l.eycessS_GradesFlg,
    eycessS_ActiveFlg: !!l.eycessS_ActiveFlg
});
