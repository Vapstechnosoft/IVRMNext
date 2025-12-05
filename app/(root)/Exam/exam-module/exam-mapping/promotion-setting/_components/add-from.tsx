// app/promotional-setting/_components/add-form.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/extension/field';
import { Eye, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ViewExamsModal, ViewGroupsModal } from './subject-table';

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

// -----------------------------
// Hardcoded data
// -----------------------------
const ACADEMIC_YEARS = [
    { id: 2024, label: '2024-2025' }, // current (first) will be preselected
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
        { id: 10, name: 'General Knowledge', code: 'GK', maxMarks: null, minMarks: null, convertFor: null, applyToResult: true, grade: null }
    ],
    3: [
        { id: 20, name: 'Physics', code: 'PHY', maxMarks: null, minMarks: null, convertFor: null, applyToResult: true, grade: null }
    ]
};

// initial groups for demo (empty by default)
const INITIAL_GROUPS: GroupItem[] = [];

export default function AddPromotionalSettingForm() {
    // form top-level state
    const [selectedYear, setSelectedYear] = useState<number>(ACADEMIC_YEARS[0].id); // preselect first/current
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [grade, setGrade] = useState<string | null>(null);

    // table state
    const [subjects, setSubjects] = useState<SubjectRow[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<Record<number, boolean>>({});

    // modal visibility & data
    const [activeSubject, setActiveSubject] = useState<SubjectRow | null>(null);
    const [groups, setGroups] = useState<GroupItem[]>(INITIAL_GROUPS);
    const [isGroupsOpen, setIsGroupsOpen] = useState(false);
    const [isExamsOpen, setIsExamsOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState<GroupItem | null>(null);

    useEffect(() => {
        // load categories for selectedYear
        const cats = CATEGORIES_BY_YEAR[selectedYear] ?? [];
        setCategories(cats);
        // reset category + table when year changes
        setSelectedCategory(null);
        setSubjects([]);
        setSelectedSubjects({});
    }, [selectedYear]);

    useEffect(() => {
        // when category selected, load subjects (if any)
        if (!selectedCategory) {
            setSubjects([]);
            setSelectedSubjects({});
            return;
        }
        const subj = SUBJECTS_BY_CATEGORY[selectedCategory] ?? [];
        setSubjects(subj);
        setSelectedSubjects({});
    }, [selectedCategory]);

    const isTableVisible = useMemo(() => !!selectedCategory && subjects.length > 0, [selectedCategory, subjects]);

    // checkbox toggle per subject row
    const toggleSubject = (id: number) => {
        setSelectedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // open group modal for a subject
    const openGroupModal = (subject: SubjectRow) => {
        setActiveSubject(subject);
        setIsGroupsOpen(true);
    };

    // handle add group (in groups modal) - hardcoded fields come from modal inputs
    const addGroupToSubject = (group: GroupItem) => {
        // For this demo, maintain groups globally; in real app these are per-subject groups.
        setGroups((prev) => [...prev, group]);
        toast.success('Group added');
    };

    // open view exams modal for a group
    const openExamsModal = (group: GroupItem) => {
        setActiveGroup(group);
        setIsExamsOpen(true);
    };

    const handleSave = () => {
        // build payload (here just console)
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
        toast.info('Reset done');
    };

    return (
        <div>
            <CollapsibleSection defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <Label>Academic Year *</Label>
                        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACADEMIC_YEARS.map((y) => (
                                    <SelectItem key={y.id} value={String(y.id)}>
                                        {y.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Category *</Label>
                        <Select
                            value={selectedCategory ? String(selectedCategory) : ''}
                            onValueChange={(v) => setSelectedCategory(v ? Number(v) : null)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.length === 0 ? (
                                    <SelectItem value="">No Categories</SelectItem>
                                ) : (
                                    categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Grade</Label>
                        <Select value={grade ?? ''} onValueChange={(v) => setGrade(v || null)}>
                            <SelectTrigger>
                                <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Grade 6">Grade 6</SelectItem>
                                <SelectItem value="Grade 7">Grade 7</SelectItem>
                                <SelectItem value="Grade 8">Grade 8</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox id="passIndividual" checked={false} onCheckedChange={() => { }} />
                        <label className="text-sm">Pass to Individual Subjects</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="passOverall" checked={false} onCheckedChange={() => { }} />
                        <label className="text-sm">Pass to OverAll Subjects</label>
                    </div>
                </div>

                {/* subjects table */}
                {!isTableVisible ? (
                    <div className="py-10 text-center text-gray-500">Select Category to display subjects</div>
                ) : (
                    <div className="overflow-x-auto rounded border">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-blue-600 text-white">
                                <tr className="text-sm">
                                    <th className="px-3 py-2 w-12 text-center">SLNO</th>
                                    <th className="px-3 py-2 w-12 text-center">
                                        <Checkbox aria-label="select-all" />
                                    </th>
                                    <th className="px-3 py-2">Subject Name (Code)</th>
                                    <th className="px-3 py-2 w-40 text-center">Max Marks</th>
                                    <th className="px-3 py-2 w-40 text-center">Min Marks</th>
                                    <th className="px-3 py-2 w-40 text-center">Convert Marks For</th>
                                    <th className="px-3 py-2 w-32 text-center">Apply to Result</th>
                                    <th className="px-3 py-2 w-32 text-center">Grade</th>
                                    <th className="px-3 py-2 w-20 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {subjects.map((s, idx) => (
                                    <tr
                                        key={s.id}
                                        className={`text-sm ${idx % 2 ? "bg-gray-50" : "bg-white"}`}
                                    >
                                        {/* SL No */}
                                        <td className="px-3 py-2 text-center">{idx + 1}</td>

                                        {/* Checkbox */}
                                        <td className="px-3 py-2 text-center">
                                            <Checkbox
                                                checked={!!selectedSubjects[s.id]}
                                                onCheckedChange={() => toggleSubject(s.id)}
                                            />
                                        </td>

                                        {/* Subject Name */}
                                        <td className="px-3 py-2 font-medium">
                                            {s.name}
                                            {s.code && <span className="text-gray-500 text-xs"> ({s.code})</span>}
                                        </td>

                                        {/* Max Marks */}
                                        <td className="px-3 py-1">
                                            <Input
                                                type="number"
                                                defaultValue={s.maxMarks ?? ""}
                                                placeholder="Enter..."
                                                className="text-sm"
                                            />
                                        </td>

                                        {/* Min Marks */}
                                        <td className="px-3 py-1">
                                            <Input
                                                type="number"
                                                defaultValue={s.minMarks ?? ""}
                                                placeholder="Enter..."
                                                className="text-sm"
                                            />
                                        </td>

                                        {/* Convert Marks */}
                                        <td className="px-3 py-1">
                                            <Input
                                                type="number"
                                                defaultValue={s.convertFor ?? ""}
                                                placeholder="Enter..."
                                                className="text-sm"
                                            />
                                        </td>

                                        {/* Apply Result Checkbox */}
                                        <td className="px-3 py-2 text-center">
                                            <Checkbox defaultChecked={s.applyToResult} />
                                        </td>

                                        {/* Grade - Using Select (same as reference component) */}
                                        <td className="px-3 py-1">
                                            <Select defaultValue={s.grade ?? ""}>
                                                <SelectTrigger className="h-8 text-sm">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="50 Grade">50 Grade</SelectItem>
                                                    <SelectItem value="Pass/Fail">Pass / Fail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>

                                        {/* Action button */}
                                        <td className="px-3 py-2 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openGroupModal(s)}
                                                title="Group Mapping"
                                            >
                                                <Eye className="h-4 w-4 text-blue-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Save / Cancel */}
                <div className="mt-4 flex gap-3">
                    <Button type="button" onClick={handleSave}>
                        Save
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                        Cancel
                    </Button>
                </div>
            </CollapsibleSection>

            {/* Group Mapping Modal */}
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
            )}

            {/* Exams modal */}
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

/**
 * ViewGroupsModal - custom modal to show exam list on left and group add form on right.
 * Styled to mimic your screenshot and category-class mapping behavior.
 */
// export function ViewGroupsModal({
//     subject,
//     onClose,
//     onAddGroup,
//     groups,
//     onOpenExams
// }: {
//     subject: SubjectRow;
//     onClose: () => void;
//     onAddGroup: (g: GroupItem) => void;
//     groups: GroupItem[];
//     onOpenExams: (g: GroupItem) => void;
// }) {
//     // local form fields for group creation (hardcoded defaults)
//     const [marks, setMarks] = useState<number>(0);
//     const [percentage, setPercentage] = useState<number>(0);
//     const [groupName, setGroupName] = useState<string>('');
//     const [groupOrder, setGroupOrder] = useState<number>(1);
//     const [maxOff, setMaxOff] = useState<number>(0);
//     const [bestOff, setBestOff] = useState<number>(0);
//     const [displayName, setDisplayName] = useState<string>('');
//     const [roundOff, setRoundOff] = useState<boolean>(false);

//     // sample exams on the left (hardcoded)
//     const leftExams = [
//         { id: 101, name: 'Formative Assessment -04' },
//         { id: 102, name: 'Summative Assessment-02' },
//         { id: 103, name: 'Unit Test 1' }
//     ];

//     const [selectedExamIds, setSelectedExamIds] = useState<Record<number, boolean>>({});

//     const toggleSelectExam = (id: number) => setSelectedExamIds((p) => ({ ...p, [id]: !p[id] }));

//     const handleAdd = () => {
//         if (!groupName || !displayName) {
//             toast.error('Group Name and Display Name are required');
//             return;
//         }

//         // Build a new group from the form values + exams selection
//         const newGroup: GroupItem = {
//             id: Math.floor(Math.random() * 100000),
//             groupName,
//             displayName,
//             percentage,
//             marks,
//             maxOff,
//             bestOff,
//             order: groupOrder,
//             roundOffFlag: roundOff,
//             exams: leftExams
//                 .filter((e) => selectedExamIds[e.id])
//                 .map((e) => ({
//                     id: e.id,
//                     name: e.name,
//                     marks: Math.floor(Math.random() * 100),
//                     conversionRequired: false
//                 }))
//         };

//         onAddGroup(newGroup);

//         // clear form
//         setGroupName('');
//         setDisplayName('');
//         setSelectedExamIds({});
//         setPercentage(0);
//         setMarks(0);
//         setBestOff(0);
//         setMaxOff(0);
//         setGroupOrder((o) => o + 1);
//     };

//     const handleRemoveGroup = (id: number) => {
//         // We mutate the groups via onAddGroup in parent; for demo we show a toast instructing the workflow
//         toast.info('Remove (demo) - implement server removal when ready');
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
//             <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//             <div className="relative z-10 w-[95%] md:w-[90%] max-w-6xl bg-white rounded shadow-lg">
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b p-3 bg-blue-800 text-white rounded-t">
//                     <h3 className="text-lg font-semibold">{subject.name.toUpperCase()} GROUPS MAPPING</h3>
//                     <button onClick={onClose} className="w-fit p-1 rounded hover:bg-white/10">
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
//                     {/* Left: Exams + converted marks table */}
//                     <div>
//                         <table className="min-w-full border">
//                             <thead className="bg-blue-600 text-white">
//                                 <tr>
//                                     <th className="p-2 w-12">SL.No</th>
//                                     <th className="p-2">Exam Name</th>
//                                     <th className="p-2 w-40">Converted Marks</th>
//                                     <th className="p-2 w-36">Conversion Required</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {leftExams.map((e, i) => (
//                                     <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                                         <td className="p-2 text-center">
//                                             <input type="checkbox" checked={!!selectedExamIds[e.id]} onChange={() => toggleSelectExam(e.id)} />
//                                         </td>
//                                         <td className="p-2">{e.name}</td>
//                                         <td className="p-2">
//                                             <input className="w-full border px-2 py-1" placeholder="Enter converted marks" />
//                                         </td>
//                                         <td className="p-2">
//                                             <input type="checkbox" />
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Right: Group form */}
//                     <div>
//                         <div className="grid grid-cols-2 gap-2">
//                             <div>
//                                 <Label>Marks</Label>
//                                 <input type="number" className="w-full border px-2 py-1" value={marks} onChange={(e) => setMarks(Number(e.target.value))} />
//                             </div>
//                             <div>
//                                 <Label>Max Off</Label>
//                                 <input type="number" className="w-full border px-2 py-1" value={maxOff} onChange={(e) => setMaxOff(Number(e.target.value))} />
//                             </div>

//                             <div>
//                                 <Label>Percentage *</Label>
//                                 <input type="number" className="w-full border px-2 py-1" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} />
//                             </div>
//                             <div>
//                                 <Label>Best Off *</Label>
//                                 <input type="number" className="w-full border px-2 py-1" value={bestOff} onChange={(e) => setBestOff(Number(e.target.value))} />
//                             </div>

//                             <div>
//                                 <Label>Group Name *</Label>
//                                 <input className="w-full border px-2 py-1" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
//                             </div>
//                             <div>
//                                 <Label>Display Name *</Label>
//                                 <input className="w-full border px-2 py-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
//                             </div>

//                             <div>
//                                 <Label>Group Order *</Label>
//                                 <input type="number" className="w-full border px-2 py-1" value={groupOrder} onChange={(e) => setGroupOrder(Number(e.target.value))} />
//                             </div>

//                             <div className="flex items-center gap-2 mt-6">
//                                 <input type="checkbox" checked={roundOff} onChange={() => setRoundOff(!roundOff)} />
//                                 <label>Round Off Required</label>
//                             </div>
//                         </div>

//                         <div className="mt-4 flex gap-3">
//                             <Button type="button" onClick={handleAdd}>
//                                 <Plus className="h-4 w-4 mr-2" /> ADD
//                             </Button>
//                             <Button type="button" variant="outline" onClick={() => {
//                                 setGroupName('');
//                                 setDisplayName('');
//                                 setSelectedExamIds({});
//                                 setPercentage(0);
//                             }}>
//                                 CLEAR
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Group list */}
//                 <div className="p-4 border-t">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full border">
//                             <thead className="bg-blue-600 text-white">
//                                 <tr>
//                                     <th className="p-2 w-12">SLNO</th>
//                                     <th className="p-2">Group Name</th>
//                                     <th className="p-2">Display Name</th>
//                                     <th className="p-2 w-24">Percentage</th>
//                                     <th className="p-2 w-20">Marks</th>
//                                     <th className="p-2 w-20">Max. Off</th>
//                                     <th className="p-2 w-20">Best. Off</th>
//                                     <th className="p-2 w-16">Order</th>
//                                     <th className="p-2 w-28">View Exams</th>
//                                     <th className="p-2 w-20">Round Off Flag</th>
//                                     <th className="p-2 w-24">Remove</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {groups.length === 0 ? (
//                                     <tr>
//                                         <td className="p-4 text-center" colSpan={11}>No groups added</td>
//                                     </tr>
//                                 ) : (
//                                     groups.map((g, i) => (
//                                         <tr key={g.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                                             <td className="p-2 text-center">{i + 1}</td>
//                                             <td className="p-2">{g.groupName}</td>
//                                             <td className="p-2">{g.displayName}</td>
//                                             <td className="p-2 text-center">{g.percentage}</td>
//                                             <td className="p-2 text-center">{g.marks}</td>
//                                             <td className="p-2 text-center">{g.maxOff}</td>
//                                             <td className="p-2 text-center">{g.bestOff}</td>
//                                             <td className="p-2 text-center">{g.order}</td>
//                                             <td className="p-2 text-center">
//                                                 <button className="p-1 rounded hover:bg-gray-100" onClick={() => onOpenExams(g)} title="View Exams">
//                                                     <Eye className="h-4 w-4 text-blue-600" />
//                                                 </button>
//                                             </td>
//                                             <td className="p-2 text-center">{g.roundOffFlag ? '✔' : ''}</td>
//                                             <td className="p-2 text-center">
//                                                 <button className="p-1 rounded hover:bg-red-50" onClick={() => handleRemoveGroup(g.id)} title="Remove">
//                                                     <X className="h-4 w-4 text-red-600" />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="flex justify-center mt-4">
//                         <Button type="button" onClick={onClose}>
//                             ADD & CLOSE
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export function ViewExamsModal({ group, onClose }: { group: GroupItem; onClose: () => void }) {
//     return (
//         <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
//             <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//             <div className="relative z-10 w-[86%] max-w-2xl bg-white rounded shadow-lg">
//                 <div className="flex items-center justify-between border-b p-3 bg-blue-800 text-white rounded-t">
//                     <h3 className="text-lg font-semibold">{group.displayName} GROUP MAPPED EXAMS</h3>
//                     <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>

//                 <div className="p-4">
//                     <table className="min-w-full border">
//                         <thead className="bg-blue-600 text-white">
//                             <tr>
//                                 <th className="p-2 w-12">SL.No</th>
//                                 <th className="p-2">Exam Name</th>
//                                 <th className="p-2 w-24">Marks</th>
//                                 <th className="p-2 w-36">Conversion Req Or Not</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {group.exams.length === 0 ? (
//                                 <tr>
//                                     <td className="p-4 text-center" colSpan={4}>No exams mapped</td>
//                                 </tr>
//                             ) : (
//                                 group.exams.map((e, i) => (
//                                     <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                                         <td className="p-2 text-center">{i + 1}</td>
//                                         <td className="p-2">{e.name}</td>
//                                         <td className="p-2 text-center">{e.marks}</td>
//                                         <td className="p-2 text-center">{e.conversionRequired ? '✔' : '✖'}</td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>

//                     <div className="mt-4 flex justify-end">
//                         <Button onClick={onClose}>Close</Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
