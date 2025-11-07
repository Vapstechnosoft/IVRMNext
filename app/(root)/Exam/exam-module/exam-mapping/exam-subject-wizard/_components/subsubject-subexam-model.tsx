'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SubSubjectSubExamSchema } from '@/schemas/exam/exam-module/exam-mapping';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import type { z } from 'zod';

type SubSubjectSubExam = z.infer<typeof SubSubjectSubExamSchema>;

type SubSubjectSubExamFormValues = {
    list: SubSubjectSubExam[];
};

export default function SubSubjectSubExamModal({
    open,
    subject,
    onClose,
    onSave,
    gradeList,
    schema
}: {
    open: boolean;
    subject?: any;
    onClose: () => void;
    onSave: (subjectId: number, selectedList: SubSubjectSubExam[]) => void;
    gradeList: IMasterGrade[];
    schema: z.ZodType<any>;
}) {
    const methods = useForm<SubSubjectSubExamFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { list: [] }
    });

    const { control, handleSubmit, reset, getValues, setValue, formState } = methods;
    const { errors } = formState;

    // Load data when subject changes
    useEffect(() => {
        if (!subject) {
            reset({ list: [] });
            return;
        }

        const list = (subject.list ?? []).map((l: any) => ({
            eycessS_Id: l.eycessS_Id ?? undefined,
            eyceS_Id: l.eyceS_Id ?? undefined,
            ismS_Id: subject.ismS_Id,
            emsS_Id: l.emsS_Id,
            emgR_GradeName: l.emgR_GradeName ?? '',
            ismS_SubjectName: subject.ISMS_SubjectName ?? '',
            ismS_SubjectCode: subject.ISMS_SubjectCode ?? '',
            emsS_SubSubjectName: l.emsS_SubSubjectName ?? '',
            emsS_SubSubjectCode: l.emsS_SubSubjectCode ?? '',
            emsE_SubExamName: l.emsE_SubExamName ?? '',
            emsE_SubExamCode: l.emsE_SubExamCode ?? '',
            eycessS_MaxMarks: l.eycessS_MaxMarks ?? '',
            eycessS_MinMarks: l.eycessS_MinMarks ?? '',
            eycessS_MarksEntryMax: l.eycessS_MarksEntryMax ?? '',
            eycessS_ExemptedFlg: !!l.eycessS_ExemptedFlg,
            eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
            eycessS_MarksFlg: !!l.eycessS_MarksFlg,
            eycessS_GradesFlg: !!l.eycessS_GradesFlg,
            eycessS_ActiveFlg: !!l.eycessS_ActiveFlg
        }));

        reset({ list });
    }, [subject, reset]);

    const updateRowValue = (idx: number, field: keyof SubSubjectSubExam, value: any) => {
        const list = getValues('list').map((r, i) => (i === idx ? { ...r, [field]: value } : r));
        setValue('list', list, { shouldDirty: true, shouldValidate: true });
    };

    if (!subject) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-h-[70vh] w-full min-w-[85vw] overflow-y-auto pt-0'>
                <DialogHeader className='sticky top-0 bg-white pt-4'>
                    <DialogTitle>{`Map Sub-Exam — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save sub-exam mapping</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className='overflow-x-auto'>
                            <table className='w-full table-auto border-collapse'>
                                <thead>
                                    <tr className='bg-slate-50 text-sm'>
                                        <th className='border p-2'>SLNO</th>
                                        <th className='border p-2'>Sub-Subject Name (Code)</th>
                                        <th className='border p-2'>Sub-Exam Name (Code)</th>
                                        <th className='border p-2'>Max. Marks</th>
                                        <th className='border p-2'>Min. Marks</th>
                                        <th className='border p-2'>Marks Entry Max</th>
                                        <th className='border p-2'>Grade</th>
                                        <th className='border p-2'>Exempted Flag</th>
                                        <th className='border p-2'>Exempted %</th>
                                        <th className='border p-2'>Marks Display</th>
                                        <th className='border p-2'>Grade Display</th>
                                        <th className='border p-2'>Apply Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getValues('list')?.map((row, idx) => {
                                        const rowErrors: any = errors.list?.[idx];
                                        return (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className='border p-2 text-center'>{idx + 1}</td>

                                                {/* Sub-Subject */}
                                                <td className='border p-2'>
                                                    <div className='text-sm'>
                                                        <div className='font-medium'>{row.emsS_SubSubjectName}</div>
                                                        <div className='text-slate-500 text-xs'>{row.emsS_SubSubjectCode}</div>
                                                    </div>
                                                </td>

                                                {/* Sub-Exam */}
                                                <td className='border p-2'>
                                                    <div className='text-sm'>
                                                        <div className='font-medium'>{row.emsE_SubExamName}</div>
                                                        <div className='text-slate-500 text-xs'>{row.emsE_SubExamCode}</div>
                                                    </div>
                                                </td>

                                                {/* Max Marks */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_MaxMarks`}
                                                        render={({ field }) => (
                                                            <Input
                                                                type='number'
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                                                                    e.target.value = val;
                                                                    field.onChange(val === '' ? '' : Number(val));
                                                                    updateRowValue(idx, 'eycessS_MaxMarks', Number(val));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {rowErrors?.eycessS_MaxMarks && (
                                                        <p className='text-[11px] text-red-500'>
                                                            {String(rowErrors.eycessS_MaxMarks.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Min Marks */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_MinMarks`}
                                                        render={({ field }) => (
                                                            <Input
                                                                type='number'
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                                                                    e.target.value = val;
                                                                    field.onChange(val === '' ? '' : Number(val));
                                                                    updateRowValue(idx, 'eycessS_MinMarks', Number(val));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {rowErrors?.eycessS_MinMarks && (
                                                        <p className='text-[11px] text-red-500'>
                                                            {String(rowErrors.eycessS_MinMarks.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Marks Entry Max */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_MarksEntryMax`}
                                                        render={({ field }) => (
                                                            <Input
                                                                type='number'
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                                                                    e.target.value = val;
                                                                    field.onChange(val === '' ? '' : Number(val));
                                                                    updateRowValue(idx, 'eycessS_MarksEntryMax', Number(val));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Grade */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.emgR_GradeName`}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value ?? ''}
                                                                onValueChange={(val) => {
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'emgR_GradeName', val);
                                                                }}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder='Select Grade' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {gradeList.map((g) => (
                                                                        <SelectItem key={g.emgR_Id} value={g.emgR_GradeName}>
                                                                            {g.emgR_GradeName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </td>

                                                {/* Exempted Flag */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_ExemptedFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_ExemptedFlg', !!v);
                                                                    if (!v) updateRowValue(idx, 'eycessS_ExemptedPer', '');
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Exempted % */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_ExemptedPer`}
                                                        render={({ field }) => (
                                                            <Input
                                                                type='number'
                                                                disabled={!getValues(`list.${idx}.eycessS_ExemptedFlg`)}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                                                                    e.target.value = val;
                                                                    field.onChange(val === '' ? '' : Number(val));
                                                                    updateRowValue(idx, 'eycessS_ExemptedPer', Number(val));
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {rowErrors?.eycessS_ExemptedPer && (
                                                        <p className='text-[11px] text-red-500'>
                                                            {String(rowErrors.eycessS_ExemptedPer.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Marks Display */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_MarksFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_MarksFlg', !!v);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Grade Display */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_GradesFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_GradesFlg', !!v);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Apply Result */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`list.${idx}.eycessS_ActiveFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_ActiveFlg', !!v);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className='flex justify-end gap-2 border-t bg-white pt-2'>
                            <Button
                                type='button'
                                onClick={() => {
                                    const selectedList = getValues('list');
                                    onSave(subject.ismS_Id, selectedList);
                                    onClose();
                                }}>
                                Save & Close
                            </Button>
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
