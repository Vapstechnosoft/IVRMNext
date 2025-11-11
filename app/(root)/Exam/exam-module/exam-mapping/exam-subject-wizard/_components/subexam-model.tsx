'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { z } from 'zod';

// ---- Minimal types added to fix checkedvalue typing/updation ----
interface SubExamItem {
    emsE_Id: number;
    emsE_SubExamName: string;
    emsE_SubExamCode?: string;
    checkedvalue?: boolean;
    eycessS_MaxMarks?: string | number;
    eycessS_MinMarks?: string | number;
    emgR_Id?: string | number;
    eycessS_ExemptedFlg?: boolean;
    eycessS_ExemptedPer?: string | number;
    eycessS_SubSubjectOrder?: string | number;
    eycessS_ActiveFlg?: boolean;
    eycessS_GradesFlg?: boolean;
    eycessS_MarksFlg?: boolean;
    eycessS_AplResultFlg?: boolean;
    eycessS_MarksEntryMax?: string | number;
    EYCESSE_Id?: number;
    EYCESSS_Id?: number;
}

interface FormData {
    subexam_list: SubExamItem[];
}
// ------------------------------------------------------------------

export default function SubExamModal({
    open,
    subject,
    onClose,
    onSave,
    schema,
    gradeList
}: {
    open: boolean;
    subject?: any;
    onClose: () => void;
    onSave: (subjectId: number, selectedList: any[]) => void;
    schema: z.ZodType<any>;
    gradeList: IMasterGrade[];
}) {
    const methods = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { subexam_list: [] },
        mode: 'onTouched'
    });

    // <-- extract setValue (was missing previously) along with reset, getValues, trigger
    const { reset, getValues, trigger, setValue } = methods;

    useEffect(() => {
        if (!subject) {
            reset({ subexam_list: [] });
            return;
        }

        const list = (subject.list ?? []).map((l: any) => ({
            ...l,
            emsE_SubExamName: l.emsE_SubExamName,
            emsE_SubExamCode: l.emsE_SubExamCode,
            checkedvalue: Boolean(l.checkedvalue) ?? false,
            eycessS_MaxMarks: l.eycessS_MaxMarks ?? '',
            eycessS_MinMarks: l.eycessS_MinMarks ?? '',
            emgR_Id: l.emgR_Id ?? subject.emgR_Id ?? '',
            eycessS_ExemptedFlg: !!l.eycessS_ExemptedFlg,
            eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
            eycessS_SubSubjectOrder: l.eycessS_SubSubjectOrder ?? '',
            eycessS_ActiveFlg: !!l.eycessS_ActiveFlg,
            eycessS_GradesFlg: !!l.eycessS_GradesFlg,
            eycessS_MarksFlg: !!l.eycessS_MarksFlg,
            eycessS_AplResultFlg: !!l.eycessS_AplResultFlg,
            eycessS_MarksEntryMax: l.eycessS_MarksEntryMax ?? ''
        }));

        reset({ subexam_list: list });

        setTimeout(() => {
            trigger('subexam_list');
        }, 0);
    }, [subject, reset, trigger]);

    if (!subject) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-h-[70vh] w-full min-w-[80vw] overflow-x-auto overflow-y-auto pt-0 sm:overflow-x-hidden'>
                <DialogHeader className='sticky top-0 bg-white pt-4'>
                    <DialogTitle>{`Map Sub-Exam — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save mapping</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <div className='overflow-x-auto'>
                        <table className='w-full table-auto'>
                            <thead className='bg-slate-50'>
                                <tr className='text-sm'>
                                    <th className='border p-2'>SLNO</th>
                                    <th className='border p-2'>Select</th>
                                    <th className='border p-2'>Sub-Exam</th>
                                    <th className='border p-2'>Max Marks</th>
                                    <th className='border p-2'>Min Marks</th>
                                    <th className='border p-2'>Grade</th>
                                    <th className='border p-2'>Exempted</th>
                                    <th className='border p-2'>Exempt %</th>
                                    <th className='border p-2'>Marks Flag</th>
                                    <th className='border p-2'>Grades Flag</th>
                                    <th className='border p-2'>Apl Result</th>
                                    <th className='border p-2'>Marks Entry Max</th>
                                    <th className='border p-2'>Active</th>
                                </tr>
                            </thead>

                            <tbody>
                                {getValues('subexam_list')?.map((row: SubExamItem, idx: number) => (
                                    <tr key={row.emsE_Id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className='border p-2'>{idx + 1}</td>
                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!row.checkedvalue}
                                                onCheckedChange={(v) => {
                                                    // now setValue exists and updates the form correctly
                                                    setValue(`subexam_list.${idx}.checkedvalue`, !!v);
                                                }}
                                            />
                                        </td>

                                        <td className='border p-2'>{row.emsE_SubExamName}</td>

                                        <td className='w-28 border p-2'>
                                            <Input
                                                value={row.eycessS_MaxMarks ?? ''}
                                                onChange={(e) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_MaxMarks: e.target.value } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='w-24 border p-2'>
                                            <Input
                                                value={row.eycessS_MinMarks ?? ''}
                                                onChange={(e) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_MinMarks: e.target.value } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='w-40 border p-2'>
                                            <Select
                                                value={row.emgR_Id?.toString() ?? ''}
                                                onValueChange={(val) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, emgR_Id: val } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}>
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

                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!row.eycessS_ExemptedFlg}
                                                onCheckedChange={(v) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_ExemptedFlg: !!v } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='w-24 border p-2'>
                                            <Input
                                                disabled={!row.eycessS_ExemptedFlg}
                                                value={row.eycessS_ExemptedPer ?? ''}
                                                onChange={(e) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_ExemptedPer: e.target.value } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!row.eycessS_MarksFlg}
                                                onCheckedChange={(v) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_MarksFlg: !!v } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!row.eycessS_GradesFlg}
                                                onCheckedChange={(v) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_GradesFlg: !!v } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!row.eycessS_AplResultFlg}
                                                onCheckedChange={(v) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_AplResultFlg: !!v } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='w-28 border p-2'>
                                            <Input
                                                value={row.eycessS_MarksEntryMax ?? ''}
                                                onChange={(e) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_MarksEntryMax: e.target.value } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>

                                        <td className='border p-2 text-center'>
                                            <Checkbox
                                                checked={!!row.eycessS_ActiveFlg}
                                                onCheckedChange={(v) => {
                                                    const list = getValues('subexam_list').map((r: any) =>
                                                        r.emsE_Id === row.emsE_Id ? { ...r, eycessS_ActiveFlg: !!v } : r
                                                    );
                                                    reset({ subexam_list: list });
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ SAVE & CLOSE BUTTON - no onSubmit */}
                    <div className='z-10 mt-4 flex w-fit justify-end gap-2 border-t bg-white p-2'>
                        <Button
                            className='w-fit'
                            type='button'
                            onClick={() => {
                                const values = getValues();
                                const selected = values.subexam_list.filter((r: any) => r.checkedvalue);

                                const parentMax = Number(subject.ECYSES_MaxMarks ?? 0);
                                const parentMin = Number(subject.ECYSES_MinMarks ?? 0);
                                const totMax = selected.reduce((acc: number, cur: any) => acc + Number(cur.eycessS_MaxMarks || 0), 0);
                                const totMin = selected.reduce((acc: number, cur: any) => acc + Number(cur.eycessS_MinMarks || 0), 0);

                                if (selected.length > 0 && (totMax !== parentMax || totMin !== parentMin)) {
                                    alert('Sum of selected sub-exams (max/min) must equal subject max/min marks');
                                    return;
                                }

                                // ✅ Map to final structure
                                const formatted = selected.map((r: any, index: number) => ({
                                    EYCESSE_Id: r.EYCESSE_Id ?? 0,
                                    EYCES_Id: subject.EYCES_Id,
                                    EMSE_Id: r.emsE_Id,
                                    EMGR_Id: Number(r.emgR_Id) || null,
                                    EYCESSE_MaxMarks: Number(r.eycessS_MaxMarks) || 0,
                                    EYCESSE_MinMarks: Number(r.eycessS_MinMarks) || 0,
                                    EYCESSE_ExemptedFlg: !!r.eycessS_ExemptedFlg,
                                    EYCESSE_ExemptedPer: Number(r.eycessS_ExemptedPer) || 0,
                                    EYCESSE_ActiveFlg: !!r.eycessS_ActiveFlg,
                                    EYCESSE_SubExamOrder: index + 1,
                                    EYCESSS_MarksFlg: !!r.eycessS_MarksFlg,
                                    EYCESSS_GradesFlg: !!r.eycessS_GradesFlg,
                                    EYCESSS_AplResultFlg: !!r.eycessS_AplResultFlg,
                                    EYCESSS_MarksEntryMax: Number(r.eycessS_MarksEntryMax) || 0
                                }));

                                onSave(subject.ISMS_Id, formatted);
                                onClose();
                            }}>
                            Save & Close
                        </Button>

                        <Button type='button' variant='ghost' onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
