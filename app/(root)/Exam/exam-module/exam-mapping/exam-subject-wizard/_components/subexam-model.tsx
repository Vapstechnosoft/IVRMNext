'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { z } from 'zod';
type Grade = { emgR_Id: string; emgR_GradeName: string };

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
    gradeList: Grade[];
}) {
    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { subexam_list: [] }
    });

    const { reset, getValues, handleSubmit } = methods;

    useEffect(() => {
        if (!subject) {
            reset({ subexam_list: [] });
            return;
        }
        const list = (subject.list ?? []).map((l: any) => ({
            ...l,
            checkedvalue: Boolean(l.checkedvalue),
            ECYSESSS_MaxMarks: l.ECYSESSS_MaxMarks ?? '',
            ECYSESSS_MinMarks: l.ECYSESSS_MinMarks ?? '',
            EMGR_Id: l.EMGR_Id ?? subject.EMGR_Id ?? ''
        }));
        reset({ subexam_list: list });
    }, [subject, reset]);

    if (!subject) return null;

    const onSubmit = (values: any) => {
        const selected = (values.subexam_list ?? [])
            .filter((r: any) => r.checkedvalue)
            .map((r: any) => ({
                emsE_Id: r.emsE_Id,
                EMGR_Id: r.EMGR_Id,
                ECYSESSS_MaxMarks: r.ECYSESSS_MaxMarks ?? '',
                ECYSESSS_MinMarks: r.ECYSESSS_MinMarks ?? '',
                ECYSESSS_ExemptedFlg: !!r.ECYSESSS_ExemptedFlg,
                ECYSESSS_ExemptedPer: r.ECYSESSS_ExemptedPer ?? ''
            }));

        // Validate total equals parent marks
        const parentMax = Number(subject.ECYSES_MaxMarks ?? 0);
        const parentMin = Number(subject.ECYSES_MinMarks ?? 0);
        const totMax = selected.reduce((acc: number, cur: any) => acc + Number(cur.ECYSESSS_MaxMarks || 0), 0);
        const totMin = selected.reduce((acc: number, cur: any) => acc + Number(cur.ECYSESSS_MinMarks || 0), 0);

        if (selected.length > 0 && (totMax !== parentMax || totMin !== parentMin)) {
            alert('Sum of selected sub-exams (max/min) must equal subject max/min marks');
            return;
        }

        onSave(subject.ismS_Id, selected);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle>{`Map Sub-Exams — ${subject.ismS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save mapping</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='overflow-x-auto'>
                            <table className='w-full table-auto'>
                                <thead>
                                    <tr className='bg-slate-50 text-sm'>
                                        <th className='border p-2'>SLNO</th>
                                        <th className='border p-2'>Select</th>
                                        <th className='border p-2'>Sub-Exam</th>
                                        <th className='border p-2'>Max Marks</th>
                                        <th className='border p-2'>Min Marks</th>
                                        <th className='border p-2'>Grade</th>
                                        <th className='border p-2'>Exempted</th>
                                        <th className='border p-2'>Exempt %</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {getValues('subexam_list')?.map((row: any, idx: number) => {
                                        const idPrefix = `subexam-${subject.ismS_Id}-${row.emsE_Id}`;
                                        return (
                                            <tr key={row.emsE_Id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className='border p-2'>{idx + 1}</td>
                                                <td className='border p-2'>
                                                    <Checkbox
                                                        id={`${idPrefix}-check`}
                                                        checked={!!row.checkedvalue}
                                                        onCheckedChange={(v) => {
                                                            const list = getValues('subexam_list').map((r: any) =>
                                                                r.emsE_Id === row.emsE_Id ? { ...r, checkedvalue: !!v } : r
                                                            );
                                                            reset({ subexam_list: list });
                                                        }}
                                                    />
                                                </td>

                                                <td className='border p-2'>{row.emsE_SubExamName}</td>

                                                <td className='w-28 border p-2'>
                                                    <Input
                                                        aria-label={`Max marks for ${row.emsE_SubExamName}`}
                                                        value={row.ECYSESSS_MaxMarks ?? ''}
                                                        onChange={(e) => {
                                                            const list = getValues('subexam_list').map((r: any) =>
                                                                r.emsE_Id === row.emsE_Id ? { ...r, ECYSESSS_MaxMarks: e.target.value } : r
                                                            );
                                                            reset({ subexam_list: list });
                                                        }}
                                                    />
                                                </td>

                                                <td className='w-24 border p-2'>
                                                    <Input
                                                        aria-label={`Min marks for ${row.emsE_SubExamName}`}
                                                        value={row.ECYSESSS_MinMarks ?? ''}
                                                        onChange={(e) => {
                                                            const list = getValues('subexam_list').map((r: any) =>
                                                                r.emsE_Id === row.emsE_Id ? { ...r, ECYSESSS_MinMarks: e.target.value } : r
                                                            );
                                                            reset({ subexam_list: list });
                                                        }}
                                                    />
                                                </td>

                                                <td className='w-44 border p-2'>
                                                    <Select
                                                        value={row.EMGR_Id ?? ''}
                                                        onValueChange={(val) => {
                                                            const list = getValues('subexam_list').map((r: any) =>
                                                                r.emsE_Id === row.emsE_Id ? { ...r, EMGR_Id: val } : r
                                                            );
                                                            reset({ subexam_list: list });
                                                        }}>
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

                                                <td className='border p-2 text-center'>
                                                    <Checkbox
                                                        checked={!!row.ECYSESSS_ExemptedFlg}
                                                        onCheckedChange={(v) => {
                                                            const list = getValues('subexam_list').map((r: any) =>
                                                                r.emsE_Id === row.emsE_Id ? { ...r, ECYSESSS_ExemptedFlg: !!v } : r
                                                            );
                                                            reset({ subexam_list: list });
                                                        }}
                                                    />
                                                </td>

                                                <td className='w-24 border p-2'>
                                                    <Input
                                                        aria-label={`Exempt percent ${row.emsE_SubExamName}`}
                                                        disabled={!row.ECYSESSS_ExemptedFlg}
                                                        value={row.ECYSESSS_ExemptedPer ?? ''}
                                                        onChange={(e) => {
                                                            const list = getValues('subexam_list').map((r: any) =>
                                                                r.emsE_Id === row.emsE_Id
                                                                    ? { ...r, ECYSESSS_ExemptedPer: e.target.value }
                                                                    : r
                                                            );
                                                            reset({ subexam_list: list });
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-4 flex justify-end gap-2'>
                            <Button type='submit'>Save & Close</Button>
                            <Button type='button' variant='ghost' onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
