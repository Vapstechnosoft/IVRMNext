'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { useEffect, useMemo, useState } from 'react';

type Grade = { emgR_Id: string; emgR_GradeName: string };

interface ValidationErrors {
    [key: number]: {
        ECYSES_MaxMarks?: string;
        ECYSES_MinMarks?: string;
        ECYSES_MarksEntryMax?: string;
    };
}

export default function SubjectTable({
    subjects,
    setSubjects,
    showSubExamColumn,
    showSubSubjectColumn,
    onOpenSubExamModal,
    onOpenSubSubjectModal,
    gradeList
}: {
    subjects: any[];
    setSubjects: (s: any[]) => void;
    showSubExamColumn: boolean;
    showSubSubjectColumn: boolean;
    onOpenSubExamModal: (subject: any) => void;
    onOpenSubSubjectModal: (subject: any) => void;
    gradeList: IMasterGrade[];
}) {
    // Validation state
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Derived header state
    const derivedHeader = useMemo(() => {
        const allSelected = subjects.length > 0 && subjects.every((s) => !!s.checkedvalue);
        const allSubExam = subjects.length > 0 && subjects.every((s) => !!s.ECYSES_SubExamFlg);
        const allSubSubject = subjects.length > 0 && subjects.every((s) => !!s.ECYSES_SubSubjectFlg);
        const allMarksDisplay = subjects.length > 0 && subjects.every((s) => !!s.ECYSES_MarksDisplayFlg);
        const allGradeDisplay = subjects.length > 0 && subjects.every((s) => !!s.ECYSES_GradeDisplayFlg);

        const allMaxMarksSame =
            subjects.length > 0 && subjects.every((s) => (s.ECYSES_MaxMarks ?? '') === (subjects[0].ECYSES_MaxMarks ?? ''));
        const allMinMarksSame =
            subjects.length > 0 && subjects.every((s) => (s.ECYSES_MinMarks ?? '') === (subjects[0].ECYSES_MinMarks ?? ''));
        const allMaxEntrySame =
            subjects.length > 0 && subjects.every((s) => (s.ECYSES_MarksEntryMax ?? '') === (subjects[0].ECYSES_MarksEntryMax ?? ''));

        return {
            allSelected,
            allSubExam,
            allSubSubject,
            allMarksDisplay,
            allGradeDisplay,
            headerMaxMarks: allMaxMarksSame ? (subjects[0]?.ECYSES_MaxMarks ?? '') : '',
            headerMinMarks: allMinMarksSame ? (subjects[0]?.ECYSES_MinMarks ?? '') : '',
            headerMaxEntry: allMaxEntrySame ? (subjects[0]?.ECYSES_MarksEntryMax ?? '') : ''
        };
    }, [subjects]);

    const [headerState, setHeaderState] = useState({
        selectAll: false,
        maxMarks: '',
        minMarks: '',
        maxEntry: '',
        subExam: false,
        subSubject: false,
        marksDisplay: false,
        gradeDisplay: false
    });

    useEffect(() => {
        setHeaderState((prev) => ({
            ...prev,
            selectAll: derivedHeader.allSelected,
            subExam: derivedHeader.allSubExam,
            subSubject: derivedHeader.allSubSubject,
            marksDisplay: derivedHeader.allMarksDisplay,
            gradeDisplay: derivedHeader.allGradeDisplay,
            maxMarks: derivedHeader.headerMaxMarks,
            minMarks: derivedHeader.headerMinMarks,
            maxEntry: derivedHeader.headerMaxEntry
        }));
    }, [derivedHeader]);

    const toggleSubjectChecked = (id: number, checked: boolean) => {
        setSubjects(subjects.map((s) => (s.ISMS_Id === id ? { ...s, checkedvalue: checked } : s)));
    };

    const updateSubjectField = (id: number, key: string, value: any) => {
        setSubjects(subjects.map((s) => (s.ISMS_Id === id ? { ...s, [key]: value } : s)));

        // Clear error if fixed
        setErrors((prev) => ({
            ...prev,
            [id]: { ...prev[id], [key]: value ? undefined : `${key.replace('ECYSES_', '').replace(/([A-Z])/g, ' $1')} is required` }
        }));
    };

    const handleHeaderChange = (field: string, value: any) => {
        setHeaderState((prev) => ({ ...prev, [field]: value }));

        if (field === 'selectAll') {
            setSubjects(subjects.map((s) => ({ ...s, checkedvalue: !!value })));
        } else if (field === 'subExam') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_SubExamFlg: !!value })));
        } else if (field === 'subSubject') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_SubSubjectFlg: !!value })));
        } else if (field === 'marksDisplay') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_MarksDisplayFlg: !!value })));
        } else if (field === 'gradeDisplay') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_GradeDisplayFlg: !!value })));
        } else if (field === 'maxMarks') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_MaxMarks: value })));
        } else if (field === 'minMarks') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_MinMarks: value })));
        } else if (field === 'maxEntry') {
            setSubjects(subjects.map((s) => ({ ...s, ECYSES_MarksEntryMax: value })));
        }
    };

    const handleMapClick = (subject: any) => {
        if (showSubExamColumn && subject.ECYSES_SubExamFlg) {
            onOpenSubExamModal(subject);
        } else if (showSubSubjectColumn && subject.ECYSES_SubSubjectFlg) {
            onOpenSubSubjectModal(subject);
        } else {
            if (showSubExamColumn) onOpenSubExamModal(subject);
            else if (showSubSubjectColumn) onOpenSubSubjectModal(subject);
        }
    };

    // 🔍 Validation logic
    const validateSubjects = () => {
        const newErrors: ValidationErrors = {};
        subjects.forEach((s) => {
            const err: ValidationErrors[number] = {};
            if (!s.ECYSES_MaxMarks) err.ECYSES_MaxMarks = 'Max Marks is required';
            if (!s.ECYSES_MinMarks) err.ECYSES_MinMarks = 'Min Marks is required';
            if (!s.ECYSES_MarksEntryMax) err.ECYSES_MarksEntryMax = 'Max Entry Marks is required';
            if (Object.keys(err).length > 0) newErrors[s.ISMS_Id] = err;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ⚡ You can trigger validation externally before save
    useEffect(() => {
        (window as any).validateSubjectTable = validateSubjects;
    }, [subjects]);

    return (
        <div className='overflow-x-auto'>
            {subjects.length !== 0 && (
                <table className='w-full table-auto border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-left text-[13px] text-slate-700'>
                            <th className='w-10 border p-2 text-center'>SLNO</th>
                            <th className='w-16 border p-2 text-center'>
                                <div className='flex flex-col items-center justify-center'>
                                    <div className='mb-1 text-[13px]'>Select</div>
                                    <Checkbox
                                        checked={!!headerState.selectAll}
                                        onCheckedChange={(v) => handleHeaderChange('selectAll', !!v)}
                                    />
                                </div>
                            </th>
                            <th className='border p-2 text-left'>Subject Name (Code)</th>
                            <th className='w-32 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Max. Marks</div>
                                    <Input
                                        value={headerState.maxMarks ?? ''}
                                        onChange={(e) => handleHeaderChange('maxMarks', e.target.value)}
                                        className='h-7 text-center text-sm'
                                    />
                                </div>
                            </th>
                            <th className='w-28 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Min. Marks</div>
                                    <Input
                                        value={headerState.minMarks ?? ''}
                                        onChange={(e) => handleHeaderChange('minMarks', e.target.value)}
                                        className='h-7 text-center text-sm'
                                    />
                                </div>
                            </th>
                            <th className='w-32 border p-2 text-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='mb-1 text-[13px]'>Max. Entry Marks</div>
                                    <Input
                                        value={headerState.maxEntry ?? ''}
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
                                            checked={!!headerState.subExam}
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
                                            checked={!!headerState.subSubject}
                                            onCheckedChange={(v) => handleHeaderChange('subSubject', !!v)}
                                        />
                                    </div>
                                </th>
                            )}
                            {(showSubExamColumn || showSubSubjectColumn) && <th className='w-20 border p-2 text-center'>Map</th>}
                            <th className='w-48 border p-2 text-center'>Marks / Grade</th>
                            <th className='w-20 border p-2 text-center'>Marks Display</th>
                            <th className='w-20 border p-2 text-center'>Grade Display</th>
                            <th className='w-28 border p-2 text-center'>Apply to Result</th>
                            <th className='w-36 border p-2 text-center'>Grade</th>
                        </tr>
                    </thead>

                    <tbody>
                        {subjects.map((s, index) => {
                            const canToggleSubFlags = s.ECYSES_MaxMarks && s.ECYSES_MinMarks && s.ECYSES_MarksEntryMax;

                            return (
                                <tr key={s.ISMS_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className='border p-2 text-center align-top'>{index + 1}</td>
                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.checkedvalue}
                                            onCheckedChange={(v) => toggleSubjectChecked(s.ISMS_Id, !!v)}
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <div className='text-sm'>
                                            <div className='font-medium'>{s.ISMS_SubjectName}</div>
                                            <div className='text-slate-500 text-xs'>{s.ismS_SubjectCode ?? ''}</div>
                                        </div>
                                    </td>

                                    {/* Max Marks */}
                                    <td className='w-28 border p-2'>
                                        <Input
                                            value={s.ECYSES_MaxMarks ?? ''}
                                            onChange={(e) => updateSubjectField(s.ISMS_Id, 'ECYSES_MaxMarks', e.target.value)}
                                        />
                                        {errors[s.ISMS_Id]?.ECYSES_MaxMarks && (
                                            <div className='mt-1 text-red-500 text-xs'>{errors[s.ISMS_Id]?.ECYSES_MaxMarks}</div>
                                        )}
                                    </td>

                                    {/* Min Marks */}
                                    <td className='w-24 border p-2'>
                                        <Input
                                            value={s.ECYSES_MinMarks ?? ''}
                                            onChange={(e) => updateSubjectField(s.ISMS_Id, 'ECYSES_MinMarks', e.target.value)}
                                        />
                                        {errors[s.ismS_Id]?.ECYSES_MinMarks && (
                                            <div className='mt-1 text-red-500 text-xs'>{errors[s.ISMS_Id]?.ECYSES_MinMarks}</div>
                                        )}
                                    </td>

                                    {/* Max Entry */}
                                    <td className='w-28 border p-2'>
                                        <Input
                                            value={s.ECYSES_MarksEntryMax ?? ''}
                                            onChange={(e) => updateSubjectField(s.ISMS_Id, 'ECYSES_MarksEntryMax', e.target.value)}
                                        />
                                        {errors[s.ismS_Id]?.ECYSES_MarksEntryMax && (
                                            <div className='mt-1 text-red-500 text-xs'>{errors[s.ISMS_Id]?.ECYSES_MarksEntryMax}</div>
                                        )}
                                    </td>

                                    {/* SubExam/SubSubject/Map columns remain same */}
                                    {showSubExamColumn && (
                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!s.ECYSES_SubExamFlg}
                                                onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'ECYSES_SubExamFlg', !!v)}
                                                disabled={!canToggleSubFlags}
                                            />
                                            {!canToggleSubFlags && <div className='mt-1 text-slate-400 text-xs'>Enter marks first</div>}
                                        </td>
                                    )}
                                    {showSubSubjectColumn && (
                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!s.ECYSES_SubSubjectFlg}
                                                onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'ECYSES_SubSubjectFlg', !!v)}
                                                disabled={!canToggleSubFlags}
                                            />
                                            {!canToggleSubFlags && <div className='mt-1 text-slate-400 text-xs'>Enter marks first</div>}
                                        </td>
                                    )}
                                    {(showSubExamColumn || showSubSubjectColumn) && (
                                        <td className='border p-2 text-center'>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => handleMapClick(s)}
                                                disabled={!(s.ECYSES_SubExamFlg || s.ECYSES_SubSubjectFlg)}>
                                                Map
                                            </Button>
                                        </td>
                                    )}

                                    {/* Marks / Grade etc. remain same */}
                                    <td className='border p-2'>
                                        <div className='flex items-center gap-3'>
                                            <label className='flex items-center gap-1 text-sm'>
                                                <input
                                                    type='radio'
                                                    name={`marksGrade-${s.ISMS_Id}`}
                                                    checked={s.ECYSES_MarksGradeEntryFlg === 'M'}
                                                    onChange={() => updateSubjectField(s.ISMS_Id, 'ECYSES_MarksGradeEntryFlg', 'M')}
                                                />
                                                <span>Marks</span>
                                            </label>
                                            <label className='flex items-center gap-1 text-sm'>
                                                <input
                                                    type='radio'
                                                    name={`marksGrade-${s.ISMS_Id}`}
                                                    checked={s.ECYSES_MarksGradeEntryFlg === 'G'}
                                                    onChange={() => updateSubjectField(s.ISMS_Id, 'ECYSES_MarksGradeEntryFlg', 'G')}
                                                />
                                                <span>Grade</span>
                                            </label>
                                        </div>
                                    </td>

                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.ECYSES_MarksDisplayFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'ECYSES_MarksDisplayFlg', !!v)}
                                        />
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.ECYSES_GradeDisplayFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'ECYSES_GradeDisplayFlg', !!v)}
                                        />
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            checked={!!s.ECYSES_AplResultFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ISMS_Id, 'ECYSES_AplResultFlg', !!v)}
                                        />
                                    </td>

                                    {/* Grade dropdown */}
                                    <td className='w-44 border p-2'>
                                        <Select
                                            value={s.EMGR_Id ? String(s.EMGR_Id) : ''}
                                            onValueChange={(val) => updateSubjectField(s.ISMS_Id, 'EMGR_Id', Number(val))}>
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
