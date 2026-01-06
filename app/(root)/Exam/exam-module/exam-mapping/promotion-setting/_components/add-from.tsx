// app/promotional-setting/_components/add-form.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getExamSubjectsByCategoryId,
    getPromotionCategoryByAcademicYear
} from '@/server/exam/exam-module/exam-mapping/promotional-setting';
import { Eye } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ViewExamsModal } from './group-mapped-exam-model';
import { ViewGroupsModal } from './group-mapping-model';

/**
 * Types used in the file
 */
export type GroupItem = {
    id: number;
    groupName: string;
    displayName: string;
    percentage: number;
    marks: number;
    maxOff: number;
    bestOff: number;
    order: number;
    roundOffFlag: boolean;
    exams: { id: number; name: string; marks: number; conversionRequired: boolean }[];
};

export type SubjectRow = {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string | null;
    ismS_Max_Marks?: number | null;
    ismS_Min_Marks?: number | null;
    ismS_OrderFlag?: number | null;
    // Additional fields for form handling
    convertFor?: number | null;
    applyToResult?: boolean;
    grade?: string | null;
};

type ExamSubject = {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string | null;
    ismS_Max_Marks?: number | null;
    ismS_Min_Marks?: number | null;
    ismS_OrderFlag?: number | null;
    emaP_PromotionId?: number;
    emaP_MaxMarks?: number | null;
    emaP_MinMarks?: number | null;
    emaP_ConvertFor?: number | null;
    emaP_ApplyToResult?: boolean;
    emaP_Grade?: string | null;
};

type PromotionCategory = {
    eyC_Id: number;
    emcA_CategoryName: string;
};

type PromotionCategoryResponse = {
    data: PromotionCategory[];
    status: boolean;
    message: string;
};

/**
 * Modal component
 */
type ModalProps = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children?: React.ReactNode;
};

function SimpleModal({ open, title, onClose, children }: ModalProps) {
    if (!open) return null;
    return (
        <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-2xl rounded bg-white p-6 shadow-lg'>
                <div className='mb-4 flex items-center justify-between'>
                    <h3 className='font-semibold text-lg'>{title}</h3>
                    <button type='button' onClick={onClose} aria-label='Close modal' className='rounded p-1 hover:bg-gray-100'>
                        ×
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}

const INITIAL_GROUPS: GroupItem[] = [];

/**
 * Main component - AddPromotionalSettingForm
 */
export default function AddPromotionalSettingForm() {
    // top-level form state
    const [selectedYear, setSelectedYear] = useState<number>(0);
    const [categories, setCategories] = useState<PromotionCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [grade, setGrade] = useState<string | null>(null);

    // table and selection state
    const [subjects, setSubjects] = useState<SubjectRow[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<Record<number, boolean>>({});

    // header-level "apply to all" controls
    const [headerMaxMarks, setHeaderMaxMarks] = useState<number | ''>('');
    const [headerMinMarks, setHeaderMinMarks] = useState<number | ''>('');
    const [headerConvertFor, setHeaderConvertFor] = useState<number | ''>('');
    const [headerApplyToResult, setHeaderApplyToResult] = useState<boolean>(true);
    const [headerGrade, setHeaderGrade] = useState<string | ''>('');

    // UI state and modals
    const [activeSubject, setActiveSubject] = useState<SubjectRow | null>(null);
    const [groups, setGroups] = useState<GroupItem[]>(INITIAL_GROUPS);
    const [isGroupsOpen, setIsGroupsOpen] = useState(false);
    const [isExamsOpen, setIsExamsOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState<GroupItem | null>(null);
    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useAcademicYearDropdown();

    // display mode: marks | percentage | total | final
    const [displayMode, setDisplayMode] = useState<'marks' | 'percentage' | 'total' | 'final'>('marks');

    // load categories when year changes
    useEffect(() => {
        if (!selectedYear) return;

        const loadCategories = async () => {
            try {
                const response = await getPromotionCategoryByAcademicYear(selectedYear, 0, 0);

                const safeCats = Array.isArray(response?.data) ? response.data : [];
                console.log('Loaded categories:', safeCats);
                setCategories(safeCats);
                setSelectedCategory(null);
                setSubjects([]);
                setSelectedSubjects({});
            } catch (error) {
                console.error('Error loading categories:', error);
                setCategories([]);
            }
        };

        loadCategories();
    }, [selectedYear]);

    // load subjects when category changes
    useEffect(() => {
        if (!selectedCategory) {
            setSubjects([]);
            setExams([]);
            setSelectedSubjects({});
            return;
        }

        const loadSubjects = async () => {
            try {
                const response = await getExamSubjectsByCategoryId(selectedCategory);

                const payload = response.data as {
                    subjectlist?: ExamSubject[];
                    examlist?: any[];
                };
                console.log('Loaded subjects:', payload);

                const subjectsData = Array.isArray(payload.subjectlist) ? payload.subjectlist : [];

                const examsData = Array.isArray(payload.examlist) ? payload.examlist : [];

                const safeSubjects: SubjectRow[] = subjectsData.map((subject) => ({
                    ismS_Id: subject.ismS_Id,
                    ismS_SubjectName: subject.ismS_SubjectName,
                    ismS_SubjectCode: subject.ismS_SubjectCode ?? null,
                    ismS_Max_Marks: subject.ismS_Max_Marks ?? subject.emaP_MaxMarks ?? null,
                    ismS_Min_Marks: subject.ismS_Min_Marks ?? subject.emaP_MinMarks ?? null,
                    ismS_OrderFlag: subject.ismS_OrderFlag ?? null,
                    convertFor: subject.emaP_ConvertFor ?? null,
                    applyToResult: subject.emaP_ApplyToResult ?? false,
                    grade: subject.emaP_Grade ?? null
                }));
                if (safeSubjects.length === 0) {
                    toast.info('No subjects found for selected category');
                }

                setSubjects(safeSubjects);
                setExams(examsData);
                setSelectedSubjects({});
            } catch (error) {
                console.error('Error loading subjects:', error);
                setSubjects([]);
                setExams([]);
            }
        };

        loadSubjects();
    }, [selectedCategory]);

    // apply header values to all rows when header controls change
    useEffect(() => {
        // Apply only when there are subjects
        if (!subjects.length) return;
        setSubjects((prev) =>
            prev.map((s) => ({
                ...s,
                ismS_Max_Marks: headerMaxMarks === '' ? s.ismS_Max_Marks : Number(headerMaxMarks),
                ismS_Min_Marks: headerMinMarks === '' ? s.ismS_Min_Marks : Number(headerMinMarks),
                convertFor: headerConvertFor === '' ? s.convertFor : Number(headerConvertFor),
                applyToResult: headerApplyToResult,
                grade: headerGrade === '' ? s.grade : headerGrade
            }))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headerMaxMarks, headerMinMarks, headerConvertFor, headerApplyToResult, headerGrade]);

    const isTableVisible = useMemo(
        () => displayMode !== 'final' && !!selectedCategory && subjects.length > 0,
        [displayMode, selectedCategory, subjects]
    );

    // selection helpers
    const toggleSubject = useCallback((id: number) => {
        setSelectedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const toggleSelectAll = useCallback(() => {
        const allSelected = subjects.length > 0 && subjects.every((s) => !!selectedSubjects[s.ismS_Id]);
        if (allSelected) {
            // clear all
            setSelectedSubjects({});
            return;
        }

        // build map in a simple for..of (avoid assignment-in-expression lint)
        const obj: Record<number, boolean> = {};
        for (const s of subjects) {
            obj[s.ismS_Id] = true;
        }
        setSelectedSubjects(obj);
    }, [subjects, selectedSubjects]);

    // open group modal
    const openGroupModal = (subject: SubjectRow) => {
        setActiveSubject(subject);
        setIsGroupsOpen(true);
    };

    // add group
    const addGroupToSubject = (group: GroupItem) => {
        setGroups((prev) => [...prev, group]);
        console.log('Added group:', group);
        toast.success('Group added');
        console.log('Groups:', groups);
    };

    const openExamsModal = (group: GroupItem) => {
        setActiveGroup(group);
        setIsExamsOpen(true);
    };

    const handleSave = () => {
        const selected = subjects.filter((s) => selectedSubjects[s.ismS_Id]);
        const payload = {
            year: selectedYear,
            category: selectedCategory,
            grade,
            selectedSubjects: selected,
            groups
        };
        console.info('Payload (demo):', payload);
        toast.success('Saved (demo). Check console for payload');
    };

    const handleReset = () => {
        setSelectedYear(0);
        setSelectedCategory(null);
        setSubjects([]);
        setSelectedSubjects({});
        setGroups([]);
        setGrade(null);
        setHeaderMaxMarks('');
        setHeaderMinMarks('');
        setHeaderConvertFor('');
        setHeaderApplyToResult(true);
        setHeaderGrade('');
        toast.info('Reset done');
    };

    // header-level input handlers that also apply to rows immediately:
    const onHeaderMaxMarksChange = (val: string) => {
        const num = val === '' ? '' : Number(val);
        setHeaderMaxMarks(num === '' ? '' : num);
    };
    const onHeaderMinMarksChange = (val: string) => {
        const num = val === '' ? '' : Number(val);
        setHeaderMinMarks(num === '' ? '' : num);
    };
    const onHeaderConvertForChange = (val: string) => {
        const num = val === '' ? '' : Number(val);
        setHeaderConvertFor(num === '' ? '' : num);
    };

    // small utility for safe select item value
    const safeValue = (v: any) => String(v ?? '');

    return (
        <div>
            <CollapsibleSection defaultOpen>
                {/* TOP WRAPPER — 2 columns on desktop, 1 column on mobile */}
                <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* LEFT SIDE — Academic Year, Category, Grade */}
                    <div className='space-y-4'>
                        {/* Academic Year */}
                        <div>
                            <Label>Academic Year *</Label>
                            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Academic Year' />
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
                                    ) : (
                                        academicYear?.data?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div>
                            <Label>Category *</Label>
                            <Select
                                value={selectedCategory ? String(selectedCategory) : '__none'}
                                onValueChange={(v) => setSelectedCategory(v && v !== '__none' ? Number(v) : null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length === 0 ? (
                                        <SelectItem value='__none' disabled>
                                            No Categories
                                        </SelectItem>
                                    ) : (
                                        categories.map((c) => (
                                            <SelectItem key={c.eyC_Id} value={safeValue(c.eyC_Id)}>
                                                {c.emcA_CategoryName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Grade */}
                        <div>
                            <Label>Grade</Label>
                            <Select value={grade ?? '__keep'} onValueChange={(v) => setGrade(v && v !== '__keep' ? v : null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='__keep'>— Keep existing —</SelectItem>
                                    <SelectItem value='Grade 6'>Grade 6</SelectItem>
                                    <SelectItem value='Grade 7'>Grade 7</SelectItem>
                                    <SelectItem value='Grade 8'>Grade 8</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* RIGHT SIDE — Radio Buttons + Checkboxes */}
                    <div className='mt-6 space-y-4'>
                        {/* RADIO BUTTONS */}
                        <div className='flex flex-wrap items-center gap-6'>
                            <div className='flex items-center gap-2'>
                                <input
                                    id='modeMarks'
                                    type='radio'
                                    name='displayMode'
                                    checked={displayMode === 'marks'}
                                    onChange={() => setDisplayMode('marks')}
                                    className='h-4 w-4'
                                />
                                <label htmlFor='modeMarks' className='cursor-pointer text-sm'>
                                    Marks
                                </label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <input
                                    id='modePercentage'
                                    type='radio'
                                    name='displayMode'
                                    checked={displayMode === 'percentage'}
                                    onChange={() => setDisplayMode('percentage')}
                                    className='h-4 w-4'
                                />
                                <label htmlFor='modePercentage' className='cursor-pointer text-sm'>
                                    Percentage
                                </label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <input
                                    id='modeTotal'
                                    type='radio'
                                    name='displayMode'
                                    checked={displayMode === 'total'}
                                    onChange={() => setDisplayMode('total')}
                                    className='h-4 w-4'
                                />
                                <label htmlFor='modeTotal' className='cursor-pointer text-sm'>
                                    Total
                                </label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <input
                                    id='modeFinal'
                                    type='radio'
                                    name='displayMode'
                                    checked={displayMode === 'final'}
                                    onChange={() => setDisplayMode('final')}
                                    className='h-4 w-4'
                                />
                                <label htmlFor='modeFinal' className='cursor-pointer text-sm'>
                                    Final Exam
                                </label>
                            </div>
                        </div>

                        {/* CHECKBOXES */}
                        <div className='flex flex-wrap items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <Checkbox id='passIndividual' checked={false} onCheckedChange={() => {}} />
                                <label htmlFor='passIndividual' className='text-sm'>
                                    Pass to Individual Subjects
                                </label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Checkbox id='passOverall' checked={false} onCheckedChange={() => {}} />
                                <label htmlFor='passOverall' className='text-sm'>
                                    Pass to OverAll Subjects
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* subjects table */}
                {!isTableVisible ? (
                    <div className='py-10 text-center text-gray-500'>
                        {displayMode === 'final' ? 'Table hidden for Final Exam mode' : 'Select Category to display subjects'}
                    </div>
                ) : (
                    <div className='overflow-x-auto rounded border'>
                        <table className='min-w-full border-collapse'>
                            <thead className='bg-gray-200'>
                                <tr className='text-sm'>
                                    {/* SLNO */}
                                    <th className='w-12 px-3 py-2 text-center'>SLNO</th>

                                    {/* Select All */}
                                    <th className='w-12 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Select</span>
                                            <Checkbox
                                                id='selectAll'
                                                checked={subjects.length > 0 && subjects.every((s) => !!selectedSubjects[s.ismS_Id])}
                                                onCheckedChange={() => toggleSelectAll()}
                                            />
                                        </div>
                                    </th>

                                    {/* Subject Name */}
                                    <th className='px-3 py-2'>Subject Name (Code)</th>

                                    {/* Max Marks */}
                                    <th className='w-40 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Max.Marks</span>
                                            <Input
                                                id='headerMax'
                                                type='number'
                                                value={headerMaxMarks === '' ? '' : String(headerMaxMarks)}
                                                onChange={(e) => onHeaderMaxMarksChange(e.target.value)}
                                                placeholder='All'
                                                className='h-7 bg-white text-black text-xs'
                                            />
                                        </div>
                                    </th>

                                    {/* Min Marks */}
                                    <th className='w-40 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Min.Marks</span>
                                            <Input
                                                id='headerMin'
                                                type='number'
                                                value={headerMinMarks === '' ? '' : String(headerMinMarks)}
                                                onChange={(e) => onHeaderMinMarksChange(e.target.value)}
                                                placeholder='All'
                                                className='h-7 bg-white text-black text-xs'
                                            />
                                        </div>
                                    </th>

                                    {/* Convert For */}
                                    <th className='w-40 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Convert For</span>
                                            <Input
                                                id='headerConvertFor'
                                                type='number'
                                                value={headerConvertFor === '' ? '' : String(headerConvertFor)}
                                                onChange={(e) => onHeaderConvertForChange(e.target.value)}
                                                placeholder='All'
                                                className='h-7 bg-white text-black text-xs'
                                            />
                                        </div>
                                    </th>

                                    {/* Apply to Result */}
                                    <th className='w-32 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Apply to Result</span>
                                            <Checkbox
                                                id='headerApplyToResult'
                                                checked={headerApplyToResult}
                                                onCheckedChange={(c) => setHeaderApplyToResult(!!c)}
                                            />
                                        </div>
                                    </th>

                                    {/* Grade */}
                                    <th className='w-32 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Grade</span>
                                            <Select
                                                value={headerGrade ?? '__keep'}
                                                onValueChange={(v) => setHeaderGrade(v && v !== '__keep' ? v : '')}>
                                                <SelectTrigger className='h-7 bg-white text-black text-xs'>
                                                    <SelectValue placeholder='All' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='__keep'>— Keep —</SelectItem>
                                                    <SelectItem value='50 Grade'>50 Grade</SelectItem>
                                                    <SelectItem value='Pass/Fail'>Pass / Fail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </th>

                                    {/* Action */}
                                    {displayMode !== 'total' && <th className='w-20 px-3 py-2 text-center'>Actions</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {subjects.map((s, idx) => (
                                    <tr
                                        key={s.ismS_Id}
                                        className={`text-sm transition-colors duration-150 ${idx % 2 ? 'bg-gray-50' : 'bg-white'} hover:bg-accent/90`}>
                                        {/* SL No */}
                                        <td className='px-3 py-2 text-center align-middle'>{idx + 1}</td>

                                        {/* Row Checkbox */}
                                        <td className='px-3 py-2 text-center align-middle'>
                                            <div className='flex items-center justify-center'>
                                                <Checkbox
                                                    id={`subSelect_${s.ismS_Id}`}
                                                    checked={!!selectedSubjects[s.ismS_Id]}
                                                    onCheckedChange={() => toggleSubject(s.ismS_Id)}
                                                />
                                            </div>
                                        </td>

                                        {/* Subject Name */}
                                        <td className='px-3 py-2 align-middle font-medium'>
                                            {s.ismS_SubjectName}
                                            {s.ismS_SubjectCode && <span className='text-gray-500 text-xs'> ({s.ismS_SubjectCode})</span>}
                                        </td>

                                        {/* Max Marks - editable per row */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Input
                                                id={`maxMarks_${s.ismS_Id}`}
                                                type='number'
                                                value={s.ismS_Max_Marks ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setSubjects((prev) =>
                                                        prev.map((x) => (x.ismS_Id === s.ismS_Id ? { ...x, ismS_Max_Marks: val } : x))
                                                    );
                                                }}
                                                placeholder='Enter...'
                                                className='text-sm'
                                            />
                                        </td>

                                        {/* Min Marks */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Input
                                                id={`minMarks_${s.ismS_Id}`}
                                                type='number'
                                                value={s.ismS_Min_Marks ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setSubjects((prev) =>
                                                        prev.map((x) => (x.ismS_Id === s.ismS_Id ? { ...x, ismS_Min_Marks: val } : x))
                                                    );
                                                }}
                                                placeholder='Enter...'
                                                className='text-sm'
                                            />
                                        </td>

                                        {/* Convert For */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Input
                                                id={`convFor_${s.ismS_Id}`}
                                                type='number'
                                                value={s.convertFor ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setSubjects((prev) =>
                                                        prev.map((x) => (x.ismS_Id === s.ismS_Id ? { ...x, convertFor: val } : x))
                                                    );
                                                }}
                                                placeholder='Enter...'
                                                className='text-sm'
                                            />
                                        </td>

                                        {/* Apply to Result checkbox */}
                                        <td className='px-3 py-2 text-center align-middle'>
                                            <div className='flex items-center justify-center'>
                                                <Checkbox
                                                    id={`applyRes_${s.ismS_Id}`}
                                                    checked={!!s.applyToResult}
                                                    onCheckedChange={(c) => {
                                                        setSubjects((prev) =>
                                                            prev.map((x) => (x.ismS_Id === s.ismS_Id ? { ...x, applyToResult: !!c } : x))
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* Grade */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Select
                                                value={s.grade ?? '__keep'}
                                                onValueChange={(v) =>
                                                    setSubjects((prev) =>
                                                        prev.map((x) =>
                                                            x.ismS_Id === s.ismS_Id ? { ...x, grade: v && v !== '__keep' ? v : null } : x
                                                        )
                                                    )
                                                }>
                                                <SelectTrigger className='h-8 text-sm'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='__keep'>— Keep existing —</SelectItem>
                                                    <SelectItem value='50 Grade'>50 Grade</SelectItem>
                                                    <SelectItem value='Pass/Fail'>Pass / Fail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>

                                        {/* Action: Eye (hidden when displayMode === 'total') */}
                                        {displayMode !== 'total' && (
                                            <td className='px-3 py-2 text-center align-middle'>
                                                <Button variant='ghost' size='icon' onClick={() => openGroupModal(s)} title='Group Mapping'>
                                                    <Eye className='h-4 w-4 text-blue-600' />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Save / Cancel */}
                <div className='mt-4 flex gap-3'>
                    <Button type='button' onClick={handleSave}>
                        Save
                    </Button>
                    <Button type='button' variant='outline' onClick={handleReset}>
                        Cancel
                    </Button>
                </div>
            </CollapsibleSection>
            {isGroupsOpen && activeSubject && (
                <ViewGroupsModal
                    subject={activeSubject}
                    exams={exams}
                    onClose={() => {
                        setIsGroupsOpen(false);
                        setActiveSubject(null);
                    }}
                    onAddGroup={(g) => addGroupToSubject(g)}
                    groups={groups}
                    onOpenExams={(g) => openExamsModal(g)}
                />
            )}{' '}
            {isExamsOpen && activeGroup && (
                <ViewExamsModal
                    group={activeGroup}
                    onClose={() => {
                        setIsExamsOpen(false);
                        setActiveGroup(null);
                    }}
                />
            )}
        </div>
    );
}
