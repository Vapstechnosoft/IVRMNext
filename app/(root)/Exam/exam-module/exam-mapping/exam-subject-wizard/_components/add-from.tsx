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
    getSubExamList,
    getSubSubjectList,
    getSubjectsByCategory
} from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import { getExamsByCategoryandAcademicYear } from '@/server/exam/exam-module/masters/exam';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { ICategory, IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import SubExamModal from './subexam-model';
import SubjectTable from './subject-table';
import SubSubjectModal from './subsubject-modal';

type FormFields = z.infer<typeof ExamSubjectWizardSchema.addOrUpdate>;

/**
 * ✅ AddExamSubjectWizard (refactored for new schema)
 * - Keeps all original logic and UI
 * - Field names aligned with EYCE_, EYC_, etc.
 * - Category fetch uses EYC_Id
 * - Subjects stored in yearly_category_exam_subjects
 */
export default function AddExamSubjectWizard({ onSuccess }: { onSuccess?: () => void }) {
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
            exm_subject_subsubjects_subexam: [],
            Temp_Subject_Order: [],
            EYCE_BestOfApplicableFlg: false,
            EYCE_BestOf: undefined
        }
    });

    const { watch, setValue, getValues, handleSubmit, formState } = methods;
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
    const watchDates = [watch('EYCE_AttendanceFromDate'), watch('EYCE_AttendanceToDate')];

    // modals
    const [subExamModalState, setSubExamModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [subSubjectModalState, setSubSubjectModalState] = useState<{ open: boolean; subject?: any }>({
        open: false
    });

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: gradeData, isLoading: loadingGrade, error: gradeError } = useMasterGrade();

    // ------------------- Fetch Dropdowns -----------------------
    useEffect(() => {
        // Academic Years
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

        // Grades
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

    // ------------------- Category Fetch -----------------------
    useEffect(() => {
        if (!watchYear) return;
        async function fetchRelated() {
            try {
                const { data: cats } = await getCategoryDropDownByAcademicYearlist(30, Number(watchYear));
                setCategories(Array.isArray(cats) ? cats : []);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
            }
        }
        fetchRelated();
    }, [watchYear, setValue]);

    // ------------------- Exams & Subjects Fetch -------------------
    useEffect(() => {
        if (!watchEMCA_ID) return;
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
            } catch {
                setExams([]);
                toast.error('Failed to load exams.');
            }

            try {
                const { data: subj } = await getSubjectsByCategory(30, Number(watchCategory));
                console.log(subj);
                const formattedSubjects = Array.isArray(subj)
                    ? subj.map((s: any) => ({
                          ISMS_Id: s.ismS_Id ?? s.ISMS_Id,
                          ISMS_SubjectName: s.ismS_SubjectName ?? s.ISMS_SubjectName,
                          EYCES_MaxMarks: s.EYCES_MaxMarks ?? 0,
                          EYCES_MinMarks: s.EYCES_MinMarks ?? 0,
                          EMGR_Id: watchGrade ?? 'M',
                          EYCES_SubExamFlg: false,
                          EYCES_SubSubjectFlg: false,
                          EYCES_ActiveFlg: true,
                          Exam_Subject_PT_GradeList: []
                      }))
                    : [];
                setSubjects(formattedSubjects);
                console.log(formattedSubjects);
                setValue('yearly_category_exam_subjects', formattedSubjects);
            } catch {
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
    }, [watchCategory, setValue]);

    // propagate grade to subjects
    useEffect(() => {
        if (watchGrade) setSubjects((prev) => prev.map((s) => ({ ...s, EMGR_Id: Number(watchGrade) || s.EMGR_Id })));
    }, [watchGrade]);

    // ------------------- Modal Handlers -------------------
    const onOpenSubExamModal = async (subject: any) => {
        try {
            const { data: list } = await getSubExamList(30, subject.ISMS_Id);
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
            const { data: list } = await getSubSubjectList(30, subject.ISMS_Id);
            console.log(list);
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

    // ------------------- Save Modals -------------------
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

    // ------------------- Submit Handler -------------------
    const onSubmit = async (values: FormFields) => {
        try {
            const subExamList: any[] = [];
            const subSubjectList: any[] = [];
            const subSubjectSubExamList: any[] = [];

            subjects.forEach((s) => {
                // ----- SubExam list -----
                if (s.subExamConfig?.length) {
                    subExamList.push({
                        ISMS_Id: s.ISMS_Id,
                        sub_exam_list: s.subExamConfig.map((se: any) => ({
                            EYCESSE_Id: se.EYCESSE_Id ?? 0,
                            EYCES_Id: se.EYCES_Id ?? 0,
                            ISMS_Id: s.ISMS_Id,
                            EMSE_Id: se.EMSE_Id,
                            EMGR_Id: se.EMGR_Id ?? s.EMGR_Id ?? 0,
                            EYCESSE_MaxMarks: se.EYCESSE_MaxMarks ?? 0,
                            EYCESSE_MinMarks: se.EYCESSE_MinMarks ?? 0,
                            EYCESSE_ActiveFlg: true
                        }))
                    });
                }

                // ----- SubSubject list -----
                if (s.subSubjectConfig?.length) {
                    subSubjectList.push({
                        ISMS_Id: s.ISMS_Id,
                        sub_subject_list: s.subSubjectConfig.map((ss: any) => ({
                            EYCESSS_Id: ss.EYCESSS_Id ?? 0,
                            EYCES_Id: ss.EYCES_Id ?? 0,
                            ISMS_Id: s.ISMS_Id,
                            EMSS_Id: ss.EMSS_Id,
                            EMGR_Id: ss.EMGR_Id ?? s.EMGR_Id ?? 0,
                            EYCESSS_MaxMarks: ss.EYCESSS_MaxMarks ?? 0,
                            EYCESSS_MinMarks: ss.EYCESSS_MinMarks ?? 0,
                            EYCESSS_ExemptedFlg: ss.EYCESSS_ExemptedFlg ?? true,
                            EYCESSS_ExemptedPer: ss.EYCESSS_ExemptedPer ?? 35,
                            EYCESSS_ActiveFlg: true,
                            EYCESSS_SubSubjectOrder: ss.EYCESSS_SubSubjectOrder ?? 0
                        }))
                    });
                }

                // ----- SubSubject + SubExam combined -----
                if (s.subSubjectConfig?.length) {
                    subSubjectSubExamList.push({
                        ISMS_Id: s.ISMS_Id,
                        sub_subject_sub_exam_list: s.subSubjectConfig.map((ss: any) => ({
                            EYCESSS_Id: ss.EYCESSS_Id ?? 0,
                            EYCES_Id: ss.EYCES_Id ?? 0,
                            EMSS_Id: ss.EMSS_Id,
                            EMSE_Id: ss.EMSE_Id,
                            EMGR_Id: ss.EMGR_Id ?? s.EMGR_Id ?? 0,
                            EYCESSS_MaxMarks: ss.EYCESSS_MaxMarks ?? 25,
                            EYCESSS_MinMarks: ss.EYCESSS_MinMarks ?? 10,
                            EYCESSS_ExemptedFlg: ss.EYCESSS_ExemptedFlg ?? true,
                            EYCESSS_ExemptedPer: ss.EYCESSS_ExemptedPer ?? 35,
                            EYCESSS_ActiveFlg: true,
                            EYCESSS_SubSubjectOrder: ss.EYCESSS_SubSubjectOrder ?? 0
                        }))
                    });
                }
            });

            const payload: FormFields = {
                ...values,
                UserId: 0,
                MI_Id: 0,
                ASMAY_Id: Number(values.ASMAY_Id) ?? 0,
                ASMAY_Year: '',
                EYCE_BestOfApplicableFlg: values.EYCE_BestOfApplicableFlg ?? true,
                EYCE_BestOf: values.EYCE_BestOf ?? 5,
                exams_list: exams.filter((e) => e.checked),
                yearly_category_exam_subjects: subjects,
                exm_subject_subexams_list: subExamList,
                exm_subject_subsubjects_list: subSubjectList,
                exm_subject_subsubjects_subexam: subSubjectSubExamList,
                Temp_Subject_Order: []
            };

            console.log('🚀 Final Payload:', payload);
            await addOrUpdateExamSubjectWizard(payload);
            toast.success('Exam Subject Wizard saved successfully');
            onSuccess?.();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message ?? 'Failed to save Exam Subject Wizard');
        }
    };

    const isTopFieldsFilled = watchYear && watchCategory && watchGrade && watchDates[0] && watchDates[1];

    // ------------------- JSX -------------------
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CollapsibleSection defaultOpen>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left side */}
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
                                            setValue('EMCA_Id', Number(selectedCategory.emcA_Id)); // 👈 extra field stored
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

                        {/* Right side */}
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
                            subjects={subjects}
                            setSubjects={setSubjects}
                            showSubExamColumn={watchSubExam ?? false}
                            showSubSubjectColumn={watchSubSubject ?? false}
                            onOpenSubExamModal={onOpenSubExamModal}
                            onOpenSubSubjectModal={onOpenSubSubjectModal}
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
            </form>
        </FormProvider>
    );
}
