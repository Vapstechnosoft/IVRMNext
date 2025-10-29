'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Grade = { emgR_Id: string; emgR_GradeName: string };

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
    gradeList: Grade[];
}) {
    const toggleSubjectChecked = (id: number, checked: boolean) => {
        setSubjects(subjects.map((s) => (s.ismS_Id === id ? { ...s, checkedvalue: checked } : s)));
    };

    const updateSubjectField = (id: number, key: string, value: any) => {
        setSubjects(subjects.map((s) => (s.ismS_Id === id ? { ...s, [key]: value } : s)));
    };

    const handleMapClick = (subject: any) => {
        // Decide which modal to open. If both enabled, prefer SubExam first (you can change)
        if (showSubExamColumn && subject.ECYSES_SubExamFlg) {
            onOpenSubExamModal(subject);
        } else if (showSubSubjectColumn && subject.ECYSES_SubSubjectFlg) {
            onOpenSubSubjectModal(subject);
        } else {
            // If none selected on subject, open whichever global flag is enabled:
            if (showSubExamColumn) onOpenSubExamModal(subject);
            else if (showSubSubjectColumn) onOpenSubSubjectModal(subject);
        }
    };

    return (
        <div className='overflow-x-auto'>
            <table className='w-full table-auto border-collapse'>
                <thead>
                    <tr className='bg-gray-50 text-left text-slate-700 text-sm'>
                        <th className='border p-2'>SLNO</th>
                        <th className='border p-2'>Select</th>
                        <th className='border p-2'>Subject (Code)</th>
                        <th className='border p-2'>Max Marks</th>
                        <th className='border p-2'>Min Marks</th>
                        <th className='border p-2'>Max Entry</th>
                        {showSubExamColumn && <th className='border p-2'>Sub Exam</th>}
                        {showSubSubjectColumn && <th className='border p-2'>Sub Subject</th>}
                        {(showSubExamColumn || showSubSubjectColumn) && <th className='border p-2'>Map</th>}
                        <th className='border p-2'>Marks/Grade</th>
                        <th className='border p-2'>Marks Display</th>
                        <th className='border p-2'>Grade Display</th>
                        <th className='border p-2'>Apply to Result</th>
                        <th className='border p-2'>Grade</th>
                    </tr>
                </thead>

                <tbody>
                    {subjects.map((s, index) => {
                        const idPrefix = `subject-${s.ismS_Id}`;
                        const canToggleSubFlags =
                            s.ECYSES_MaxMarks !== undefined &&
                            s.ECYSES_MaxMarks !== '' &&
                            s.ECYSES_MinMarks !== undefined &&
                            s.ECYSES_MinMarks !== '' &&
                            s.ECYSES_MarksEntryMax !== undefined &&
                            s.ECYSES_MarksEntryMax !== '';

                        return (
                            <tr key={s.ismS_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className='border p-2 align-top'>{index + 1}</td>

                                <td className='border p-2'>
                                    <div className='flex items-center'>
                                        <Checkbox
                                            id={`${idPrefix}-select`}
                                            checked={!!s.checkedvalue}
                                            onCheckedChange={(v) => toggleSubjectChecked(s.ismS_Id, !!v)}
                                            aria-label={`Select subject ${s.ismS_SubjectName}`}
                                        />
                                    </div>
                                </td>

                                <td className='border p-2'>
                                    <div className='text-sm'>
                                        <div className='font-medium'>{s.ismS_SubjectName}</div>
                                        <div className='text-slate-500 text-xs'>{s.ismS_SubjectCode ?? ''}</div>
                                    </div>
                                </td>

                                <td className='w-28 border p-2'>
                                    <Input
                                        aria-label={`Max marks for ${s.ismS_SubjectName}`}
                                        value={s.ECYSES_MaxMarks ?? ''}
                                        onChange={(e) => updateSubjectField(s.ismS_Id, 'ECYSES_MaxMarks', e.target.value)}
                                    />
                                </td>

                                <td className='w-24 border p-2'>
                                    <Input
                                        aria-label={`Min marks for ${s.ismS_SubjectName}`}
                                        value={s.ECYSES_MinMarks ?? ''}
                                        onChange={(e) => updateSubjectField(s.ismS_Id, 'ECYSES_MinMarks', e.target.value)}
                                    />
                                </td>

                                <td className='w-28 border p-2'>
                                    <Input
                                        aria-label={`Max entry marks for ${s.ismS_SubjectName}`}
                                        value={s.ECYSES_MarksEntryMax ?? ''}
                                        onChange={(e) => updateSubjectField(s.ismS_Id, 'ECYSES_MarksEntryMax', e.target.value)}
                                    />
                                </td>

                                {showSubExamColumn && (
                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            id={`${idPrefix}-subexam`}
                                            checked={!!s.ECYSES_SubExamFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ismS_Id, 'ECYSES_SubExamFlg', !!v)}
                                            disabled={!canToggleSubFlags}
                                            aria-describedby={!canToggleSubFlags ? `${idPrefix}-subexam-help` : undefined}
                                        />
                                        {!canToggleSubFlags && (
                                            <div id={`${idPrefix}-subexam-help`} className='mt-1 text-slate-400 text-xs'>
                                                Enter marks first
                                            </div>
                                        )}
                                    </td>
                                )}

                                {showSubSubjectColumn && (
                                    <td className='border p-2 text-center'>
                                        <Checkbox
                                            id={`${idPrefix}-subsubject`}
                                            checked={!!s.ECYSES_SubSubjectFlg}
                                            onCheckedChange={(v) => updateSubjectField(s.ismS_Id, 'ECYSES_SubSubjectFlg', !!v)}
                                            disabled={!canToggleSubFlags}
                                            aria-describedby={!canToggleSubFlags ? `${idPrefix}-subsubject-help` : undefined}
                                        />
                                        {!canToggleSubFlags && (
                                            <div id={`${idPrefix}-subsubject-help`} className='mt-1 text-slate-400 text-xs'>
                                                Enter marks first
                                            </div>
                                        )}
                                    </td>
                                )}

                                {(showSubExamColumn || showSubSubjectColumn) && (
                                    <td className='border p-2 text-center'>
                                        <label htmlFor={`${idPrefix}-map-button`} className='sr-only'>
                                            Map for {s.ismS_SubjectName}
                                        </label>
                                        <Button
                                            id={`${idPrefix}-map-button`}
                                            size='sm'
                                            variant='outline'
                                            onClick={() => handleMapClick(s)}
                                            disabled={!(s.ECYSES_SubExamFlg || s.ECYSES_SubSubjectFlg)}>
                                            Map
                                        </Button>
                                    </td>
                                )}

                                <td className='border p-2'>
                                    <div className='flex items-center gap-3'>
                                        <label className='flex items-center gap-1 text-sm'>
                                            <input
                                                type='radio'
                                                name={`marksGrade-${s.ismS_Id}`}
                                                checked={s.ECYSES_MarksGradeEntryFlg === 'M'}
                                                onChange={() => updateSubjectField(s.ismS_Id, 'ECYSES_MarksGradeEntryFlg', 'M')}
                                                aria-label={`Marks entry for ${s.ismS_SubjectName}`}
                                            />
                                            <span className='text-sm'>Marks</span>
                                        </label>
                                        <label className='flex items-center gap-1 text-sm'>
                                            <input
                                                type='radio'
                                                name={`marksGrade-${s.ismS_Id}`}
                                                checked={s.ECYSES_MarksGradeEntryFlg === 'G'}
                                                onChange={() => updateSubjectField(s.ismS_Id, 'ECYSES_MarksGradeEntryFlg', 'G')}
                                                aria-label={`Grade entry for ${s.ismS_SubjectName}`}
                                            />
                                            <span className='text-sm'>Grade</span>
                                        </label>
                                    </div>
                                </td>

                                <td className='border p-2'>
                                    <Checkbox
                                        id={`${idPrefix}-marks-display`}
                                        checked={!!s.ECYSES_MarksDisplayFlg}
                                        onCheckedChange={(v) => updateSubjectField(s.ismS_Id, 'ECYSES_MarksDisplayFlg', !!v)}
                                        aria-label={`Marks display for ${s.ismS_SubjectName}`}
                                    />
                                </td>

                                <td className='border p-2'>
                                    <Checkbox
                                        id={`${idPrefix}-grade-display`}
                                        checked={!!s.ECYSES_GradeDisplayFlg}
                                        onCheckedChange={(v) => updateSubjectField(s.ismS_Id, 'ECYSES_GradeDisplayFlg', !!v)}
                                        aria-label={`Grade display for ${s.ismS_SubjectName}`}
                                    />
                                </td>

                                <td className='border p-2'>
                                    <Checkbox
                                        id={`${idPrefix}-apply-result`}
                                        checked={!!s.ECYSES_AplResultFlg}
                                        onCheckedChange={(v) => updateSubjectField(s.ismS_Id, 'ECYSES_AplResultFlg', !!v)}
                                        aria-label={`Apply to result for ${s.ismS_SubjectName}`}
                                    />
                                </td>

                                <td className='w-44 border p-2'>
                                    <Select value={s.EMGR_Id ?? ''} onValueChange={(val) => updateSubjectField(s.ismS_Id, 'EMGR_Id', val)}>
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
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
