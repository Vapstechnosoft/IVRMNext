'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import { useExamSubjectWizard } from '@/hooks/exam/exammodule/exam-mapping';
import {
    useMasterGradeDropdownList,
    useMasterSubExamDropdownList,
    useMasterSubSubjectDropdownList
} from '@/hooks/exam/exammodule/usemasters';
import { ExamSubjectWizardSchema, SubSubjectSubExamSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getCategoryDropDowByExamYearCategoryList } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import {
    addOrUpdateExamSubjectWizard,
    getExamDropdownForWizardSubjectMapping,
    getExamSubjectWizardDetails,
    getSubExamsMappedList,
    getSubSubjectSubExamList,
    getSubSubjectsAndSubExamsMappedList,
    getSubSubjectsMappedList,
    getSubjectsByCategory
} from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import { getExamAcademicYearDropdown } from '@/server/exam/exam-module/masters/exam';
import {
    getYearlyCategorySubjectMapping,
    getYearlyCategorySubjectMappingDetails
} from '@/server/exam/exam-module/exam-mapping/yearly-category-subject-mapping';
import type { IExamSubjectWizard, IExamSubjectWizardDetails } from '@/types/exam/exam-module/exam-mapping';
import type { ICategory, IMasterGrade, IMasterSubExam, IMasterSubSubject } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
            ASMAY_Id: undefined,
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
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [exams, setExams] = useState<{ EME_Id: number; EME_ExamName: string; checked?: boolean }[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [gradeList, setGradeList] = useState<IMasterGrade[]>([]);
    const [isEditFormLoading, setIsEditFormLoading] = useState(!!rowData);
    const validateSubjectsRef = useRef<(() => boolean) | null>(null);
    const [subSubjects, setSubSubjects] = useState<any[]>([]);
    const [subExams, setSubExams] = useState<any[]>([]);
    const [_isLoading, _setIsLoading] = useState(false);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const watchYear = watch('ASMAY_Id');
    const watchCategory = watch('EYC_Id');
    const watchEMCA_ID = watch('EMCA_Id');
    const watchSubExam = watch('EYCE_SubExamFlg');
    const watchSubSubject = watch('EYCE_SubSubjectFlg');
    const watchGrade = watch('EMGR_Id');

    // modals
    const [isSetOrderOpen, setIsSetOrderOpen] = useState(false);
    const [subExamModalState, setSubExamModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [subSubjectModalState, setSubSubjectModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [subSubjectSubExamModalState, setSubSubjectSubExamModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [academicYearLoading, setAcademicYearLoading] = useState(false);
    const { data: gradeData, error: gradeError } = useMasterGradeDropdownList();
    const { refetchAll } = useExamSubjectWizard();

    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                setAcademicYearLoading(true);
                const res = await getExamAcademicYearDropdown();
                const yearData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                const formatted = yearData
                    .map((item: any) => ({
                        asmaY_Id: item.asmaY_Id ?? item.ASMAY_Id ?? 0,
                        asmaY_Year: item.asmaY_Year ?? item.ASMAY_Year ?? ''
                    }))
                    .filter((item: any) => item.asmaY_Id > 0);
                setAcademicYears(formatted);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load academic years');
            } finally {
                setAcademicYearLoading(false);
            }
        };
        fetchAcademicYears();
    }, []);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const { data: masterSubSubject, isLoading: masterSubSubjectLoading } = useMasterSubSubjectDropdownList();
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const { data: masterSubExam, isLoading: masterSubExamLoading } = useMasterSubExamDropdownList();
    const router = useRouter();
    const convertToISO = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('T')) {
            return dateStr.split('T')[0];
        }
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            // If already YYYY/MM/DD
            if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`;
            // If DD/MM/YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            // If already YYYY-MM-DD
            if (parts[0].length === 4) return dateStr;
            // If DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };
    useEffect(() => {
        if (masterSubSubject && Array.isArray(masterSubSubject.data)) {
            setSubSubjects(masterSubSubject.data);
        }
    }, [masterSubSubject]);
    useEffect(() => {
        if (masterSubExam && Array.isArray(masterSubExam.data)) {
            setSubExams(masterSubExam.data);
        }
    }, [masterSubExam]);

    // Populate grade dropdown
    useEffect(() => {
        if (gradeError) {
            toast.error(gradeError.message || 'Failed to load grade list');
            setGradeList([]);
        } else {
            const rawGrades = Array.isArray(gradeData?.data) ? gradeData.data : Array.isArray(gradeData) ? gradeData : [];
            if (rawGrades.length > 0) {
                const formattedGrades: IMasterGrade[] = rawGrades.map((item: any) => ({
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
        }
    }, [gradeData, gradeError]);

    // when rowData (edit) is provided, populate top-level fields
    useEffect(() => {
        if (!rowData) return;
        setIsEditFormLoading(true);
        setSubjects([]);
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
                setCategoriesLoading(true);
                const { data: cats } = await getCategoryDropDowByExamYearCategoryList(Number(watchYear));
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
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
                // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            } catch (err) {
                setExams([]);
                toast.error('Failed to load exams.');
            }
        })();
    }, [watchCategory, rowData]);

    // Sync exams checklist state with react-hook-form exams_list state once form finishes loading
    useEffect(() => {
        if (isEditFormLoading) return;
        const checkedExams = exams.filter((e) => e.checked).map((e) => ({ EME_Id: e.EME_Id, EME_ExamName: e.EME_ExamName }));
        setValue('exams_list', checkedExams, { shouldValidate: true });
    }, [exams, isEditFormLoading, setValue]);

    useEffect(() => {
        if (formState.isSubmitted) {
            // 2️ Extract first validation error - Disabled to prevent extra toast messages
            /*
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
            */
        }
    }, [formState.isSubmitted, formState.errors, getValues]);
    // Setting Subjects & Populating Saved Data on Edit
    useEffect(() => {
        if (!watchCategory || !watchEMCA_ID) return;

        (async () => {
            try {
                const [subjRes, detailsRes, catMappingRes] = await Promise.all([
                    getSubjectsByCategory(Number(watchCategory)),
                    rowData?.eycE_Id ? getExamSubjectWizardDetails(Number(rowData.eycE_Id)) : Promise.resolve(null),
                    getYearlyCategorySubjectMapping({ page: 1, page_size: 100 }).catch(() => null)
                ]);

                let subj = Array.isArray(subjRes?.data) ? [...subjRes.data] : [];

                // Filter subjects to strictly those mapped under the CURRENT / LATEST active Category Subject Mapping for this category & academic year
                const catMappings = Array.isArray(catMappingRes?.data)
                    ? catMappingRes.data
                    : Array.isArray((catMappingRes as any)?.data?.data)
                      ? (catMappingRes as any).data.data
                      : [];

                const activeGroupsForCat = catMappings
                    .filter((m: any) => {
                        const eycId = m.eyC_Id ?? m.EYC_Id;
                        const asmayId = m.asmaY_Id ?? m.ASMAY_Id;
                        const activeFlg = m.eycG_ActiveFlg ?? m.EYCG_ActiveFlg ?? true;
                        const isCatMatch = Number(eycId) === Number(watchCategory);
                        const isYearMatch = watchYear ? Number(asmayId) === Number(watchYear) : true;
                        return isCatMatch && isYearMatch && Boolean(activeFlg);
                    })
                    .sort((a: any, b: any) => {
                        const idA = Number(a.eycG_Id ?? a.EYCG_Id ?? 0);
                        const idB = Number(b.eycG_Id ?? b.EYCG_Id ?? 0);
                        return idB - idA; // latest group first
                    });

                if (activeGroupsForCat.length > 0) {
                    try {
                        // Use the current / latest active category group mapping
                        const latestGroup = activeGroupsForCat[0];
                        const eycId = latestGroup.eyC_Id ?? latestGroup.EYC_Id;
                        const eycgId = latestGroup.eycG_Id ?? latestGroup.EYCG_Id;
                        const asmayId = latestGroup.asmaY_Id ?? latestGroup.ASMAY_Id ?? Number(watchYear);

                        const gRes = await getYearlyCategorySubjectMappingDetails(Number(eycId), Number(eycgId), Number(asmayId));
                        const list = Array.isArray(gRes?.data) ? gRes.data : [];
                        const activeSubjectIds = new Set<number>();
                        for (const item of list) {
                            const id = Number(item.ismS_Id ?? item.ISMS_Id);
                            if (id) activeSubjectIds.add(id);
                        }

                        if (activeSubjectIds.size > 0) {
                            subj = subj.filter((s: any) => activeSubjectIds.has(Number(s.ismS_Id ?? s.ISMS_Id)));
                        }
                    } catch (detailErr) {
                        console.warn('Failed to filter by latest group details:', detailErr);
                    }
                }

                const formattedSubjects = Array.isArray(subj)
                    ? subj.map((s: any) => ({
                          ismS_Id: s.ismS_Id,
                          ismS_SubjectName: s.ismS_SubjectName,
                          ismS_SubjectCode: s.ismS_SubjectCode,
                          ismS_Max_Marks: s.ismS_Max_Marks,
                          ismS_Min_Marks: s.ismS_Min_Marks,
                          ismS_OrderFlag: s.ismS_OrderFlag,
                          eyceS_MarksEntryMax: '',
                          eyceS_MaxMarks: s.eyceS_MaxMarks ?? s.EYCES_MaxMarks ?? s.ECYSES_MaxMarks ?? s.ismS_Max_Marks ?? '',
                          eyceS_MinMarks: s.eyceS_MinMarks ?? s.EYCES_MinMarks ?? s.ECYSES_MinMarks ?? s.ismS_Min_Marks ?? '',
                          emgr_Id: watchGrade ?? 0,
                          eyceS_Id: s.eyceS_Id ?? s.EYCES_d ?? 0,
                          eyceS_SubExamFlg: false,
                          eyceS_SubSubjectFlg: false,
                          eyceS_ActiveFlg: true,
                          eyceS_MarksGradeEntryFlg: 'M',
                          eyceS_MarksDisplayFlg: false,
                          eyceS_GradeDisplayFlg: false,
                          eyceS_AplResultFlg: false,
                          subExamConfig: [],
                          subSubjectConfig: [],
                          subSubjectSubExamConfig: [],
                          exam_Subject_PT_GradeList: []
                      }))
                    : [];

                if (rowData?.eycE_Id) {
                    const rawDetails = detailsRes as any;
                    const data: any[] = Array.isArray(rawDetails)
                        ? rawDetails
                        : Array.isArray(rawDetails?.data)
                          ? rawDetails.data
                          : Array.isArray(rawDetails?.data?.data)
                            ? rawDetails.data.data
                            : [];

                    const updatedSubjects: any[] = [];

                    for (const s of formattedSubjects) {
                        const dataObject = data.find((d: any) => Number(d.ismS_Id ?? d.ISMS_Id ?? d.isms_Id) === Number(s.ismS_Id));

                        const isChecked = Boolean(dataObject);

                        const updated = {
                            ...s,
                            eyceS_Id: Number(dataObject?.eyceS_Id ?? dataObject?.EYCES_Id ?? s.eyceS_Id ?? 0),
                            emgr_Id: dataObject?.emgR_Id ?? dataObject?.EMGR_Id ?? rowData?.emgR_Id ?? s.emgr_Id,
                            ismS_SubjectName: dataObject?.ismS_SubjectName ?? dataObject?.ISMS_SubjectName ?? s.ismS_SubjectName,
                            ismS_SubjectCode: dataObject?.ismS_SubjectCode ?? dataObject?.ISMS_SubjectCode ?? s.ismS_SubjectCode,
                            eyceS_MaxMarks: isChecked
                                ? (dataObject?.eyceS_MaxMarks ??
                                  dataObject?.EYCES_MaxMarks ??
                                  dataObject?.ECYSES_MaxMarks ??
                                  s.ismS_Max_Marks ??
                                  '')
                                : '',
                            eyceS_MinMarks: isChecked
                                ? (dataObject?.eyceS_MinMarks ??
                                  dataObject?.EYCES_MinMarks ??
                                  dataObject?.ECYSES_MinMarks ??
                                  s.ismS_Min_Marks ??
                                  '')
                                : '',
                            eyceS_MarksEntryMax: isChecked
                                ? (dataObject?.eyceS_MarksEntryMax ??
                                  dataObject?.EYCES_MarksEntryMax ??
                                  dataObject?.ECYSES_MarksEntryMax ??
                                  '')
                                : '',
                            eyceS_SubExamFlg: Boolean(dataObject?.eyceS_SubExamFlg ?? dataObject?.EYCES_SubExamFlg ?? s.eyceS_SubExamFlg),
                            eyceS_SubSubjectFlg: Boolean(
                                dataObject?.eyceS_SubSubjectFlg ?? dataObject?.EYCES_SubSubjectFlg ?? s.eyceS_SubSubjectFlg
                            ),
                            eyceS_MarksGradeEntryFlg:
                                dataObject?.eyceS_MarksGradeEntryFlg ??
                                dataObject?.EYCES_MarksGradeEntryFlg ??
                                s.eyceS_MarksGradeEntryFlg ??
                                'M',
                            eyceS_MarksDisplayFlg: Boolean(
                                dataObject?.eyceS_MarksDisplayFlg ?? dataObject?.EYCES_MarksDisplayFlg ?? isChecked
                            ),
                            eyceS_GradeDisplayFlg: Boolean(
                                dataObject?.eyceS_GradeDisplayFlg ?? dataObject?.EYCES_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg
                            ),
                            eyceS_AplResultFlg: Boolean(dataObject?.eyceS_AplResultFlg ?? dataObject?.EYCES_AplResultFlg ?? isChecked),
                            eyceS_SubjectOrder:
                                dataObject?.eyceS_SubjectOrder ??
                                dataObject?.EYCES_SubjectOrder ??
                                s.ismS_OrderFlag ??
                                updatedSubjects.length + 1,
                            eyceS_ActiveFlg: Boolean(dataObject?.eyceS_ActiveFlg ?? dataObject?.EYCES_ActiveFlg ?? true),
                            checkedvalue: isChecked
                        };

                        // Sub-Subject Mapping
                        if (updated.eyceS_SubSubjectFlg && !updated.eyceS_SubExamFlg && updated.eyceS_Id) {
                            const { data: mappedList } = await getSubSubjectsMappedList(updated.eyceS_Id);
                            if (mappedList?.length) {
                                updated.subSubjectConfig = mappedList.map((item: any) => ({
                                    ...mapToSubSubjectConfig(item),
                                    emsS_Order: item.emsS_Order ?? item.EMSS_Order ?? item.eycessS_SubSubjectOrder ?? 0,
                                    emsS_Id: item.emsS_Id ?? item.EMSS_Id,
                                    emsS_SubSubjectName: item.emsS_SubSubjectName ?? item.EMSS_SubSubjectName
                                }));
                            }
                        }

                        // Sub-Exam Mapping
                        if (updated.eyceS_SubExamFlg && !updated.eyceS_SubSubjectFlg && updated.eyceS_Id) {
                            const { data: mappedList } = await getSubExamsMappedList(updated.eyceS_Id);
                            if (mappedList?.length) {
                                updated.subExamConfig = mappedList;
                            }
                        }

                        // Sub-Subject-Sub-Exam Mapping
                        if (updated.eyceS_SubSubjectFlg && updated.eyceS_SubExamFlg && updated.eyceS_Id) {
                            const { data: mappedList } = await getSubSubjectsAndSubExamsMappedList(updated.eyceS_Id);
                            if (mappedList?.length) {
                                updated.subSubjectSubExamConfig = mappedList.map((item: any) => ({
                                    ...mapToSubSubjeSubExamctConfig(item),
                                    emsS_Id: item.emsS_Id ?? item.EMSS_Id,
                                    emsE_Id: item.emsE_Id ?? item.EMSE_Id
                                }));
                            }
                        }

                        updatedSubjects.push(updated);
                    }

                    // Include any saved subjects that were not returned by category subject list
                    const missingSaved = data.filter(
                        (d: any) => !formattedSubjects.some((s: any) => Number(s.ismS_Id) === Number(d.ismS_Id ?? d.ISMS_Id ?? d.isms_Id))
                    );
                    for (const d of missingSaved) {
                        updatedSubjects.push({
                            ismS_Id: Number(d.ismS_Id ?? d.ISMS_Id ?? d.isms_Id),
                            ismS_SubjectName: d.ismS_SubjectName ?? d.ISMS_SubjectName ?? '',
                            ismS_SubjectCode: d.ismS_SubjectCode ?? d.ISMS_SubjectCode ?? '',
                            eyceS_Id: Number(d.eyceS_Id ?? d.EYCES_Id ?? 0),
                            emgr_Id: d.emgR_Id ?? d.EMGR_Id ?? rowData?.emgR_Id ?? watchGrade ?? 0,
                            eyceS_MaxMarks: d.eyceS_MaxMarks ?? d.EYCES_MaxMarks ?? d.ECYSES_MaxMarks ?? '',
                            eyceS_MinMarks: d.eyceS_MinMarks ?? d.EYCES_MinMarks ?? d.ECYSES_MinMarks ?? '',
                            eyceS_MarksEntryMax: d.eyceS_MarksEntryMax ?? d.EYCES_MarksEntryMax ?? d.ECYSES_MarksEntryMax ?? '',
                            eyceS_SubExamFlg: Boolean(d.eyceS_SubExamFlg ?? d.EYCES_SubExamFlg),
                            eyceS_SubSubjectFlg: Boolean(d.eyceS_SubSubjectFlg ?? d.EYCES_SubSubjectFlg),
                            eyceS_MarksGradeEntryFlg: d.eyceS_MarksGradeEntryFlg ?? d.EYCES_MarksGradeEntryFlg ?? 'M',
                            eyceS_MarksDisplayFlg: Boolean(d.eyceS_MarksDisplayFlg ?? d.EYCES_MarksDisplayFlg ?? true),
                            eyceS_GradeDisplayFlg: Boolean(d.eyceS_GradeDisplayFlg ?? d.EYCES_GradeDisplayFlg),
                            eyceS_AplResultFlg: Boolean(d.eyceS_AplResultFlg ?? d.EYCES_AplResultFlg ?? true),
                            eyceS_SubjectOrder: d.eyceS_SubjectOrder ?? d.EYCES_SubjectOrder ?? updatedSubjects.length + 1,
                            eyceS_ActiveFlg: Boolean(d.eyceS_ActiveFlg ?? d.EYCES_ActiveFlg ?? true),
                            checkedvalue: true,
                            subExamConfig: [],
                            subSubjectConfig: [],
                            subSubjectSubExamConfig: [],
                            exam_Subject_PT_GradeList: []
                        });
                    }

                    setSubjects(updatedSubjects);
                } else {
                    setSubjects(formattedSubjects);
                    if (formattedSubjects.length === 0) toast.info('No subjects found for this category.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load subjects.');
            } finally {
                setIsEditFormLoading(false);
            }
        })();
    }, [rowData, watchCategory, watchEMCA_ID, watchGrade, setValue]);

    // ------------------- Modal open/prepare handlers -------------------
    const onOpenSubExamModal = async (subject: any) => {
        try {
            setSubExamModalState({ open: true });

            const configList = Array.isArray(subject.subExamConfig) ? subject.subExamConfig : [];

            const updatedList = subExams.map((item: any) => {
                const cfg = configList.find((c: any) => Number(c.emsE_Id) === Number(item.emsE_Id));

                if (!cfg) {
                    return {
                        ...item,
                        checkedvalue: false
                    };
                }

                return {
                    ...item,
                    ...cfg,
                    emsE_SubExamOrder: Number(cfg.eycessS_SubSubjectOrder ?? 0),
                    checkedvalue: true
                };
            });

            const sortedList = [...updatedList].sort((a, b) => (a.emsE_SubExamOrder ?? 0) - (b.emsE_SubExamOrder ?? 0));

            setSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: sortedList
                }
            });
        } catch (_error) {
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

            const safeSubSubjectList = Array.isArray(subject.subSubjectConfig) ? subject.subSubjectConfig : [];
            const updatedList = subSubjects.map((item: any) => {
                const matched = safeSubSubjectList.find((ss: any) => ss.emsS_Id === item.emsS_Id);

                if (matched) {
                    return {
                        ...item,
                        ...matched,
                        emsS_SubSubjectOrder: Number(matched.eycessS_SubSubjectOrder ?? 0),
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

            const { data } = await getSubSubjectSubExamList();
            const safeList = Array.isArray(data) ? data : [];

            const safeConfigList = Array.isArray(subject?.subSubjectSubExamConfig) ? subject.subSubjectSubExamConfig : [];

            const updatedList = safeList.map((item: any) => {
                const match = safeConfigList.find(
                    (m: any) => Number(m.emsS_Id) === Number(item.emsS_Id) && Number(m.emsE_Id) === Number(item.emsE_Id)
                );

                return {
                    ...item,
                    ...(match ?? {}),
                    checkedvalue: Boolean(match) // auto check if matched
                };
            });

            setSubSubjectSubExamModalState({
                open: true,
                subject: { ...subject, list: updatedList }
            });
        } catch {
            // fallback (keeps UI usable even when API fails)
            setSubSubjectSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: [
                        { EMSE_Id: 1, EMSE_SubExamName: 'Internal Test', checkedvalue: false },
                        { EMSE_Id: 2, EMSE_SubExamName: 'Viva', checkedvalue: false }
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

    const handleSubExamClose = (subjectId: number) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ismS_Id === subjectId
                    ? {
                          ...s,
                          EYCES_SubExamFlg: s.subExamConfig && s.subExamConfig.length > 0
                      }
                    : s
            )
        );

        setSubExamModalState({ open: false });
    };

    const handleSaveSubSubject = (subjectId: number, selectedList: any[], subSubjectList: any) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ismS_Id === subjectId ? { ...s, subSubjectConfig: selectedList, EYCES_SubSubjectFlg: selectedList.length > 0 } : s
            )
        );
        setSubSubjects((prev: IMasterSubSubject[]) =>
            prev.map((sub) => {
                const matched = subSubjectList.find((l: any) => l.emsS_Id === sub.emsS_Id);

                return matched
                    ? {
                          ...sub,
                          emsS_Order: Number(matched.eycessS_SubSubjectOrder ?? 0),
                          EMSS_Order: Number(matched.eycessS_SubSubjectOrder ?? 0)
                      }
                    : sub;
            })
        );
        setSubSubjectModalState({ open: false });
        toast.info('Subject saved successfully.');
    };
    const handleSaveSubExam = (subjectId: number, selectedList: any[], subExamList: any[]) => {
        // update subject level config
        setSubjects((prev) =>
            prev.map((s) =>
                s.ismS_Id === subjectId
                    ? {
                          ...s,
                          subExamConfig: selectedList,
                          EYCES_SubExamFlg: selectedList.length > 0
                      }
                    : s
            )
        );
        const subExamList_ = subExamList.map((item, index) => ({
            ...item,
            emsE_SubExamOrder: index + 1
        }));

        setSubExams((prev: IMasterSubExam[]) =>
            prev.map((exam) => {
                const matched = subExamList_.find((l: any) => Number(l.emsE_Id) === Number(exam.emsE_Id));

                return matched
                    ? {
                          ...exam,
                          emsE_SubExamOrder: Number(matched.emsE_SubExamOrder ?? 0),
                          EMSE_SubExamOrder: Number(matched.EMSE_SubExamOrder ?? matched.emsE_SubExamOrder ?? 0)
                      }
                    : exam;
            })
        );

        setSubExamModalState({ open: false });
        toast.info('Sub Exams Data saved successfully.');
    };

    const handleSaveSubSubjectSubExam = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ismS_Id === subjectId ? { ...s, subSubjectSubExamConfig: selectedList, EYCES_SubSubjectFlg: selectedList.length > 0 } : s
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
                ismS_Id: s.ismS_Id,
                sub_exam_list: s.subExamConfig.map((se: any, idx: number) => ({
                    EYCESSE_Id: se.EYCESSE_Id ?? 0,
                    EYCES_Id: se.EYCES_Id ?? 0,
                    EMGR_Id: se.emgR_Id ?? 0,
                    EYCESSE_MaxMarks: Number(se.EYCESSE_MaxMarks ?? se.eycessS_MaxMarks ?? 0) || 0,
                    EYCESSE_MinMarks: Number(se.EYCESSE_MinMarks ?? se.eycessS_MinMarks ?? 0) || 0,
                    EYCESSE_ExemptedFlg: !!(se.EYCESSE_ExemptedFlg ?? se.eycessS_ExemptedFlg),
                    EYCESSE_ExemptedPer: Number(se.EYCESSE_ExemptedPer ?? se.eycessS_ExemptedPer ?? 0) || 0,
                    EYCESSE_ActiveFlg: se.EYCESSE_ActiveFlg ?? true,
                    EYCESSS_MarksFlg: se.EYCESSS_MarksFlg ?? true,
                    EYCESSS_GradesFlg: se.EYCESSS_GradesFlg ?? true,
                    EYCESSS_AplResultFlg: se.EYCESSS_AplResultFlg ?? true,
                    EYCESSS_MarksEntryMax: Number(se.EYCESSS_MarksEntryMax ?? se.eycessS_MarksEntryMax ?? 0) || 0,
                    // Standardized payload format
                    EMSE_Id: se.EMSE_Id ?? se.emsE_Id ?? se.EMSE_Id,
                    EMSE_SubExamOrder: se.emsE_SubExamOrder ?? idx + 1,
                    ismS_Id: s.ismS_Id
                }))
            }));
    };

    const buildExmSubjectSubsubjectsList = () => {
        return subjects
            .filter((s) => Array.isArray(s.subSubjectConfig) && s.subSubjectConfig.length > 0)
            .map((s) => ({
                ismS_Id: s.ismS_Id,
                sub_subjs_list: s.subSubjectConfig.map((ss: any, idx: number) => ({
                    EYCESSS_Id: ss.EYCESSS_Id ?? 0,
                    EYCES_Id: ss.EYCES_Id ?? 0,
                    ismS_Id: s.ismS_Id,
                    EMSS_Id: ss.EMSS_Id ?? ss.emsS_Id ?? ss.EMSS_Id,
                    EMGR_Id: ss.emgR_Id ?? 0,
                    EYCESSS_MaxMarks: Number(ss.EYCESSS_MaxMarks ?? ss.eycessS_MaxMarks ?? 0) || 0,
                    EYCESSS_MinMarks: Number(ss.EYCESSS_MinMarks ?? ss.eycessS_MinMarks ?? 0) || 0,
                    EYCESSS_MarksEntryMax: Number(ss.EYCESSS_MarksEntryMax ?? ss.eycessS_MarksEntryMax ?? 0) || 0,
                    EYCESSS_ExemptedFlg: ss.eycessS_ExemptedFlg ?? false,
                    EYCESSS_ExemptedPer: Number(ss.eycessS_ExemptedPer) || 0,
                    EYCESSS_MarksFlg: !!(ss.eycessS_MarksDisplayFlg ?? false),
                    EYCESSS_GradesFlg: !!(ss.eycessS_GradeDisplayFlg ?? false),
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
                ismS_Id: s.ismS_Id,
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
            const isValid = validateSubjectsRef.current?.();

            if (!isValid) {
                toast.error('Please fill required marks for selected subjects (Max Marks, Min Marks, Max Entry Marks)');
                return;
            }
            const ok = await trigger();
            if (!ok) {
                toast.error('Please fix validation errors before saving');
                return;
            }
            const checkedSubjects = (subjects?.length > 0 ? subjects : (values.yearly_category_exam_subjects ?? [])).filter(
                (s: any) => s.checkedvalue === true
            );

            if (checkedSubjects.length === 0) {
                toast.error('Please select at least one subject');
                return;
            }
            const exams_list = exams
                .filter((e) => e.checked)
                .map((e) => ({
                    EME_Id: e.EME_Id,
                    EME_ExamName: e.EME_ExamName,
                    checked: true
                }));
            if (exams_list.length === 0) {
                toast.error('Please select at least one exam');
                return;
            }
            const exm_subject_subexams_list = buildExmSubjectSubExamsList();
            const exm_subject_subsubjects_list = buildExmSubjectSubsubjectsList();
            const exm_subject_subsubjects_subexam = buildExmSubjectSubsubjectsSubexamList();

            const recordEyceId = Number(values.EYCE_Id || rowData?.eycE_Id || 0) || 0;
            const defaultGradeId = Number(values.EMGR_Id || rowData?.emgR_Id || watchGrade || 0) || 0;

            const yearly_category_exam_subjects = checkedSubjects.map((s: any, index: number) => ({
                EYCES_Id: Number(s.eyceS_Id || s.EYCES_Id || 0) || 0,
                EYCE_Id: Number(s.eycE_Id || s.EYCE_Id || recordEyceId) || recordEyceId,
                ismS_Id: Number(s.ismS_Id || s.ISMS_Id || 0) || 0,
                EMGR_Id: Number(s.emgR_Id || s.emgr_Id || defaultGradeId) || defaultGradeId,
                EYCES_MaxMarks:
                    s.eyceS_MaxMarks !== '' && s.eyceS_MaxMarks !== null && s.eyceS_MaxMarks !== undefined ? Number(s.eyceS_MaxMarks) : 0,
                EYCES_MinMarks:
                    s.eyceS_MinMarks !== '' && s.eyceS_MinMarks !== null && s.eyceS_MinMarks !== undefined ? Number(s.eyceS_MinMarks) : 0,
                EYCES_MarksEntryMax:
                    s.eyceS_MarksEntryMax !== '' && s.eyceS_MarksEntryMax !== null && s.eyceS_MarksEntryMax !== undefined
                        ? Number(s.eyceS_MarksEntryMax)
                        : 0,
                EYCES_SubExamFlg: Boolean(s.eyceS_SubExamFlg ?? s.EYCES_SubExamFlg ?? false),
                EYCES_SubSubjectFlg: Boolean(s.eyceS_SubSubjectFlg ?? s.EYCES_SubSubjectFlg ?? false),
                EYCES_MarksGradeEntryFlg: s.eyceS_MarksGradeEntryFlg || s.EYCES_MarksGradeEntryFlg || 'M',
                EYCES_MarksDisplayFlg: Boolean(s.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? true),
                EYCES_GradeDisplayFlg: Boolean(s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? false),
                EYCES_AplResultFlg: Boolean(s.eyceS_AplResultFlg ?? s.EYCES_AplResultFlg ?? true),
                EYCES_ActiveFlg: Boolean(s.eyceS_ActiveFlg ?? s.EYCES_ActiveFlg ?? true),
                EYCES_SubjectOrder: Number(s.eyceS_SubjectOrder || s.EYCES_SubjectOrder || index + 1) || index + 1,
                Exam_Subject_PT_GradeList: s.exam_Subject_PT_GradeList ?? []
            }));

            const finalPayload = {
                ...values,
                EYCE_Id: recordEyceId,
                UserId: 0,
                MI_Id: 0,
                ASMAY_Id: Number(values.ASMAY_Id) || 0,
                EMCA_Id: Number(values.EMCA_Id || rowData?.emcA_Id || 0) || 0,
                EYC_Id: Number(values.EYC_Id || rowData?.eyC_Id || 0) || 0,
                EMGR_Id: defaultGradeId,
                ASMAY_Year: '',
                EYCE_BestOfApplicableFlg: Boolean(values.EYCE_BestOfApplicableFlg ?? false),
                EYCE_BestOf: values.EYCE_BestOfApplicableFlg ? Number(values.EYCE_BestOf) || 0 : 0,
                EYCE_AttendanceFromDate: toBackendDate(values.EYCE_AttendanceFromDate),
                EYCE_AttendanceToDate: toBackendDate(values.EYCE_AttendanceToDate),
                exams_list,
                yearly_category_exam_subjects,
                exm_subject_subexams_list,
                exm_subject_subsubjects_list,
                exm_subject_subsubjects_subexam,
                Temp_Subject_Order: values.Temp_Subject_Order ?? []
            };
            const res: any = await addOrUpdateExamSubjectWizard(finalPayload);
            const isSuccess =
                res?.success === true ||
                res?.returnval === true ||
                res?.returnval === 'true' ||
                res?.returnval === 'saved' ||
                res?.returnVal === true ||
                res?.returnVal === 'true' ||
                res?.returnVal === 'saved' ||
                res?.returnVal === 'updated' ||
                res?.returnval === 'updated' ||
                res?.returnval === 'Record Saved Successfully' ||
                res?.returnVal === 'Record Saved Successfully' ||
                (res &&
                    typeof res === 'object' &&
                    res?.success !== false &&
                    res?.returnval !== false &&
                    res?.returnVal !== false &&
                    res?.returnval !== 'failed' &&
                    res?.returnVal !== 'failed' &&
                    res?.returnval !== 'duplicate' &&
                    res?.returnVal !== 'duplicate' &&
                    res?.returnval !== 'Duplicate' &&
                    res?.returnVal !== 'Duplicate' &&
                    !res?.error);

            if (isSuccess) {
                toast.success(res?.message || 'Subject details saved successfully');
                onSuccess?.();
                refetchAll();
                router.refresh();
            } else if (
                res?.returnval === 'duplicate' ||
                res?.returnVal === 'duplicate' ||
                res?.returnval === 'Duplicate' ||
                res?.returnVal === 'Duplicate'
            ) {
                toast.error(res?.message || 'Subject details already exist for the selected exam');
            } else {
                toast.error(res?.message || res?.error || 'Failed to save subject details');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Failed to save subject details');
        }
    };

    const onError = (formErrors: any) => {
        console.warn('Validation errors:', formErrors);
        let errorMsg = 'Please fill all required fields before saving';
        if (formErrors && typeof formErrors === 'object') {
            for (const key of Object.keys(formErrors)) {
                const err = formErrors[key];
                if (err?.message && typeof err.message === 'string') {
                    errorMsg = err.message;
                    break;
                }
                if (Array.isArray(err)) {
                    const firstSub = err.find((item: any) => item?.message);
                    if (firstSub?.message) {
                        errorMsg = firstSub.message;
                        break;
                    }
                }
            }
        }
        toast.error(errorMsg);
    };

    const handleReset = () => {
        reset({
            UserId: 0,
            MI_Id: 0,
            ASMAY_Id: undefined,
            ASMAY_Year: '',
            EYCE_BestOfApplicableFlg: false,
            EYCE_BestOf: undefined,
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

    const handleOpenSetOrderModal = () => {
        if (!subjects || subjects.length === 0) {
            toast.error('No subjects available to set order. Please select Category first.');
            return;
        }
        setIsSetOrderOpen(true);
    };

    const handleSaveSubjectOrder = (updatedData: any[]) => {
        const orderedSubjects = [...subjects]
            .sort((a, b) => {
                const indexA = updatedData.findIndex((item) => Number(item.ismS_Id) === Number(a.ismS_Id));
                const indexB = updatedData.findIndex((item) => Number(item.ismS_Id) === Number(b.ismS_Id));
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            })
            .map((sub, idx) => ({
                ...sub,
                eyceS_SubjectOrder: idx + 1
            }));

        setSubjects(orderedSubjects);

        const temp_Subject_Order = updatedData.map((item, index) => ({
            eyceS_Id: Number(item.eyceS_Id || 0),
            eycE_Id: Number(item.eycE_Id || rowData?.eycE_Id || 0),
            ismS_Id: Number(item.ismS_Id),
            eyceS_SubjectOrder: index + 1
        }));

        setValue('Temp_Subject_Order', temp_Subject_Order);
        toast.success('Subject order updated successfully');
        setIsSetOrderOpen(false);
    };

    const isTopFieldsFilled = watchYear && watchCategory;
    const hasSelectedExams = (Array.isArray(exams) && exams.some((e) => e.checked)) || Boolean(rowData?.eycE_Id);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <CollapsibleSection defaultOpen>
                    {isEditFormLoading ? (
                        <div className='flex h-64 items-center justify-center'>
                            <div className='text-center'>
                                <RefreshCw className='mx-auto h-8 w-8 animate-spin text-secondary' />
                                <p className='mt-2 text-gray-600 text-sm'>Loading data...</p>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                                        {academicYearLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading Academic Year...
                                                            </SelectItem>
                                                        ) : (
                                                            academicYears.map((item) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />

                                    <div>
                                        <Label>
                                            Category <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='EYC_Id'
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value ? String(field.value) : undefined}
                                                    onValueChange={(val) => {
                                                        const selectedCategory = categories.find((c) => c.eyC_Id.toString() === val);
                                                        if (selectedCategory) {
                                                            field.onChange(Number(selectedCategory.eyC_Id));
                                                            setValue('EMCA_Id', Number(selectedCategory.emcA_Id), { shouldValidate: true });
                                                        }
                                                    }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Category' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoriesLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading Categories...
                                                            </SelectItem>
                                                        ) : categories.length === 0 ? (
                                                            <SelectItem value='error' disabled>
                                                                No Categories Found
                                                            </SelectItem>
                                                        ) : (
                                                            categories.map((c) => (
                                                                <SelectItem key={c.eyC_Id} value={c.eyC_Id.toString()}>
                                                                    {c.emcA_CategoryName}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.EYC_Id && <FormError>{errors.EYC_Id.message}</FormError>}
                                    </div>

                                    <div>
                                        <Label>
                                            Exams <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='exams_list'
                                            render={({ field }) => (
                                                <CustomMultiSelectBox
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
                                                        field.onChange(
                                                            updatedExams
                                                                .filter((e) => e.checked)
                                                                .map((e) => ({ EME_Id: e.EME_Id, EME_ExamName: e.EME_ExamName }))
                                                        );
                                                    }}
                                                    isSearchRequired={true}
                                                    height='220px'
                                                />
                                            )}
                                        />
                                        {errors.exams_list && <FormError>{errors.exams_list.message}</FormError>}
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
                                                    //fromDate={today}
                                                    toDate={
                                                        watch('EYCE_AttendanceToDate')
                                                            ? new Date(watch('EYCE_AttendanceToDate'))
                                                            : undefined
                                                    }
                                                    restricted_tofieldName='Attendence To-Date'
                                                    restricted_fromfieldName='Attendence From-Date'
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
                                                    fromDate={
                                                        watch('EYCE_AttendanceFromDate')
                                                            ? new Date(watch('EYCE_AttendanceFromDate'))
                                                            : undefined
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    {/* BEST APPLICABLE + BEST OFF INPUT */}
                                    <div className='mt-3 flex items-center gap-6'>
                                        {/* Checkbox -> EYCE_BestOfApplicableFlg */}
                                        <div className='flex items-center gap-2'>
                                            <Checkbox
                                                id='bestApplicableCheckbox'
                                                checked={watch('EYCE_BestOfApplicableFlg')}
                                                onCheckedChange={(value) => setValue('EYCE_BestOfApplicableFlg', Boolean(value))}
                                            />
                                            <label htmlFor='bestApplicableCheckbox' className='font-medium text-sm'>
                                                Best Applicable
                                            </label>
                                        </div>

                                        {/* BEST OFF NUMBER FIELD */}
                                        <div className='w-32'>
                                            <Controller
                                                control={control}
                                                name='EYCE_BestOf'
                                                render={({ field, fieldState }) => (
                                                    <div className='flex items-center gap-3'>
                                                        {/* Label beside input */}
                                                        <Label className='whitespace-nowrap'>
                                                            Best Off{' '}
                                                            {watch('EYCE_BestOfApplicableFlg') && <span className='text-red-500'>*</span>}
                                                        </Label>

                                                        <InputNumber
                                                            minValue={1}
                                                            isDisabled={!watch('EYCE_BestOfApplicableFlg')} // Enable only when checked
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            className='w-24' // adjust width if needed
                                                        />

                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                            {errors.EYCE_BestOf && <FormError>{errors.EYCE_BestOf.message}</FormError>}
                                        </div>
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
                                {hasSelectedExams ? (
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
                                        onRegisterValidate={(fn) => {
                                            validateSubjectsRef.current = fn;
                                        }}
                                    />
                                ) : (
                                    <div className='flex flex-col items-center justify-center rounded-xl border border-gray-300 border-dashed bg-gray-50/60 p-8 text-center'>
                                        <p className='font-medium text-gray-500 text-sm'>
                                            Please select at least one Exam above to display and configure subjects.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='mt-6 flex w-fit gap-4'>
                                <Button type='button' variant='outline' onClick={handleReset}>
                                    Reset
                                </Button>
                                <Button type='submit' disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleOpenSetOrderModal}
                                    disabled={!subjects || subjects.length === 0}
                                    className='flex items-center gap-2'>
                                    <ArrowUpDown className='h-4 w-4' />
                                    Set Order
                                </Button>
                            </div>
                        </>
                    )}
                </CollapsibleSection>

                {isSetOrderOpen && (
                    <MasterViewDetails
                        isOpen={isSetOrderOpen}
                        onClose={() => setIsSetOrderOpen(false)}
                        data={subjects.map((s, idx) => ({
                            ...s,
                            id: Number(s.ismS_Id),
                            eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? idx + 1
                        }))}
                        columns={[
                            { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                            { key: 'ismS_SubjectName', label: 'Subject Name', className: 'text-left' },
                            { key: 'ismS_SubjectCode', label: 'Subject Code', className: 'text-left' },
                            { key: 'eyceS_SubjectOrder', label: 'Exam-Subject Order', className: 'text-center w-36' }
                        ]}
                        onSave={handleSaveSubjectOrder}
                        tableHeight='500px'
                        title='EXM-SUBJECT ORDER SETTING'
                    />
                )}

                {!isEditFormLoading && (
                    <SubExamModal
                        open={subExamModalState.open}
                        subject={subExamModalState.subject}
                        onClose={handleSubExamClose}
                        onSave={handleSaveSubExam}
                        gradeList={gradeList}
                        schema={SubSubjectSubExamSchema}
                    />
                )}

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

const _mapToSubExamConfig = (r: any) => ({
    eycessS_Id: r.eycessS_Id ?? 0,
    eyceS_Id: 0,
    emsE_Id: r.emsE_Id,
    emgR_Id: Number(r.emgR_Id) || null,
    eycessS_MaxMarks: Number(r.eycessS_MaxMarks) || 0,
    eycessS_MinMarks: Number(r.eycessS_MinMarks) || 0,
    eycessS_ExemptedFlg: !!r.eycessS_ExemptedFlg,
    eycessS_ExemptedPer: Number(r.eycessS_ExemptedPer) || 0,
    eycessS_ActiveFlg: !!r.eycessS_ActiveFlg,
    eycessS_MarksFlg: !!r.eycessS_MarksFlg,
    eycessS_GradesFlg: !!r.eycessS_GradesFlg,
    eycessS_AplResultFlg: !!r.eycessS_AplResultFlg,
    eycessS_MarksEntryMax: Number(r.eycessS_MarksEntryMax) || 0,
    emsE_SubExamOrder: Number(r.emsE_SubExamOrder) || 0
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
    emgR_Id: l.emgR_Id ?? '',
    eycessS_ExemptedFlg: l.eycessS_ExemptedFlg,
    eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
    eycessS_MarksDisplayFlg: l.eycessS_MarksDisplayFlg,
    eycessS_GradeDisplayFlg: l.eycessS_GradeDisplayFlg,
    eycessS_AplResultFlg: l.eycessS_AplResultFlg,
    emsS_SubSubjectOrder: l.emsS_Order
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
