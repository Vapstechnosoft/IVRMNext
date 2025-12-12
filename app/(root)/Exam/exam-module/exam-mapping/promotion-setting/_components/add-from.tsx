// app/promotional-setting/_components/add-form.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ViewExamsModal, ViewGroupsModal } from './view-group-mapping-model';

/**
 * In-file modal components so this file is self contained.
 * These are simple UI implementations using the same Button/Input/Select components.
 * Replace with your own modal implementations if available.
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
    id: number;
    name: string;
    code?: string;
    maxMarks?: number | null;
    minMarks?: number | null;
    convertFor?: number | null;
    applyToResult?: boolean;
    grade?: string | null;
};

/**
 * Hardcoded data (source of demo truth)
 */
const ACADEMIC_YEARS = [
    { id: 2024, label: '2024-2025' },
    { id: 2023, label: '2023-2024' },
    { id: 2022, label: '2022-2023' }
];

const CATEGORIES_BY_YEAR: Record<number, { id: number; name: string }[]> = {
    2024: [
        { id: 1, name: 'Middle School' },
        { id: 2, name: 'Primary School' }
    ],
    2023: [{ id: 3, name: 'Senior School' }]
};

const SUBJECTS_BY_CATEGORY: Record<number, SubjectRow[]> = {
    1: [
        { id: 1, name: 'Mathematics', code: 'MATH', maxMarks: 100, minMarks: 25, convertFor: 50, applyToResult: true, grade: null },
        { id: 2, name: 'Science', code: 'SCI', maxMarks: 100, minMarks: 25, convertFor: 100, applyToResult: true, grade: '50 Grade' },
        { id: 3, name: 'Social Science', code: 'SS', maxMarks: null, minMarks: null, convertFor: null, applyToResult: true, grade: null },
        { id: 4, name: 'English II', code: 'ENG2', maxMarks: null, minMarks: null, convertFor: null, applyToResult: true, grade: null }
    ],
    2: [
        {
            id: 10,
            name: 'General Knowledge',
            code: 'GK',
            maxMarks: null,
            minMarks: null,
            convertFor: null,
            applyToResult: true,
            grade: null
        }
    ],
    3: [{ id: 20, name: 'Physics', code: 'PHY', maxMarks: null, minMarks: null, convertFor: null, applyToResult: true, grade: null }]
};

const INITIAL_GROUPS: GroupItem[] = [];

/**
 * Main component - AddPromotionalSettingForm
 */
export default function AddPromotionalSettingForm() {
    // top-level form state
    const [selectedYear, setSelectedYear] = useState<number>(ACADEMIC_YEARS[0].id);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [grade, setGrade] = useState<string | null>(null);

    // table and selection state
    const [subjects, setSubjects] = useState<SubjectRow[]>([]);
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

    // display mode: marks | percentage | total | final
    const [displayMode, setDisplayMode] = useState<'marks' | 'percentage' | 'total' | 'final'>('marks');

    // load categories when year changes
    useEffect(() => {
        const cats = CATEGORIES_BY_YEAR[selectedYear] ?? [];
        setCategories(cats);
        setSelectedCategory(null);
        setSubjects([]);
        setSelectedSubjects({});
    }, [selectedYear]);

    // load subjects when category changes
    useEffect(() => {
        if (!selectedCategory) {
            setSubjects([]);
            setSelectedSubjects({});
            return;
        }
        const subj = SUBJECTS_BY_CATEGORY[selectedCategory] ?? [];
        // ensure we clone so header bulk changes don't mutate constants
        setSubjects(subj.map((s) => ({ ...s })));
        setSelectedSubjects({});
    }, [selectedCategory]);

    // apply header values to all rows when header controls change
    useEffect(() => {
        // Apply only when there are subjects
        if (!subjects.length) return;
        setSubjects((prev) =>
            prev.map((s) => ({
                ...s,
                maxMarks: headerMaxMarks === '' ? s.maxMarks : Number(headerMaxMarks),
                minMarks: headerMinMarks === '' ? s.minMarks : Number(headerMinMarks),
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
        const allSelected = subjects.length > 0 && subjects.every((s) => !!selectedSubjects[s.id]);
        if (allSelected) {
            // clear all
            setSelectedSubjects({});
            return;
        }

        // build map in a simple for..of (avoid assignment-in-expression lint)
        const obj: Record<number, boolean> = {};
        for (const s of subjects) {
            obj[s.id] = true;
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
        toast.success('Group added');
    };

    const openExamsModal = (group: GroupItem) => {
        setActiveGroup(group);
        setIsExamsOpen(true);
    };

    const handleSave = () => {
        const selected = subjects.filter((s) => selectedSubjects[s.id]);
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
                                    {ACADEMIC_YEARS.map((y) => (
                                        <SelectItem key={y.id} value={safeValue(y.id)}>
                                            {y.label}
                                        </SelectItem>
                                    ))}
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
                                            <SelectItem key={c.id} value={safeValue(c.id)}>
                                                {c.name}
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

                {/* Header-level "apply to all" inputs (shows only when table would be visible) */}
                {/* <div className="mb-3 rounded border p-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                        <div>
                            <Label>Header Max.Marks</Label>
                            <Input id="headerMax" type="number" value={headerMaxMarks === '' ? '' : String(headerMaxMarks)} onChange={(e) => onHeaderMaxMarksChange(e.target.value)} placeholder="All rows" className="text-sm" />
                        </div>

                        <div>
                            <Label>Header Min.Marks</Label>
                            <Input id="headerMin" type="number" value={headerMinMarks === '' ? '' : String(headerMinMarks)} onChange={(e) => onHeaderMinMarksChange(e.target.value)} placeholder="All rows" className="text-sm" />
                        </div>

                        <div>
                            <Label>Header Convert For</Label>
                            <Input id="headerConvertFor" type="number" value={headerConvertFor === '' ? '' : String(headerConvertFor)} onChange={(e) => onHeaderConvertForChange(e.target.value)} placeholder="All rows" className="text-sm" />
                        </div>

                        <div>
                            <Label>Apply to Result (Header)</Label>
                            <div className="flex items-center gap-2">
                                <Checkbox id="headerApplyToResult" checked={headerApplyToResult} onCheckedChange={(c) => setHeaderApplyToResult(!!c)} />
                                <label htmlFor="headerApplyToResult" className="text-sm cursor-pointer">Apply to Result</label>
                            </div>
                        </div>

                        <div>
                            <Label>Header Grade</Label>
                            <Select value={headerGrade ?? '__keep'} onValueChange={(v) => setHeaderGrade(v && v !== '__keep' ? v : '')}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="All rows" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__keep">— Keep existing —</SelectItem>
                                    <SelectItem value="50 Grade">50 Grade</SelectItem>
                                    <SelectItem value="Pass/Fail">Pass / Fail</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => {
                                setHeaderMaxMarks('');
                                setHeaderMinMarks('');
                                setHeaderConvertFor('');
                                setHeaderApplyToResult(true);
                                setHeaderGrade('');
                                // Also reset per-row defaults if desired
                                setSubjects(prev => prev.map(s => ({ ...s })));
                                toast.info('Header cleared');
                            }}>
                                <X className="h-4 w-4" /> Clear Header
                            </Button>
                        </div>
                    </div>
                </div> */}

                {/* subjects table */}
                {!isTableVisible ? (
                    <div className='py-10 text-center text-gray-500'>
                        {displayMode === 'final' ? 'Table hidden for Final Exam mode' : 'Select Category to display subjects'}
                    </div>
                ) : (
                    <div className='overflow-x-auto rounded border'>
                        <table className='min-w-full border-collapse'>
                            <thead className='bg-black/50 text-white'>
                                <tr className='text-sm'>
                                    {/* SLNO */}
                                    <th className='w-12 px-3 py-2 text-center'>SLNO</th>

                                    {/* Select All */}
                                    <th className='w-12 px-3 py-2 text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span>Select</span>
                                            <Checkbox
                                                id='selectAll'
                                                checked={subjects.length > 0 && subjects.every((s) => !!selectedSubjects[s.id])}
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
                                        key={s.id}
                                        className={`text-sm transition-colors duration-150 ${idx % 2 ? 'bg-gray-50' : 'bg-white'} hover:bg-accent/90`}>
                                        {/* SL No */}
                                        <td className='px-3 py-2 text-center align-middle'>{idx + 1}</td>

                                        {/* Row Checkbox */}
                                        <td className='px-3 py-2 text-center align-middle'>
                                            <div className='flex items-center justify-center'>
                                                <Checkbox
                                                    id={`subSelect_${s.id}`}
                                                    checked={!!selectedSubjects[s.id]}
                                                    onCheckedChange={() => toggleSubject(s.id)}
                                                />
                                            </div>
                                        </td>

                                        {/* Subject Name */}
                                        <td className='px-3 py-2 align-middle font-medium'>
                                            {s.name}
                                            {s.code && <span className='text-gray-500 text-xs'> ({s.code})</span>}
                                        </td>

                                        {/* Max Marks - editable per row */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Input
                                                id={`maxMarks_${s.id}`}
                                                type='number'
                                                value={s.maxMarks ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setSubjects((prev) => prev.map((x) => (x.id === s.id ? { ...x, maxMarks: val } : x)));
                                                }}
                                                placeholder='Enter...'
                                                className='text-sm'
                                            />
                                        </td>

                                        {/* Min Marks */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Input
                                                id={`minMarks_${s.id}`}
                                                type='number'
                                                value={s.minMarks ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setSubjects((prev) => prev.map((x) => (x.id === s.id ? { ...x, minMarks: val } : x)));
                                                }}
                                                placeholder='Enter...'
                                                className='text-sm'
                                            />
                                        </td>

                                        {/* Convert For */}
                                        <td className='px-3 py-1 align-middle'>
                                            <Input
                                                id={`convFor_${s.id}`}
                                                type='number'
                                                value={s.convertFor ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setSubjects((prev) => prev.map((x) => (x.id === s.id ? { ...x, convertFor: val } : x)));
                                                }}
                                                placeholder='Enter...'
                                                className='text-sm'
                                            />
                                        </td>

                                        {/* Apply to Result checkbox */}
                                        <td className='px-3 py-2 text-center align-middle'>
                                            <div className='flex items-center justify-center'>
                                                <Checkbox
                                                    id={`applyRes_${s.id}`}
                                                    checked={!!s.applyToResult}
                                                    onCheckedChange={(c) => {
                                                        setSubjects((prev) =>
                                                            prev.map((x) => (x.id === s.id ? { ...x, applyToResult: !!c } : x))
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
                                                            x.id === s.id ? { ...x, grade: v && v !== '__keep' ? v : null } : x
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
            {/* Group Mapping Modal */}{' '}
            {isGroupsOpen && activeSubject && (
                <ViewGroupsModal
                    subject={activeSubject}
                    onClose={() => {
                        setIsGroupsOpen(false);
                        setActiveSubject(null);
                    }}
                    onAddGroup={(g) => addGroupToSubject(g)}
                    groups={groups}
                    onOpenExams={(g) => openExamsModal(g)}
                />
            )}{' '}
            {/* Exams modal */}{' '}
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
