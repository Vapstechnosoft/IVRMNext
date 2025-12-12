// SubjectTableWithValidation.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export const BaseExamSubjectSchema = {
    addOrUpdate: z
        .object({
            EYCE_Id: z.number().int().nonnegative().optional().default(0),
            EYC_Id: z.number().int().positive({ message: 'EYC_Id is required' }),
            ISMS_Id: z.number().int().positive({ message: 'ISMS_Id is required' }),
            EMCA_Id: z.number().int().positive({ message: 'EMCA_Id is required' }),
            EMGR_Id: z.number().int().positive({ message: 'EMGR_Id is required' }),

            ISMS_SubjectName: z.string().min(1, { message: 'Subject name is required' }),
            ISMS_SubjectCode: z.string().min(1, { message: 'Subject code is required' }),

            // -------- MARKS UPDATED HERE --------
            // If val is '' or undefined or NaN or 0 → treat as undefined
            EYCES_MaxMarks: z.preprocess((val) => {
                const num = Number(val);
                return !val || Number.isNaN(num) || num === 0 ? undefined : num;
            }, z.number().min(1).max(100).optional()),
            EYCES_MinMarks: z.preprocess((val) => {
                const num = Number(val);
                return !val || Number.isNaN(num) || num === 0 ? undefined : num;
            }, z.number().min(1).max(100).optional()),
            EYCES_MarksEntryMax: z.preprocess((val) => {
                const num = Number(val);
                return !val || Number.isNaN(num) || num === 0 ? undefined : num;
            }, z.number().min(1).max(100).optional()),
            // -------------------------------------

            EYCES_SubExamFlg: z.boolean().optional().default(false),
            EYCES_SubSubjectFlg: z.boolean().optional().default(false),
            EYCES_MarksGradeEntryFlg: z.enum(['M', 'G'], { message: 'Invalid marks/grade entry flag' }),
            EYCES_MarksDisplayFlg: z.boolean().optional().default(true),
            EYCES_GradeDisplayFlg: z.boolean().optional().default(true),
            EYCES_AplResultFlg: z.boolean().optional().default(true),
            EYCES_ActiveFlg: z.boolean().optional().default(true),

            EYCES_SubjectOrder: z.number().int().min(1, { message: 'Subject order must be at least 1' }),

            PT_Count: z.number().int().nonnegative().optional().default(0),

            UserId: z.number().int().nonnegative().optional().default(0),
            MI_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Year: z.string().optional().nullable()
        })

        // Identifier checks
        .refine((data) => data.EYC_Id > 0 && data.ISMS_Id > 0 && data.EMCA_Id > 0, {
            message: 'Required identifiers are missing',
            path: ['EYC_Id']
        })

        // Conditional cross-field validations
        .refine(
            (data) => data.EYCES_MinMarks === undefined || data.EYCES_MaxMarks === undefined || data.EYCES_MinMarks <= data.EYCES_MaxMarks,
            {
                message: 'Min marks must be ≤ Max marks',
                path: ['EYCES_MinMarks']
            }
        )
        .refine(
            (data) =>
                data.EYCES_MarksEntryMax === undefined ||
                data.EYCES_MaxMarks === undefined ||
                data.EYCES_MarksEntryMax <= data.EYCES_MaxMarks,
            {
                message: 'Marks entry max cannot exceed Max marks',
                path: ['EYCES_MarksEntryMax']
            }
        ),

    delete: z.object({
        EYCE_Id: z.number({ required_error: 'EYCE_Id is required' }).int().positive({ message: 'Invalid EYCE_Id' })
    })
};

// ---------- Types ----------
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
    EYCES_MaxMarks: number | '';
    EYCES_MinMarks: number | '';
    EYCES_MarksEntryMax: number | '';
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

// ---------- Helper utilities ----------
const coerceNumberForSchema = (val: number | '' | string | undefined): number => {
    // Zod expects numbers — empty string or undefined will be replaced by NaN so we must coerce carefully.
    if (val === '' || val === undefined || val === null) return Number.NaN;
    if (typeof val === 'number') return val;
    const n = Number(val);
    return Number.isFinite(n) ? n : Number.NaN;
};

const mapZodIssuePathToField = (path: (string | number)[]): string => {
    // zod error path might be ['EYCES_MinMarks'] or ['some','nested']
    if (path.length === 0) return '';
    return String(path[path.length - 1]);
};
const toNumOrEmpty = (v: any): number | '' => {
    if (v === '' || v === null || v === undefined) return '';
    const n = Number(v);
    return Number.isNaN(n) ? '' : n;
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
    gradeList,
    selectedGrade = 0
}: {
    initialSubjects: SubjectRowRaw[];
    setParentSubjects: (s: SubjectRowRaw[]) => void;
    showSubExamColumn?: boolean;
    showSubSubjectColumn?: boolean;
    onOpenSubExamModal: (subject: any) => void;
    onOpenSubSubjectModal: (subject: any) => void;
    onOpenSubSubjectSubExamModal: (subject: any) => void;
    gradeList: IMasterGrade[];
    selectedGrade?: number;
}) {
    // ---------- local state ----------
    const [subjects, setSubjects] = useState<NormalizedSubject[]>([]);
    // errors: { [ISMS_Id]: { fieldName: message } }
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

    // ---------- helpers ----------
    const firstDefinedNumber = (...vals: any[]) => {
        for (const v of vals) {
            if (v !== undefined && v !== null && v !== '') return Number(v);
        }
        return '';
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

        const maxMarks = firstDefinedNumber(raw.EYCES_MaxMarks, raw.ECYSES_MaxMarks);
        const minMarks = firstDefinedNumber(raw.EYCES_MinMarks, raw.ECYSES_MinMarks);
        const marksEntry = firstDefinedNumber(raw.EYCES_MarksEntryMax, raw.ECYSES_MarksEntryMax);

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
            EYCES_ActiveFlg: firstDefinedBoolean(true),
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
        const normalized = initialSubjects.map((r, i) => normalizeSubject(r, i));
        setSubjects(normalized);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSubjects]);

    // ---------- avoid repeated parent updates: only call when payload actually changes ----------
    const lastSentRef = useRef<string | null>(null);
    useEffect(() => {
        const mappedBack = subjects.map((s) => ({
            ISMS_Id: s.ISMS_Id,
            ISMS_SubjectName: s.ISMS_SubjectName,
            EYCES_MaxMarks: s.EYCES_MaxMarks === '' ? '' : String(s.EYCES_MaxMarks),
            EYCES_MinMarks: s.EYCES_MinMarks === '' ? '' : String(s.EYCES_MinMarks),
            EYCES_MarksEntryMax: s.EYCES_MarksEntryMax === '' ? '' : String(s.EYCES_MarksEntryMax),
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
            setParentSubjects(mappedBack);
        }
    }, [subjects, setParentSubjects]);

    // propagate grade changes into subjects state
    useEffect(() => {
        if (selectedGrade) {
            setSubjects((prev) => prev.map((s) => ({ ...s, EMGR_Id: Number(selectedGrade) || s.EMGR_Id })));
        }
    }, [selectedGrade]);

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

    // Validate a single row using Zod — this returns an object mapping field->message (or empty object)
    const validateRowWithZod = (row: NormalizedSubject): Record<string, string> => {
        // Build a payload that matches the schema's expectations.
        // We must supply required numeric fields as numbers (or NaN will cause parse issues).
        // Some schema fields such as EYC_Id, EMCA_Id are not present in UI; these are required by schema.
        // For safe local validation, we'll provide placeholder positive numbers for those missing required ids.
        // IMPORTANT: For final server submit, ensure the parent populates real EYC_Id / EMCA_Id values.
        const payloadForZod = {
            // schema-required identifiers (we set safe >0 placeholders if missing)
            EYCE_Id: Number(row.EYCE_Id ?? 0),
            EYC_Id: 1, // **placeholder** — schema requires >0. In real submit, parent must include real EYC_Id.
            ISMS_Id: Number(row.ISMS_Id ?? 0),
            EMCA_Id: 1, // **placeholder**
            EMGR_Id: coerceNumberForSchema(row.EMGR_Id) || 0,

            // Subject Info
            ISMS_SubjectName: row.ISMS_SubjectName ?? 'Unknown',
            ISMS_SubjectCode: row.ISMS_SubjectCode ?? 'Unknown',

            // Marks — coerce values
            EYCES_MaxMarks: coerceNumberForSchema(row.EYCES_MaxMarks),
            EYCES_MinMarks: coerceNumberForSchema(row.EYCES_MinMarks),
            EYCES_MarksEntryMax: coerceNumberForSchema(row.EYCES_MarksEntryMax),

            // Flags
            EYCES_SubExamFlg: !!row.EYCES_SubExamFlg,
            EYCES_SubSubjectFlg: !!row.EYCES_SubSubjectFlg,
            EYCES_MarksGradeEntryFlg: (row.EYCES_MarksGradeEntryFlg as 'M' | 'G') ?? 'M',
            EYCES_MarksDisplayFlg: !!row.EYCES_MarksDisplayFlg,
            EYCES_GradeDisplayFlg: !!row.EYCES_GradeDisplayFlg,
            EYCES_AplResultFlg: !!row.EYCES_AplResultFlg,

            // Order
            EYCES_SubjectOrder: Number(row.EYCES_SubjectOrder ?? 1),

            // Optional + meta (defaults)
            PT_Count: 0,
            UserId: 0,
            MI_Id: 0,
            ASMAY_Id: 0,
            ASMAY_Year: null
        };

        // Run safeParse
        const result = BaseExamSubjectSchema.addOrUpdate.safeParse(payloadForZod);

        if (result.success) {
            return {};
        }

        // Map zod issues to our error shape
        const rowErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
            const field = mapZodIssuePathToField(issue.path);
            if (!field) {
                // fallback: put generic message under EYCES_MaxMarks to show something
                rowErrors['EYCES_MaxMarks'] = issue.message;
            } else {
                rowErrors[field] = issue.message;
            }
        });

        return rowErrors;
    };

    // updateSubjectField: updates the subjects array and immediately runs validation for that row (live validation)
    const updateSubjectField = (id: number, key: keyof NormalizedSubject | string, value: any) => {
        setSubjects((prev) => {
            const updated = prev.map((s) => (s.ISMS_Id === id ? { ...s, [key]: value } : s));
            return updated;
        });

        // After updating, run validation for that row (in next tick)
        setTimeout(() => {
            const row = subjects.find((r) => r.ISMS_Id === id);
            // If not found in previous state, use newly updated state
            const freshRow = row ?? subjects.find((r) => r.ISMS_Id === id);
            // But because state update is async, compute row using current DOM value:
            const maybeRow = (() => {
                // try from current subjects (might be old) and fallback to composed object
                const local = subjects.find((r) => r.ISMS_Id === id);
                if (local) return local;
                // build from update — this is a fallback (rare)
                return {
                    ISMS_Id: id,
                    EYCES_MaxMarks: '',
                    EYCES_MinMarks: '',
                    EYCES_MarksEntryMax: '',
                    checkedvalue: false
                } as NormalizedSubject;
            })();

            setErrors((prevErrs) => {
                const current = ((): NormalizedSubject | undefined => {
                    return subjects.find((s) => s.ISMS_Id === id) ?? (maybeRow as NormalizedSubject);
                })();

                if (!current) return prevErrs;
                const rowValidation = validateRowWithZod(current);
                const copy = { ...prevErrs };
                if (Object.keys(rowValidation).length === 0) {
                    // remove any existing errors for this id
                    if (copy[id]) {
                        delete copy[id];
                    }
                } else {
                    copy[id] = { ...copy[id], ...rowValidation };
                }
                return copy;
            });

            return;
        }, 0);

        // Clear the field-specific error immediately (optimistic) to improve UX while zod runs
        setErrors((prev) => {
            const copy = { ...prev };
            if (copy[id]) {
                delete copy[id][key as string];
                if (Object.keys(copy[id]).length === 0) {
                    delete copy[id];
                }
            }
            return copy;
        });
    };

    // handleHeaderChange (keeps behavior, and runs validation for affected rows)
    const handleHeaderChange = (field: string, value: any) => {
        setGlobalHeader((prev) => ({ ...prev, [field]: value }));

        if (field === 'selectAll') {
            setSubjects((s) => s.map((row) => ({ ...row, checkedvalue: !!value })));
            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'subExam') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_SubExamFlg: !!value })));
            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'subSubject') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_SubSubjectFlg: !!value })));
            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'marksDisplay') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MarksDisplayFlg: !!value })));
            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'gradeDisplay') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_GradeDisplayFlg: !!value })));
            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'applyToResult') {
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_AplResultFlg: !!value })));
            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'maxMarks') {
            // Bulk update and validate all rows
            const numOrEmpty = value === '' ? '' : Number(value);
            setSubjects((prev) =>
                prev.map((row) => ({
                    ...row,
                    EYCES_MaxMarks: toNumOrEmpty(value)
                }))
            );

            // run validation after state update
            setTimeout(() => {
                setErrors((prevErrs) => {
                    const copy: Record<number, Record<string, string>> = { ...prevErrs };
                    subjects.forEach((row) => {
                        const candidate = { ...row, EYCES_MaxMarks: numOrEmpty } as NormalizedSubject;
                        const rowValidation = validateRowWithZod(candidate);
                        if (Object.keys(rowValidation).length === 0) {
                            if (copy[row.ISMS_Id]) delete copy[row.ISMS_Id];
                        } else {
                            copy[row.ISMS_Id] = { ...copy[row.ISMS_Id], ...rowValidation };
                        }
                    });
                    return copy;
                });
            }, 0);

            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'minMarks') {
            const numOrEmpty = value === '' ? '' : Number(value);
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MinMarks: numOrEmpty })));

            setTimeout(() => {
                setErrors((prevErrs) => {
                    const copy: Record<number, Record<string, string>> = { ...prevErrs };
                    subjects.forEach((row) => {
                        const candidate = { ...row, EYCES_MinMarks: numOrEmpty } as NormalizedSubject;
                        const rowValidation = validateRowWithZod(candidate);
                        if (Object.keys(rowValidation).length === 0) {
                            if (copy[row.ISMS_Id]) delete copy[row.ISMS_Id];
                        } else {
                            copy[row.ISMS_Id] = { ...copy[row.ISMS_Id], ...rowValidation };
                        }
                    });
                    return copy;
                });
            }, 0);

            return;
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (field === 'maxEntry') {
            const numOrEmpty = value === '' ? '' : Number(value);
            setSubjects((s) => s.map((row) => ({ ...row, EYCES_MarksEntryMax: numOrEmpty })));

            setTimeout(() => {
                setErrors((prevErrs) => {
                    const copy: Record<number, Record<string, string>> = { ...prevErrs };
                    subjects.forEach((row) => {
                        const candidate = { ...row, EYCES_MarksEntryMax: numOrEmpty } as NormalizedSubject;
                        const rowValidation = validateRowWithZod(candidate);
                        if (Object.keys(rowValidation).length === 0) {
                            if (copy[row.ISMS_Id]) delete copy[row.ISMS_Id];
                        } else {
                            copy[row.ISMS_Id] = { ...copy[row.ISMS_Id], ...rowValidation };
                        }
                    });
                    return copy;
                });
            }, 0);

            return;
        }
    };

    // ---------- Full-form validation using Zod (used on final submit and exposed on window) ----------
    const validateSubjects = (): boolean => {
        const rowErrors: Record<number, Record<string, string>> = {};

        subjects.forEach((row) => {
            const rowValidation = validateRowWithZod(row);
            if (Object.keys(rowValidation).length > 0) {
                rowErrors[row.ISMS_Id] = rowValidation;
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

    // ---------- small UX helpers ----------
    const renderFieldError = (rowId: number, field: string) => {
        if (!errors[rowId]) return null;
        const msg = errors[rowId][field];
        if (!msg) return null;
        return <div className='mt-1 text-red-500 text-xs'>{msg}</div>;
    };

    //     const newErrors: Record<number, Record<string, string>> = {};

    //     subjects.forEach((row) => {
    //         const result = BaseExamSubjectSchema.addOrUpdate.safeParse(row);

    //         if (!result.success) {
    //             // Build an error object for this row
    //             const rowErrors: Record<string, string> = {};

    //             result.error.issues.forEach((issue) => {
    //                 const field = issue.path[0];
    //                 rowErrors[field] = issue.message;
    //             });

    //             newErrors[row.ISMS_Id] = rowErrors;
    //         }
    //     });

    //     setErrors(newErrors);
    // }, [subjects]);

    // ---------- table rendering ----------
    return (
        <div className='overflow-x-auto rounded-md bg-white p-2 shadow-sm'>
            <div className='mb-3 flex items-center justify-between gap-4'>
                <div>
                    <h3 className='font-semibold text-lg'>Subjects</h3>
                    <p className='text-slate-500 text-sm'>Select subjects and configure marks / grade settings.</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => {
                            const ok = validateSubjects();
                            if (ok) toast.success('All rows are valid');
                            else toast.error('Please fix validation errors');
                        }}>
                        Validate All
                    </Button>
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
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) handleHeaderChange('maxMarks', val);
                                        }}
                                        className='h-7 text-center text-sm'
                                        inputMode='numeric'
                                        placeholder='Max Marks'
                                    />
                                </div>
                            </th>

                            <th className='w-28 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Min. Marks</div>
                                    <Input
                                        value={globalHeader.minMarks ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) handleHeaderChange('minMarks', val);
                                        }}
                                        className='h-7 text-center text-sm'
                                        inputMode='numeric'
                                        placeholder='Min Marks'
                                    />
                                </div>
                            </th>

                            <th className='w-32 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Max. Entry Marks</div>
                                    <Input
                                        value={globalHeader.maxEntry ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) handleHeaderChange('maxEntry', val);
                                        }}
                                        className='h-7 text-center text-sm'
                                        inputMode='numeric'
                                        placeholder='Max Entry'
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
                            // Check if marks fields are filled to enable SubExam/SubSubject checkboxes
                            const hasMaxMarks =
                                s.EYCES_MaxMarks !== '' &&
                                s.EYCES_MaxMarks !== null &&
                                s.EYCES_MaxMarks !== undefined &&
                                s.EYCES_MaxMarks !== 0;
                            const hasMinMarks =
                                s.EYCES_MinMarks !== '' &&
                                s.EYCES_MinMarks !== null &&
                                s.EYCES_MinMarks !== undefined &&
                                s.EYCES_MinMarks !== 0;
                            const hasEntryMax =
                                s.EYCES_MarksEntryMax !== '' &&
                                s.EYCES_MarksEntryMax !== null &&
                                s.EYCES_MarksEntryMax !== undefined &&
                                s.EYCES_MarksEntryMax !== 0;

                            const canToggleSubFlags = hasMaxMarks && hasMinMarks && hasEntryMax;

                            return (
                                <tr key={s.ISMS_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className='border p-2 text-center align-top'>{index + 1}</td>

                                    <td className='border p-2 text-center align-top'>
                                        <Checkbox checked={!!s.checkedvalue} onCheckedChange={(v) => setSubjectChecked(s.ISMS_Id, !!v)} />
                                    </td>

                                    <td className='border p-2 align-top'>
                                        <div className='text-sm'>
                                            <div className='font-medium'>{s.ISMS_SubjectName}</div>
                                            <div className='text-slate-500 text-xs'>{s.ISMS_SubjectCode ?? ''}</div>
                                        </div>
                                    </td>

                                    {/* Max Marks */}
                                    <td className='w-28 border p-2 align-top'>
                                        <Input
                                            value={s.EYCES_MaxMarks === '' || s.EYCES_MaxMarks === 0 ? '' : String(s.EYCES_MaxMarks)}
                                            onChange={(e) => {
                                                // allow only digits
                                                const raw = e.target.value.replace(/\D/g, '');

                                                updateSubjectField(s.ISMS_Id, 'EYCES_MaxMarks', raw === '' ? '' : Number(raw));

                                                setErrors((prev) => ({
                                                    ...prev,
                                                    [s.ISMS_Id]: {
                                                        ...(prev[s.ISMS_Id] ?? {}),
                                                        EYCES_MinMarks: '',
                                                        EYCES_MarksEntryMax: ''
                                                    }
                                                }));
                                            }}
                                            onBlur={() => {
                                                const row = subjects.find((r) => r.ISMS_Id === s.ISMS_Id);
                                                if (!row) return;

                                                const rowErrors = validateRowWithZod(row);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    [s.ISMS_Id]: rowErrors
                                                }));
                                            }}
                                            placeholder='Enter Max Marks'
                                            inputMode='numeric'
                                            className={`text-center ${errors[s.ISMS_Id]?.EYCES_MaxMarks ? 'border-red-500' : ''}`}
                                        />
                                        {renderFieldError(s.ISMS_Id, 'EYCES_MaxMarks')}
                                    </td>

                                    {/* Min Marks */}
                                    {/* Min Marks */}
                                    <td className='w-24 border p-2 align-top'>
                                        <Input
                                            value={s.EYCES_MinMarks === '' || s.EYCES_MinMarks === 0 ? '' : String(s.EYCES_MinMarks)}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '');

                                                updateSubjectField(s.ISMS_Id, 'EYCES_MinMarks', raw === '' ? '' : Number(raw));

                                                // min only depends on max
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    [s.ISMS_Id]: {
                                                        ...(prev[s.ISMS_Id] ?? {}),
                                                        EYCES_MaxMarks: ''
                                                    }
                                                }));
                                            }}
                                            onBlur={() => {
                                                const row = subjects.find((r) => r.ISMS_Id === s.ISMS_Id);
                                                if (!row) return;

                                                const rowErrors = validateRowWithZod(row);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    [s.ISMS_Id]: rowErrors
                                                }));
                                            }}
                                            placeholder='Enter Min Marks'
                                            inputMode='numeric'
                                            className={`text-center ${errors[s.ISMS_Id]?.EYCES_MinMarks ? 'border-red-500' : ''}`}
                                        />
                                        {renderFieldError(s.ISMS_Id, 'EYCES_MinMarks')}
                                    </td>

                                    {/* Max Entry */}
                                    {/* Max Entry */}
                                    <td className='w-28 border p-2 align-top'>
                                        <Input
                                            value={
                                                s.EYCES_MarksEntryMax === '' || s.EYCES_MarksEntryMax === 0
                                                    ? ''
                                                    : String(s.EYCES_MarksEntryMax)
                                            }
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '');

                                                updateSubjectField(s.ISMS_Id, 'EYCES_MarksEntryMax', raw === '' ? '' : Number(raw));

                                                // entry max only depends on max marks
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    [s.ISMS_Id]: {
                                                        ...(prev[s.ISMS_Id] ?? {}),
                                                        EYCES_MaxMarks: ''
                                                    }
                                                }));
                                            }}
                                            onBlur={() => {
                                                const row = subjects.find((r) => r.ISMS_Id === s.ISMS_Id);
                                                if (!row) return;

                                                const rowErrors = validateRowWithZod(row);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    [s.ISMS_Id]: rowErrors
                                                }));
                                            }}
                                            placeholder='Enter Max Entry'
                                            inputMode='numeric'
                                            className={`text-center ${errors[s.ISMS_Id]?.EYCES_MarksEntryMax ? 'border-red-500' : ''}`}
                                        />
                                        {renderFieldError(s.ISMS_Id, 'EYCES_MarksEntryMax')}
                                    </td>

                                    {/* SubExam */}
                                    {showSubExamColumn && (
                                        <td className='border p-2 text-center align-top'>
                                            <Checkbox
                                                checked={!!s.EYCES_SubExamFlg}
                                                onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_SubExamFlg', !!v)}
                                                disabled={!canToggleSubFlags}
                                            />
                                        </td>
                                    )}

                                    {/* SubSubject */}
                                    {showSubSubjectColumn && (
                                        <td className='border p-2 text-center align-top'>
                                            <Checkbox
                                                checked={!!s.EYCES_SubSubjectFlg}
                                                onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_SubSubjectFlg', !!v)}
                                                disabled={!canToggleSubFlags}
                                            />
                                        </td>
                                    )}

                                    {/* Map Button */}
                                    {(showSubExamColumn || showSubSubjectColumn) && (
                                        <td className='border p-2 text-center align-top'>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => handleMapClick(s)}
                                                disabled={!canToggleSubFlags || !(s.EYCES_SubExamFlg || s.EYCES_SubSubjectFlg)}>
                                                Map
                                            </Button>
                                        </td>
                                    )}

                                    {/* Marks / Grade options */}
                                    <td className='border p-2 align-top'>
                                        <RadioGroup
                                            value={s.EYCES_MarksGradeEntryFlg ?? 'M'}
                                            onValueChange={(val) => updateSubjectField(s.ISMS_Id, 'EYCES_MarksGradeEntryFlg', val)}
                                            className='flex items-center justify-center gap-6'>
                                            <div className='flex items-center gap-2'>
                                                <RadioGroupItem value='M' id={`marks-${s.ISMS_Id}`} />
                                                <label
                                                    htmlFor={`marks-${s.ISMS_Id}`}
                                                    className='cursor-pointer select-none font-medium text-sm leading-none'>
                                                    Marks
                                                </label>
                                            </div>

                                            <div className='flex items-center gap-2'>
                                                <RadioGroupItem value='G' id={`grade-${s.ISMS_Id}`} />
                                                <label
                                                    htmlFor={`grade-${s.ISMS_Id}`}
                                                    className='cursor-pointer select-none font-medium text-sm leading-none'>
                                                    Grade
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </td>

                                    {/* Marks Display */}
                                    <td className='border p-2 text-center align-top'>
                                        <Checkbox
                                            checked={!!s.EYCES_MarksDisplayFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_MarksDisplayFlg', !!v)}
                                        />
                                    </td>

                                    {/* Grade Display */}
                                    <td className='border p-2 text-center align-top'>
                                        <Checkbox
                                            checked={!!s.EYCES_GradeDisplayFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_GradeDisplayFlg', !!v)}
                                        />
                                    </td>

                                    {/* Apply to Result */}
                                    <td className='border p-2 text-center align-top'>
                                        <Checkbox
                                            checked={!!s.EYCES_AplResultFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'EYCES_AplResultFlg', !!v)}
                                        />
                                    </td>

                                    <td className='w-44 border p-2 align-top'>
                                        <Select
                                            value={s.EMGR_Id === 0 || s.EMGR_Id === '' ? '' : String(s.EMGR_Id)}
                                            onValueChange={(val) => {
                                                const num = Number(val);

                                                updateSubjectField(s.ISMS_Id, 'EMGR_Id', num);

                                                setErrors((prev) => {
                                                    const updated = { ...prev };

                                                    // only remove EMGR_Id error if a valid value is selected
                                                    if (num && updated[s.ISMS_Id]?.EMGR_Id) {
                                                        // biome-ignore lint/performance/noDelete: <explanation>
                                                        delete updated[s.ISMS_Id].EMGR_Id;

                                                        // cleanup empty object to avoid stale render
                                                        if (Object.keys(updated[s.ISMS_Id]).length === 0) {
                                                            delete updated[s.ISMS_Id];
                                                        }
                                                    }

                                                    return updated;
                                                });
                                            }}>
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
                                        {renderFieldError(s.ISMS_Id, 'EMGR_Id')}
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
