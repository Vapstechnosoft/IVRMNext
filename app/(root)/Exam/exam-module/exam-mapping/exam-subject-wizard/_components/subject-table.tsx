// SubjectTableWithValidation.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

/**
 * NOTE:
 * - This file normalizes incoming subject objects, supports legacy keys (ECYSES_*) and current keys (EYCES_*).
 * - It avoids repeated parent updates by comparing the last sent subjects payload.
 * - Keeps all UI and handlers: header global toggles, per-row toggles, handleMapClick, validation, submit builder.
 */

// ---------- Your provided schema (adapted into file scope) ----------
export const BaseExamSubjectSchema = {
    addOrUpdate: z
        .object({
            // Primary Identifiers
            EYCE_Id: z.number().int().nonnegative().optional().default(0),
            EYC_Id: z.number().int().positive({ message: 'EYC_Id is required' }),
            ISMS_Id: z.number().int().positive({ message: 'ISMS_Id is required' }),
            EMCA_Id: z.number().int().positive({ message: 'EMCA_Id is required' }),
            EMGR_Id: z.number().int().positive({ message: 'EMGR_Id is required' }),

            // Subject Info
            ISMS_SubjectName: z.string().min(1, { message: 'Subject name is required' }),
            ISMS_SubjectCode: z.string().min(1, { message: 'Subject code is required' }),

            // Marks & Grade Info
            EYCES_MaxMarks: z.number().min(0, { message: 'Max marks must be 0 or greater' }).max(1000, { message: 'Max marks too large' }),
            EYCES_MinMarks: z.number().min(0, { message: 'Min marks must be 0 or greater' }).max(1000, { message: 'Min marks too large' }),
            EYCES_MarksEntryMax: z
                .number()
                .min(0, { message: 'Marks entry max must be 0 or greater' })
                .max(1000, { message: 'Marks entry max too large' }),

            // Flags
            EYCES_SubExamFlg: z.boolean().optional().default(false),
            EYCES_SubSubjectFlg: z.boolean().optional().default(false),
            EYCES_MarksGradeEntryFlg: z.enum(['M', 'G'], { message: 'Invalid marks/grade entry flag' }),
            EYCES_MarksDisplayFlg: z.boolean().optional().default(true),
            EYCES_GradeDisplayFlg: z.boolean().optional().default(true),
            EYCES_AplResultFlg: z.boolean().optional().default(true),
            EYCES_ActiveFlg: z.boolean().optional().default(true),

            // Order
            EYCES_SubjectOrder: z.number().int().min(1, { message: 'Subject order must be at least 1' }),

            // Optional info
            PT_Count: z.number().int().nonnegative().optional().default(0),

            // Meta info
            UserId: z.number().int().nonnegative().optional().default(0),
            MI_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Year: z.string().optional().nullable()
        })
        //  Cross-field validations
        .refine((data) => data.EYC_Id > 0 && data.ISMS_Id > 0 && data.EMCA_Id > 0, {
            message: 'Required identifiers are missing',
            path: ['EYC_Id']
        })
        .refine((data) => data.EYC_Id > 0, { message: 'EYC_Id must be positive', path: ['EYC_Id'] })
        .refine((data) => data.EYCES_MinMarks <= data.EYCES_MaxMarks, {
            message: 'Min marks must be less than or equal to Max marks',
            path: ['EYCES_MinMarks']
        })
        .refine((data) => data.EYCES_MarksEntryMax <= data.EYCES_MaxMarks, {
            message: 'Marks entry max cannot exceed Max marks',
            path: ['EYCES_MarksEntryMax']
        }),

    //  Delete schema block
    delete: z.object({
        EYCE_Id: z.number({ required_error: 'EYCE_Id is required' }).int().positive({ message: 'Invalid EYCE_Id' })
    })
};

// ---------- Types ----------
type Grade = { emgR_Id: number | string; emgR_GradeName: string };

type SubjectRowRaw = {
    ISMS_Id: number;
    ISMS_SubjectName?: string;
    ismS_SubjectCode?: string;
    // possible keys from backend / UI
    EYCES_MaxMarks?: number | string;
    EYCES_MinMarks?: number | string;
    EYCES_MarksEntryMax?: number | string;
    EYCES_MarksGradeEntryFlg?: 'M' | 'G' | string;
    EYCES_MarksDisplayFlg?: boolean;
    EYCES_GradeDisplayFlg?: boolean;
    EYCES_AplResultFlg?: boolean;
    EYCES_SubExamFlg?: boolean;
    EYCES_SubSubjectFlg?: boolean;
    // legacy keys
    ECYSES_MaxMarks?: number | string;
    ECYSES_MinMarks?: number | string;
    ECYSES_MarksEntryMax?: number | string;
    ECYSES_MarksGradeEntryFlg?: 'M' | 'G' | string;
    ECYSES_MarksDisplayFlg?: boolean;
    ECYSES_GradeDisplayFlg?: boolean;
    ECYSES_AplResultFlg?: boolean;
    ECYSES_SubExamFlg?: boolean;
    ECYSES_SubSubjectFlg?: boolean;

    // checked flag variations
    checkedvalue?: boolean;
    checkedValue?: boolean;
    checked?: boolean;

    // nested configs
    subExamConfig?: any[];
    subSubjectConfig?: any[];
    subSubjectSubExamConfig?: any[];
    Exam_Subject_PT_GradeList?: any[];

    EMGR_Id?: number | string;
    emgr_Id?: number | string;
    EYCES_Id?: number;
    EYCE_Id?: number;
};

type NormalizedSubject = {
    ISMS_Id: number;
    ISMS_SubjectName?: string;
    ISMS_SubjectCode?: string;
    EYCES_MaxMarks: number;
    EYCES_MinMarks: number;
    EYCES_MarksEntryMax: number;
    EYCES_MarksGradeEntryFlg: 'M' | 'G' | string;
    EYCES_MarksDisplayFlg: boolean;
    EYCES_GradeDisplayFlg: boolean;
    EYCES_AplResultFlg: boolean;
    EYCES_SubExamFlg: boolean;
    EYCES_SubSubjectFlg: boolean;
    checkedvalue: boolean;
    EMGR_Id?: number | string;
    subExamConfig?: any[];
    subSubjectConfig?: any[];
    Exam_Subject_PT_GradeList?: any[];
    EYCES_SubjectOrder?: number;
    EYCES_ActiveFlg?: boolean;
    EYCES_Id?: number;
    EYCE_Id?: number;
};

// ---------- Component ----------
export default function SubjectTableWithValidation({
    initialSubjects,
    setParentSubjects,
    showSubExamColumn = true,
    showSubSubjectColumn = true,
    onOpenSubExamModal,
    onOpenSubSubjectModal,
    onOpenSubSubjectSubExamModal,
    gradeList
}: {
    initialSubjects: SubjectRowRaw[];
    setParentSubjects: (s: SubjectRowRaw[]) => void;
    showSubExamColumn?: boolean;
    showSubSubjectColumn?: boolean;
    onOpenSubExamModal: (subject: any) => void;
    onOpenSubSubjectModal: (subject: any) => void;
    onOpenSubSubjectSubExamModal: (subject: any) => void;
    gradeList: IMasterGrade[];
}) {
    // ---------- local state ----------
    const [subjects, setSubjects] = useState<NormalizedSubject[]>([]);
    const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

    // Global header state for checkboxes (Marks Display, Grade Display, Apply to Result)
    const [globalHeader, setGlobalHeader] = useState({
        selectAll: false,
        maxMarks: '',
        minMarks: '',
        maxEntry: '',
        subExam: false,
        subSubject: false,
        marksDisplay: false,
        gradeDisplay: false,
        applyToResult: false
    });

    // react-hook-form (kept for extension; not used heavily inside this component)
    const form = useForm({ resolver: zodResolver(BaseExamSubjectSchema.addOrUpdate) as any });

    // ---------- helpers ----------
    const firstDefinedNumber = (...vals: any[]) => {
        for (const v of vals) {
            if (v !== undefined && v !== null && v !== '') return Number(v);
        }
        return 0;
    };

    const firstDefinedBoolean = (...vals: any[]) => {
        for (const v of vals) {
            if (v !== undefined && v !== null) return Boolean(v);
        }
        return false;
    };

    // normalize a single raw subject to a stable shape
    const normalizeSubject = (raw: SubjectRowRaw, idx = 0): NormalizedSubject => {
        const checked = Boolean(raw.checkedvalue ?? raw.checkedValue ?? raw.checked ?? false);

        const maxMarks = firstDefinedNumber(raw.EYCES_MaxMarks, raw.ECYSES_MaxMarks, raw.EYCES_MaxMarks);
        const minMarks = firstDefinedNumber(raw.EYCES_MinMarks, raw.ECYSES_MinMarks, raw.EYCES_MinMarks);
        const marksEntry = firstDefinedNumber(raw.EYCES_MarksEntryMax, raw.ECYSES_MarksEntryMax, raw.EYCES_MarksEntryMax);

        const marksGradeFlag = (raw.EYCES_MarksGradeEntryFlg ?? raw.ECYSES_MarksGradeEntryFlg ?? 'M') as 'M' | 'G' | string;

        const marksDisplay = firstDefinedBoolean(raw.EYCES_MarksDisplayFlg, raw.ECYSES_MarksDisplayFlg, true);
        const gradeDisplay = firstDefinedBoolean(raw.EYCES_GradeDisplayFlg, raw.ECYSES_GradeDisplayFlg, true);
        const applyToResult = firstDefinedBoolean(raw.EYCES_AplResultFlg, raw.ECYSES_AplResultFlg, true);

        const subExamFlg = firstDefinedBoolean(raw.EYCES_SubExamFlg, raw.ECYSES_SubExamFlg, false);
        const subSubjectFlg = firstDefinedBoolean(raw.EYCES_SubSubjectFlg, raw.ECYSES_SubSubjectFlg, false);

        return {
            ISMS_Id: raw.ISMS_Id,
            ISMS_SubjectName: raw.ISMS_SubjectName,
            ISMS_SubjectCode: raw.ismS_SubjectCode ?? undefined,
            EYCES_MaxMarks: maxMarks,
            EYCES_MinMarks: minMarks,
            EYCES_MarksEntryMax: marksEntry,
            EYCES_MarksGradeEntryFlg: (marksGradeFlag as 'M' | 'G') ?? 'M',
            EYCES_MarksDisplayFlg: marksDisplay,
            EYCES_GradeDisplayFlg: gradeDisplay,
            EYCES_AplResultFlg: applyToResult,
            EYCES_SubExamFlg: subExamFlg,
            EYCES_SubSubjectFlg: subSubjectFlg,
            checkedvalue: checked,
            EMGR_Id: raw.EMGR_Id ?? raw.emgr_Id,
            subExamConfig: raw.subExamConfig ?? [],
            subSubjectConfig: raw.subSubjectConfig ?? [],
            Exam_Subject_PT_GradeList: raw.Exam_Subject_PT_GradeList ?? [],
            EYCES_SubjectOrder: idx + 1,
            EYCES_ActiveFlg: firstDefinedBoolean(raw.EYCES_ActiveFlg, raw.EYCES_ActiveFlg, true),
            EYCES_Id: raw.EYCES_Id ?? 0,
            EYCE_Id: raw.EYCE_Id ?? 0
        };
    };

    // ---------- normalize when initialSubjects changes ----------
    useEffect(() => {
        if (!Array.isArray(initialSubjects)) {
            setSubjects([]);
            return;
        }
        // Only normalize once from incoming props to internal state
        const normalized = initialSubjects.map((r, i) => normalizeSubject(r, i));
        setSubjects(normalized);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSubjects]);

    // ---------- avoid repeated parent updates: only call when payload actually changes ----------
    const lastSentRef = useRef<string | null>(null);
    useEffect(() => {
        // map back to legacy/parent format
        const mappedBack = subjects.map((s) => ({
            ISMS_Id: s.ISMS_Id,
            ISMS_SubjectName: s.ISMS_SubjectName,
            EYCES_MaxMarks: String(s.EYCES_MaxMarks ?? 0),
            EYCES_MinMarks: String(s.EYCES_MinMarks ?? 0),
            EYCES_MarksEntryMax: String(s.EYCES_MarksEntryMax ?? 0),
            EYCES_MarksGradeEntryFlg: s.EYCES_MarksGradeEntryFlg,
            EYCES_MarksDisplayFlg: s.EYCES_MarksDisplayFlg,
            EYCES_GradeDisplayFlg: s.EYCES_GradeDisplayFlg,
            EYCES_AplResultFlg: s.EYCES_AplResultFlg,
            EYCES_SubExamFlg: s.EYCES_SubExamFlg,
            EYCES_SubSubjectFlg: s.EYCES_SubSubjectFlg,
            checkedvalue: s.checkedvalue,
            EMGR_Id: s.EMGR_Id,
            subExamConfig: s.subExamConfig,
            subSubjectConfig: s.subSubjectConfig,
            Exam_Subject_PT_GradeList: s.Exam_Subject_PT_GradeList,
            EYCES_SubjectOrder: s.EYCES_SubjectOrder,
            EYCES_ActiveFlg: s.EYCES_ActiveFlg,
            EYCES_Id: s.EYCES_Id,
            EYCE_Id: s.EYCE_Id
        }));

        const str = JSON.stringify(mappedBack);
        if (lastSentRef.current !== str) {
            lastSentRef.current = str;
            // call parent setter once — parent should not echo back the exact same object (if it does, the compare above prevents a loop)
            setParentSubjects(mappedBack);
        }
    }, [subjects, setParentSubjects]);

    // ---------- Derived header logic ----------
    const derivedHeader = useMemo(() => {
        if (subjects.length === 0) {
            return {
                allSelected: false,
                allSubExam: false,
                allSubSubject: false,
                allMarksDisplay: false,
                allGradeDisplay: false,
                allApplyToResult: false,
                headerMaxMarks: '',
                headerMinMarks: '',
                headerMaxEntry: ''
            };
        }

        const allSelected = subjects.every((s) => !!s.checkedvalue);
        const allSubExam = subjects.every((s) => !!s.EYCES_SubExamFlg);
        const allSubSubject = subjects.every((s) => !!s.EYCES_SubSubjectFlg);
        const allMarksDisplay = subjects.every((s) => !!s.EYCES_MarksDisplayFlg);
        const allGradeDisplay = subjects.every((s) => !!s.EYCES_GradeDisplayFlg);
        const allApplyToResult = subjects.every((s) => !!s.EYCES_AplResultFlg);

        const allMaxMarksSame = subjects.every((s) => s.EYCES_MaxMarks === subjects[0].EYCES_MaxMarks);
        const allMinMarksSame = subjects.every((s) => s.EYCES_MinMarks === subjects[0].EYCES_MinMarks);
        const allMaxEntrySame = subjects.every((s) => s.EYCES_MarksEntryMax === subjects[0].EYCES_MarksEntryMax);

        return {
            allSelected,
            allSubExam,
            allSubSubject,
            allMarksDisplay,
            allGradeDisplay,
            allApplyToResult,
            headerMaxMarks: allMaxMarksSame ? String(subjects[0]?.EYCES_MaxMarks ?? '') : '',
            headerMinMarks: allMinMarksSame ? String(subjects[0]?.EYCES_MinMarks ?? '') : '',
            headerMaxEntry: allMaxEntrySame ? String(subjects[0]?.EYCES_MarksEntryMax ?? '') : ''
        };
    }, [subjects]);

    useEffect(() => {
        setGlobalHeader((prev) => ({
            ...prev,
            selectAll: derivedHeader.allSelected,
            subExam: derivedHeader.allSubExam,
            subSubject: derivedHeader.allSubSubject,
            marksDisplay: derivedHeader.allMarksDisplay,
            gradeDisplay: derivedHeader.allGradeDisplay,
            applyToResult: derivedHeader.allApplyToResult,
            maxMarks: derivedHeader.headerMaxMarks,
            minMarks: derivedHeader.headerMinMarks,
            maxEntry: derivedHeader.headerMaxEntry
        }));
    }, [derivedHeader]);

    // ---------- Update helpers ----------
    const setSubjectChecked = (id: number, checked: boolean) => {
        setSubjects((prev) => prev.map((s) => (s.ISMS_Id === id ? { ...s, checkedvalue: checked } : s)));
    };

    const updateSubjectField = (id: number, key: keyof NormalizedSubject | string, value: any) => {
        setSubjects((prev) => prev.map((s) => (s.ISMS_Id === id ? { ...s, [key]: value } : s)));
        // clear any row error for this key
        setErrors((prev) => {
            const copy = { ...prev };
            if (!copy[id]) return prev;
            delete copy[id][key as string];
            if (Object.keys(copy[id]).length === 0) delete copy[id];
            return copy;
        });
    };

    const handleHeaderChange = (field: string, value: any) => {
        setGlobalHeader((prev) => ({ ...prev, [field]: value }));

        if (field === 'selectAll') {
            setSubjects((s) => s.map((row) => ({ ...row, checkedvalue: !!value })));
        } else if (field === 'subExam') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_SubExamFlg: !!value })));
        } else if (field === 'subSubject') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_SubSubjectFlg: !!value })));
        } else if (field === 'marksDisplay') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MarksDisplayFlg: !!value })));
        } else if (field === 'gradeDisplay') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_GradeDisplayFlg: !!value })));
        } else if (field === 'applyToResult') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_AplResultFlg: !!value })));
        } else if (field === 'maxMarks') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MaxMarks: Number(value || 0) })));
        } else if (field === 'minMarks') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MinMarks: Number(value || 0) })));
        } else if (field === 'maxEntry') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MarksEntryMax: Number(value || 0) })));
        }
    };

    // ---------- Validation using zod for each subject ----------
    const validateSubjects = (): boolean => {
        const rowErrors: Record<number, Record<string, string>> = {};

        subjects.forEach((row) => {
            // build minimal object matching schema
            const examplePayload = {
                EYCE_Id: row.EYCE_Id ?? 0,
                EYC_Id: 1, // NOTE: schema requires EYC_Id etc. We cannot validate cross-fields exactly without full form context.
                ISMS_Id: row.ISMS_Id,
                EMCA_Id: 1,
                EMGR_Id: Number(row.EMGR_Id ?? 0) || 1,

                ISMS_SubjectName: row.ISMS_SubjectName ?? '',
                ISMS_SubjectCode: row.ISMS_SubjectCode ?? String(row.ISMS_Id),

                EYCES_MaxMarks: Number(row.EYCES_MaxMarks ?? 0),
                EYCES_MinMarks: Number(row.EYCES_MinMarks ?? 0),
                EYCES_MarksEntryMax: Number(row.EYCES_MarksEntryMax ?? 0),

                EYCES_SubExamFlg: !!row.EYCES_SubExamFlg,
                EYCES_SubSubjectFlg: !!row.EYCES_SubSubjectFlg,
                EYCES_MarksGradeEntryFlg: (row.EYCES_MarksGradeEntryFlg as 'M' | 'G') ?? 'M',
                EYCES_MarksDisplayFlg: !!row.EYCES_MarksDisplayFlg,
                EYCES_GradeDisplayFlg: !!row.EYCES_GradeDisplayFlg,
                EYCES_AplResultFlg: !!row.EYCES_AplResultFlg,
                EYCES_ActiveFlg: !!row.EYCES_ActiveFlg,

                EYCES_SubjectOrder: Number(row.EYCES_SubjectOrder ?? 1),
                PT_Count: 0,
                UserId: 0,
                MI_Id: 0,
                ASMAY_Id: 0,
                ASMAY_Year: ''
            };

            const result = BaseExamSubjectSchema.addOrUpdate.safeParse(examplePayload);
            if (!result.success) {
                const issues = result.error.issues;
                rowErrors[row.ISMS_Id] = {};
                issues.forEach((iss) => {
                    const path = iss.path.join('.') || 'general';
                    rowErrors[row.ISMS_Id][path] = iss.message;
                });
            }

            // additional rule: if row is selected (checkedvalue) then ensure required marks fields are present
            if (row.checkedvalue) {
                if (row.EYCES_MaxMarks === undefined || row.EYCES_MaxMarks === null) {
                    rowErrors[row.ISMS_Id] = {
                        ...(rowErrors[row.ISMS_Id] || {}),
                        EYCES_MaxMarks: 'Max marks required for selected subject'
                    };
                }
                if (row.EYCES_MinMarks === undefined || row.EYCES_MinMarks === null) {
                    rowErrors[row.ISMS_Id] = {
                        ...(rowErrors[row.ISMS_Id] || {}),
                        EYCES_MinMarks: 'Min marks required for selected subject'
                    };
                }
                if (row.EYCES_MarksEntryMax === undefined || row.EYCES_MarksEntryMax === null) {
                    rowErrors[row.ISMS_Id] = {
                        ...(rowErrors[row.ISMS_Id] || {}),
                        EYCES_MarksEntryMax: 'Entry max is required for selected subject'
                    };
                }
            }
        });

        setErrors(rowErrors);
        return Object.keys(rowErrors).length === 0;
    };

    // expose validator to window for external trigger
    useEffect(() => {
        (window as any).validateSubjectTable = validateSubjects;
    }, [subjects]);

    // ---------- handleMapClick ----------
    const handleMapClick = (subject: any) => {
        // open appropriate modal depending on flags
        if (subject.EYCES_SubExamFlg && subject.EYCES_SubSubjectFlg) {
            onOpenSubSubjectSubExamModal(subject);
        } else if (showSubExamColumn && subject.EYCES_SubExamFlg) {
            onOpenSubExamModal(subject);
        } else if (showSubSubjectColumn && subject.EYCES_SubSubjectFlg) {
            onOpenSubSubjectModal(subject);
        } else {
            toast.error('Enable SubExam or SubSubject for mapping first.');
        }
    };

    // ---------- Build yearly_category_exam_subjects payload (only checked subjects) ----------
    const buildYearlyCategoryExamSubjectsForSubmit = () => {
        const checkedSubjects = subjects.filter((s) => s.checkedvalue === true);

        if (!checkedSubjects || checkedSubjects.length === 0) {
            toast.error('Select at least one subject');
            return null;
        }

        // run validation
        const ok = validateSubjects();
        if (!ok) {
            toast.error('Fix validation errors before saving subjects');
            return null;
        }

        const mapped = checkedSubjects.map((s, idx) => ({
            EYCES_Id: s.EYCES_Id ?? 0,
            EYCE_Id: s.EYCE_Id ?? 0,
            ISMS_Id: s.ISMS_Id,
            EMGR_Id: Number(s.EMGR_Id ?? 0),
            EYCES_MaxMarks: Number(s.EYCES_MaxMarks ?? 0),
            EYCES_MinMarks: Number(s.EYCES_MinMarks ?? 0),
            EYCES_MarksEntryMax: Number(s.EYCES_MarksEntryMax ?? 0),
            EYCES_SubExamFlg: !!s.EYCES_SubExamFlg,
            EYCES_SubSubjectFlg: !!s.EYCES_SubSubjectFlg,
            EYCES_ActiveFlg: !!s.EYCES_ActiveFlg,
            EYCES_SubjectOrder: s.EYCES_SubjectOrder ?? idx + 1,
            Exam_Subject_PT_GradeList: s.Exam_Subject_PT_GradeList ?? []
        }));

        return mapped;
    };

    // ---------- Submit handler (example) ----------
    const handleSubmit = async () => {
        const payloadSubjects = buildYearlyCategoryExamSubjectsForSubmit();
        if (!payloadSubjects) return;

        const finalPayload = {
            EYCE_Id: 0,
            EYC_Id: 0,
            EMGR_Id: 0,
            EYCE_SubExamFlg: true,
            EYCE_SubSubjectFlg: true,
            EYCE_ActiveFlg: true,
            EYCE_AttendanceFromDate: '',
            EYCE_AttendanceToDate: '',
            UserId: 0,
            MI_Id: 0,
            ASMAY_Id: 0,
            ASMAY_Year: '',
            EYCE_BestOfApplicableFlg: true,
            EYCE_BestOf: 5,
            exams_list: [],
            yearly_category_exam_subjects: payloadSubjects,
            exm_subject_subexams_list: [],
            exm_subject_subsubjects_list: [],
            exm_subject_subsubjects_subexam: [],
            Temp_Subject_Order: []
        };

        console.log('Final payload to send:', JSON.stringify(finalPayload, null, 2));
        toast.info('Submitting subjects...');

        // replace with your API call:
        // const res = await addOrUpdateExamSubjectWizard(finalPayload);
        // handle res...
        setTimeout(() => {
            toast.success('Subjects submitted (simulated)');
        }, 400);
    };

    // ---------- UI ----------
    return (
        <div className='overflow-x-auto rounded-md bg-white p-2 shadow-sm'>
            <div className='mb-3 flex items-center justify-between gap-4'>
                <div>
                    <h3 className='font-semibold text-lg'>Subjects</h3>
                    <p className='text-slate-500 text-sm'>Select subjects and configure marks / grade settings.</p>
                </div>
            </div>

            {subjects.length === 0 ? (
                <div className='p-4 text-slate-500 text-sm'>No subjects available.</div>
            ) : (
                <table className='w-full table-auto border-collapse text-sm'>
                    <thead>
                        <tr className='bg-gray-50 text-left text-[13px] text-slate-700'>
                            <th className='w-10 border p-2 text-center'>SLNO</th>
                            <th className='w-16 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Select</div>
                                    <Checkbox
                                        checked={!!globalHeader.selectAll}
                                        onCheckedChange={(v) => handleHeaderChange('selectAll', !!v)}
                                    />
                                </div>
                            </th>
                            <th className='border p-2 text-left'>Subject Name (Code)</th>

                            <th className='w-32 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Max. Marks</div>
                                    <Input
                                        value={globalHeader.maxMarks ?? ''}
                                        onChange={(e) => handleHeaderChange('maxMarks', e.target.value)}
                                        className='h-7 text-center text-sm'
                                    />
                                </div>
                            </th>

                            <th className='w-28 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Min. Marks</div>
                                    <Input
                                        value={globalHeader.minMarks ?? ''}
                                        onChange={(e) => handleHeaderChange('minMarks', e.target.value)}
                                        className='h-7 text-center text-sm'
                                    />
                                </div>
                            </th>

                            <th className='w-32 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Max. Entry Marks</div>
                                    <Input
                                        value={globalHeader.maxEntry ?? ''}
                                        onChange={(e) => handleHeaderChange('maxEntry', e.target.value)}
                                        className='h-7 text-center text-sm'
                                    />
                                </div>
                            </th>

                            {showSubExamColumn && (
                                <th className='w-20 border p-2 text-center'>
                                    <div className='flex flex-col items-center'>
                                        <div className='mb-1 text-[13px]'>Sub Exam</div>
                                        <Checkbox
                                            checked={!!globalHeader.subExam}
                                            onCheckedChange={(v) => handleHeaderChange('subExam', !!v)}
                                        />
                                    </div>
                                </th>
                            )}

                            {showSubSubjectColumn && (
                                <th className='w-20 border p-2 text-center'>
                                    <div className='flex flex-col items-center'>
                                        <div className='mb-1 text-[13px]'>Sub Subject</div>
                                        <Checkbox
                                            checked={!!globalHeader.subSubject}
                                            onCheckedChange={(v) => handleHeaderChange('subSubject', !!v)}
                                        />
                                    </div>
                                </th>
                            )}

                            {(showSubExamColumn || showSubSubjectColumn) && <th className='w-20 border p-2 text-center'>Map</th>}

                            <th className='w-48 border p-2 text-center'>Marks / Grade</th>

                            <th className='w-20 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Marks Display</div>
                                    <Checkbox
                                        checked={!!globalHeader.marksDisplay}
                                        onCheckedChange={(v) => handleHeaderChange('marksDisplay', !!v)}
                                    />
                                </div>
                            </th>

                            <th className='w-20 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Grade Display</div>
                                    <Checkbox
                                        checked={!!globalHeader.gradeDisplay}
                                        onCheckedChange={(v) => handleHeaderChange('gradeDisplay', !!v)}
                                    />
                                </div>
                            </th>

                            <th className='w-28 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Apply to Result</div>
                                    <Checkbox
                                        checked={!!globalHeader.applyToResult}
                                        onCheckedChange={(v) => handleHeaderChange('applyToResult', !!v)}
                                    />
                                </div>
                            </th>

                            <th className='w-36 border p-2 text-center'>Grade</th>
                        </tr>
                    </thead>

                    <tbody>
                        {subjects.map((s, index) => {
                            const canToggleSubFlags =
                                s.EYCES_MaxMarks !== undefined && s.EYCES_MinMarks !== undefined && s.EYCES_MarksEntryMax !== undefined;

                            return (
                                <tr key={s.ISMS_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className='border p-2 text-center align-top'>{index + 1}</td>

                                    <td className='border p-2 text-center'>
                                        <Checkbox checked={!!s.checkedvalue} onCheckedChange={(v) => setSubjectChecked(s.ISMS_Id, !!v)} />
                                    </td>

                                    <td className='border p-2'>
                                        <div className='text-sm'>
                                            <div className='font-medium'>{s.ISMS_SubjectName}</div>
                                            <div className='text-slate-500 text-xs'>{s.ISMS_SubjectCode ?? ''}</div>
                                        </div>
                                    </td>

                                    {/* Max Marks */}
                                    <td className='w-28 border p-2'>
                                        <Input
                                            value={s.EYCES_MaxMarks ?? ''}
                                            onChange={(e) => updateSubjectField(s.ISMS_Id, 'EYCES_MaxMarks', Number(e.target.value || 0))}
                                            className='text-center'
                                        />
                                        {errors[s.ISMS_Id]?.EYCES_MaxMarks && (
                                            <div className='mt-1 text-red-500 text-xs'>{errors[s.ISMS_Id]?.EYCES_MaxMarks}</div>
                                        )}
                                    </td>

                                    {/* Min Marks */}
                                    <td className='w-24 border p-2'>
                                        <Input
                                            value={s.EYCES_MinMarks ?? ''}
                                            onChange={(e) => updateSubjectField(s.ISMS_Id, 'EYCES_MinMarks', Number(e.target.value || 0))}
                                            className='text-center'
                                        />
                                        {errors[s.ISMS_Id]?.EYCES_MinMarks && (
                                            <div className='mt-1 text-red-500 text-xs'>{errors[s.ISMS_Id]?.EYCES_MinMarks}</div>
                                        )}
                                    </td>

                                    {/* Max Entry */}
                                    <td className='w-28 border p-2'>
                                        <Input
                                            value={s.EYCES_MarksEntryMax ?? ''}
                                            onChange={(e) =>
                                                updateSubjectField(s.ISMS_Id, 'EYCES_MarksEntryMax', Number(e.target.value || 0))
                                            }
                                            className='text-center'
                                        />
                                        {errors[s.ISMS_Id]?.EYCES_MarksEntryMax && (
                                            <div className='mt-1 text-red-500 text-xs'>{errors[s.ISMS_Id]?.EYCES_MarksEntryMax}</div>
                                        )}
                                    </td>

                                    {/* SubExam/SubSubject/Map columns */}
                                    {showSubExamColumn && (
                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!s.EYCES_SubExamFlg}
                                                onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_SubExamFlg', !!v)}
                                                disabled={!canToggleSubFlags}
                                            />
                                        </td>
                                    )}

                                    {showSubSubjectColumn && (
                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!s.EYCES_SubSubjectFlg}
                                                onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_SubSubjectFlg', !!v)}
                                                disabled={!canToggleSubFlags}
                                            />
                                        </td>
                                    )}

                                    {(showSubExamColumn || showSubSubjectColumn) && (
                                        <td className='border p-2 text-center'>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => handleMapClick(s)}
                                                disabled={!(s.EYCES_SubExamFlg || s.EYCES_SubSubjectFlg)}>
                                                Map
                                            </Button>
                                        </td>
                                    )}

                                    {/* Marks / Grade options */}
                                    <td className='border p-2'>
                                        <div className='flex items-center gap-3'>
                                            <label className='flex items-center gap-1 text-sm'>
                                                <input
                                                    type='radio'
                                                    name={`marksGrade-${s.ISMS_Id}`}
                                                    checked={s.EYCES_MarksGradeEntryFlg === 'M'}
                                                    onChange={() => updateSubjectField(s.ISMS_Id, 'EYCES_MarksGradeEntryFlg', 'M')}
                                                />
                                                <span>Marks</span>
                                            </label>
                                            <label className='flex items-center gap-1 text-sm'>
                                                <input
                                                    type='radio'
                                                    name={`marksGrade-${s.ISMS_Id}`}
                                                    checked={s.EYCES_MarksGradeEntryFlg === 'G'}
                                                    onChange={() => updateSubjectField(s.ISMS_Id, 'EYCES_MarksGradeEntryFlg', 'G')}
                                                />
                                                <span>Grade</span>
                                            </label>
                                        </div>
                                    </td>

                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.EYCES_MarksDisplayFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_MarksDisplayFlg', !!v)}
                                        />
                                    </td>

                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.EYCES_GradeDisplayFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_GradeDisplayFlg', !!v)}
                                        />
                                    </td>

                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.EYCES_AplResultFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_AplResultFlg', !!v)}
                                        />
                                    </td>

                                    <td className='w-44 border p-2'>
                                        <Select
                                            value={s.EMGR_Id ? String(s.EMGR_Id) : ''}
                                            onValueChange={(val) => updateSubjectField(s.ISMS_Id, 'EMGR_Id', Number(val))}>
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
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
