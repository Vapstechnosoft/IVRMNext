'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExamSubjectWizardSchema, SubExamSchema, SubSubjectSchema } from '@/schemas/exam/exam-module/exam-mapping';
import {
    addOrUpdateExamSubjectWizard,
    getAcademicYears,
    getCategoriesByAcademicYear,
    getExamsByCategory,
    getSubExamList,
    getSubSubjectList,
    getSubjectsByGroup
} from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import SubExamModal from './subexam-model';
import SubjectTable from './subject-table';
import SubSubjectModal from './subsubject-modal';

type FormFields = z.infer<typeof ExamSubjectWizardSchema.addOrUpdate>;
export default function AddExamSubjectWizard({ onSuccess }: { onSuccess?: () => void }) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(ExamSubjectWizardSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            AMCO_Id: '',
            EMG_Id: '',
            exam_list: [],
            subject_list: [],
            EMGR_Id: '',
            ECYSE_AttendanceFromDate: '',
            ECYSE_AttendanceToDate: '',

            ECYSE_SubExamFlg: false,
            ECYSE_SubSubjectFlg: false
        }
    });

    const { watch, setValue, getValues, handleSubmit, formState } = methods;
    const { errors, isSubmitting } = formState;

    // dropdown states
    const [academicYears, setAcademicYears] = useState<{ id: string; label: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: string; emE_ExamName: string; checked?: boolean }[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [gradeList, setGradeList] = useState<{ emgR_Id: string; emgR_GradeName: string }[]>([]);

    const watchYear = watch('AMCO_Id');
    const watchCategory = watch('EMG_Id');
    const watchSubExam = watch('ECYSE_SubExamFlg');
    const watchSubSubject = watch('ECYSE_SubSubjectFlg');
    const watchGrade = watch('EMGR_Id');
    const watchDates = [watch('ECYSE_AttendanceFromDate'), watch('ECYSE_AttendanceToDate')];

    // modals
    const [subExamModalState, setSubExamModalState] = useState<{ open: boolean; subject?: any }>({ open: false });
    const [subSubjectModalState, setSubSubjectModalState] = useState<{ open: boolean; subject?: any }>({ open: false });

    // ------------------- Fetch Dropdowns -----------------------
    useEffect(() => {
        (async () => {
            try {
                const yrs = await getAcademicYears();
                setAcademicYears(yrs as { id: string; label: string }[]);
            } catch {
                setAcademicYears([
                    { id: '2025-2026', label: '2025-2026' },
                    { id: '2024-2025', label: '2024-2025' }
                ]);
            }

            try {
                const g = await fetch('/api/exam/grades').then((r) => r.json());
                setGradeList(g.data || []);
            } catch {
                setGradeList([
                    { emgR_Id: '1', emgR_GradeName: 'Grade - 100M' },
                    { emgR_Id: '2', emgR_GradeName: 'Grade - 50M' }
                ]);
            }
        })();
    }, []);

    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                const cats = await getCategoriesByAcademicYear(watchYear);
                setCategories(cats as { id: string; label: string }[]);
            } catch {
                setCategories([
                    { id: 'G1', label: 'GROUP - VI' },
                    { id: 'G2', label: 'GROUP - I' }
                ]);
            }
        })();
    }, [watchYear]);

    useEffect(() => {
        if (!watchCategory) return;
        (async () => {
            try {
                const ex = await getExamsByCategory(watchCategory);
                setExams(ex as { emE_Id: string; emE_ExamName: string; checked?: boolean }[]);
            } catch {
                setExams([
                    { emE_Id: 'E1', emE_ExamName: 'FA-1' },
                    { emE_Id: 'E2', emE_ExamName: 'Second Unit Test' },
                    { emE_Id: 'E3', emE_ExamName: 'I Term Exam' }
                ]);
            }

            try {
                const subj = await getSubjectsByGroup(watchCategory);
                setSubjects(subj as any[]);
                setValue('subject_list', subj as any[]);
            } catch {
                const fallback = [
                    { ismS_Id: 1, ismS_SubjectName: 'Kannada', checkedvalue: true, ECYSES_MaxMarks: '100', ECYSES_MinMarks: '35' },
                    { ismS_Id: 2, ismS_SubjectName: 'French', checkedvalue: true, ECYSES_MaxMarks: '22', ECYSES_MinMarks: '22' }
                ];
                setSubjects(fallback);
                setValue('subject_list', fallback as any[]);
            }
        })();
    }, [watchCategory, setValue]);

    // propagate grade
    useEffect(() => {
        if (watchGrade) setSubjects((prev) => prev.map((s) => ({ ...s, EMGR_Id: watchGrade })));
    }, [watchGrade]);

    // ------------------- Modal Open Handlers -------------------
    const onOpenSubExamModal = async (subject: any) => {
        try {
            const list = await getSubExamList(1, subject.ismS_Id);
            setSubExamModalState({ open: true, subject: { ...subject, list } });
        } catch {
            setSubExamModalState({
                open: true,
                subject: {
                    ...subject,
                    list: [
                        { emsE_Id: 1, emsE_SubExamName: 'Internal Test' },
                        { emsE_Id: 2, emsE_SubExamName: 'Viva' }
                    ]
                }
            });
        }
    };

    const onOpenSubSubjectModal = async (subject: any) => {
        try {
            const list = await getSubSubjectList(1, subject.ismS_Id);
            setSubSubjectModalState({ open: true, subject: { ...subject, list } });
        } catch {
            setSubSubjectModalState({
                open: true,
                subject: {
                    ...subject,
                    list: [
                        { emsS_Id: 1, emsS_SubSubjectName: 'Theory' },
                        { emsS_Id: 2, emsS_SubSubjectName: 'Practical' }
                    ]
                }
            });
        }
    };

    // ------------------- Modal Save Handlers -------------------
    const handleSaveSubExam = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ismS_Id === subjectId ? { ...s, subExamConfig: selectedList, ECYSES_SubExamFlg: selectedList.length > 0 } : s
            )
        );
        setSubExamModalState({ open: false });
    };

    const handleSaveSubSubject = (subjectId: number, selectedList: any[]) => {
        setSubjects((prev) =>
            prev.map((s) =>
                s.ismS_Id === subjectId ? { ...s, subSubjectConfig: selectedList, ECYSES_SubSubjectFlg: selectedList.length > 0 } : s
            )
        );
        setSubSubjectModalState({ open: false });
    };

    // ------------------- Submit Handler -------------------
    const onSubmit = async (values: FormFields) => {
        try {
            const payload = {
                ...values,
                exams_list: exams.filter((e) => e.checked),
                subject_list: subjects
            };
            await addOrUpdateExamSubjectWizard(payload);
            toast.success('Exam Subject Wizard saved successfully');
            onSuccess?.();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message ?? 'Failed to save');
        }
    };

    const isTopFieldsFilled = watchYear && watchCategory && watchGrade && watchDates[0] && watchDates[1];

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CollapsibleSection title='Add Exam Subject Wizard' defaultOpen>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left side */}
                        <div className='space-y-4'>
                            <div>
                                <Label>Academic Year *</Label>
                                <Select value={watchYear} onValueChange={(val) => setValue('AMCO_Id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((y) => (
                                            <SelectItem key={y.id} value={y.id}>
                                                {y.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.AMCO_Id && <FormError>{errors.AMCO_Id.message}</FormError>}
                            </div>

                            <div>
                                <Label>Category *</Label>
                                <Select value={watchCategory} onValueChange={(val) => setValue('EMG_Id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Category' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.EMG_Id && <FormError>{errors.EMG_Id.message}</FormError>}
                            </div>

                            <div>
                                <Label>Exam *</Label>
                                <div className='space-y-2 rounded-md border p-2'>
                                    {exams.map((ex) => (
                                        <label key={ex.emE_Id} className='flex items-center gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={!!ex.checked}
                                                onChange={(e) => {
                                                    ex.checked = e.target.checked;
                                                    setExams([...exams]);
                                                }}
                                            />
                                            <span>{ex.emE_ExamName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className='space-y-4'>
                            <div>
                                <Label>Grade *</Label>
                                <Select value={watchGrade} onValueChange={(val) => setValue('EMGR_Id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Grade' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeList.map((g) => (
                                            <SelectItem key={g.emgR_Id} value={g.emgR_Id}>
                                                {g.emgR_GradeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <Controller
                                    control={methods.control}
                                    name='ECYSE_AttendanceFromDate'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Attendance From'
                                            placeholder='Select Attendance From Date'
                                        />
                                    )}
                                />

                                <Controller
                                    control={methods.control}
                                    name='ECYSE_AttendanceToDate'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Attendance To'
                                            placeholder='Select Attendance To Date'
                                        />
                                    )}
                                />
                            </div>

                            {/* ✅ Number input with type-safe conversion */}
                            {/* <div className='mt-4'>
                                <Label>Best Applicable Best Off</Label>
                                <Input
                                    type='number'
                                    placeholder='Enter Best Off Value'
                                    value={
                                        getValues('ECYSE_BestOff') ? Number(getValues('ECYSE_BestOff')) : '' // ensure correct type for input value
                                    }
                                    onChange={(e) => setValue('ECYSE_BestOff', e.target.value ? Number(e.target.value) : '')}
                                />
                            </div> */}

                            <div className='mt-2 flex items-center gap-4'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='subExamCheckbox'
                                        checked={watchSubExam}
                                        onCheckedChange={(v) => setValue('ECYSE_SubExamFlg', Boolean(v))}
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
                                        onCheckedChange={(v) => setValue('ECYSE_SubSubjectFlg', Boolean(v))}
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
                            showSubExamColumn={watchSubExam}
                            showSubSubjectColumn={watchSubSubject}
                            onOpenSubExamModal={onOpenSubExamModal}
                            onOpenSubSubjectModal={onOpenSubSubjectModal}
                            gradeList={gradeList}
                        />
                    </div>

                    <div className='mt-6 flex gap-4'>
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
                    schema={SubExamSchema.addOrUpdate}
                    gradeList={gradeList}
                />
                <SubSubjectModal
                    open={subSubjectModalState.open}
                    subject={subSubjectModalState.subject}
                    onClose={() => setSubSubjectModalState({ open: false })}
                    onSave={handleSaveSubSubject}
                    schema={SubSubjectSchema.addOrUpdate}
                    gradeList={gradeList}
                />
            </form>
        </FormProvider>
    );
}
