'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExamTTTransSettings } from '@/hooks/exam/exammodule/exam-mapping';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassesByAcademicYear,
    getExamTTTransEditDetails,
    getSectionsByClass,
    getSubjectGroupsAndExamsBySection,
    getSubjectListAndTimeSlots,
    saveExamTTTransSettings
} from '@/server/exam/exam-module/exam-mapping/exam-tt-trans-settings';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface SubjectRow {
    ismS_Id: number;
    ismS_SubjectName: string;
    check_save: number;
    exttS_Date: string;
    ettS_Id: string;
}

interface Props {
    onSuccess?: () => void;
    editData?: IExamTTTransSettings;
}

export default function AddExamTTTransSettingsForm({ onSuccess, editData }: Props) {
    const { refetchAll } = useExamTTTransSettings();
    const { data: acYearData, isLoading: acYearLoading } = useAcademicYearDropdown();

    const [isPending, startTransition] = useTransition();
    const [loadingCascade, setLoadingCascade] = useState(false);

    const [asmay, setAsmay] = useState('');
    const [asmcl, setAsmcl] = useState('');
    const [asms, setAsms] = useState('');
    const [eme, setEme] = useState('');
    const [emg, setEmg] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [exttId, setExttId] = useState(0);

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [timeSlots, setTimeSlots] = useState<any[]>([]);
    const [mainList, setMainList] = useState<SubjectRow[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-populate on edit
    useEffect(() => {
        if (!editData) return;
        (async () => {
            try {
                const res = await getExamTTTransEditDetails(editData.extT_Id);
                const edit = res?.data?.listedit?.[0];
                if (!edit) return;

                setExttId(editData.extT_Id);

                // Load classes for that year
                setAsmay(String(edit.asmaY_Id));
                const clsRes = await getClassesByAcademicYear(edit.asmaY_Id);
                setClasses(clsRes?.data?.ctlist ?? []);
                setAsmcl(String(edit.asmcL_Id));

                // Load sections
                const secRes = await getSectionsByClass(edit.asmcL_Id, edit.asmaY_Id);
                setSections(secRes?.data?.seclist ?? []);
                setAsms(String(edit.asmS_Id));

                // Load subject groups & exams
                const sgRes = await getSubjectGroupsAndExamsBySection(edit.asmS_Id, edit.asmcL_Id, edit.asmaY_Id);
                setSubjectGroups(sgRes?.data?.subject_group ?? []);
                setExams(sgRes?.data?.examlist ?? []);
                setEme(String(edit.emE_Id));
                setEmg(String(edit.emG_Id));

                setFromDate(edit.extT_FromDate?.split('T')[0] ?? '');
                setToDate(edit.extT_EndDate?.split('T')[0] ?? '');

                // Load subjects
                const subRes = await getSubjectListAndTimeSlots({
                    ASMS_Id: edit.asmS_Id,
                    ASMCL_Id: edit.asmcL_Id,
                    ASMAY_Id: edit.asmaY_Id,
                    EMG_Id: edit.emG_Id,
                    EME_Id: edit.emE_Id
                });
                setTimeSlots(subRes?.data?.time_slot ?? []);

                const subjects: any[] = res?.data?.subject_name ?? [];
                const listedit: any[] = res?.data?.listedit ?? [];
                const merged: SubjectRow[] = subjects.map((s: any) => {
                    const match = listedit.find((e: any) => e.ismS_Id === s.ismS_Id);
                    return match
                        ? { ismS_Id: s.ismS_Id, ismS_SubjectName: s.ismS_SubjectName, check_save: 1, exttS_Date: match.exttS_Date?.split('T')[0] ?? '', ettS_Id: String(match.ettS_Id) }
                        : { ismS_Id: s.ismS_Id, ismS_SubjectName: s.ismS_SubjectName, check_save: 0, exttS_Date: '', ettS_Id: '' };
                });
                setMainList(merged);
            } catch {
                toast.error('Failed to load edit data');
            }
        })();
    }, [editData]);

    async function onSelectAcademicYear(val: string) {
        setAsmay(val);
        setAsmcl(''); setAsms(''); setEme(''); setEmg('');
        setClasses([]); setSections([]); setSubjectGroups([]); setExams([]);
        setMainList([]);
        if (!val) return;
        setLoadingCascade(true);
        try {
            const res = await getClassesByAcademicYear(Number(val));
            setClasses(res?.data?.ctlist ?? []);
        } catch { toast.error('Failed to load classes'); }
        finally { setLoadingCascade(false); }
    }

    async function onSelectClass(val: string) {
        setAsmcl(val); setAsms(''); setEme(''); setEmg('');
        setSections([]); setSubjectGroups([]); setExams([]); setMainList([]);
        if (!val || !asmay) return;
        setLoadingCascade(true);
        try {
            const res = await getSectionsByClass(Number(val), Number(asmay));
            setSections(res?.data?.seclist ?? []);
        } catch { toast.error('Failed to load sections'); }
        finally { setLoadingCascade(false); }
    }

    async function onSelectSection(val: string) {
        setAsms(val); setEme(''); setEmg('');
        setSubjectGroups([]); setExams([]); setMainList([]);
        if (!val || !asmcl || !asmay) return;
        setLoadingCascade(true);
        try {
            const res = await getSubjectGroupsAndExamsBySection(Number(val), Number(asmcl), Number(asmay));
            setSubjectGroups(res?.data?.subject_group ?? []);
            setExams(res?.data?.examlist ?? []);
        } catch { toast.error('Failed to load subject groups'); }
        finally { setLoadingCascade(false); }
    }

    async function onSelectSubjectGroup(val: string) {
        setEmg(val); setMainList([]);
        if (!val || !asms || !asmcl || !asmay) return;
        setLoadingCascade(true);
        try {
            const res = await getSubjectListAndTimeSlots({
                ASMS_Id: Number(asms),
                ASMCL_Id: Number(asmcl),
                ASMAY_Id: Number(asmay),
                EMG_Id: Number(val),
                EME_Id: Number(eme) || 0
            });
            setTimeSlots(res?.data?.time_slot ?? []);
            const subjects: any[] = res?.data?.subject_name ?? [];
            setMainList(subjects.map((s: any) => ({
                ismS_Id: s.ismS_Id,
                ismS_SubjectName: s.ismS_SubjectName,
                check_save: s.check_save ?? 0,
                exttS_Date: s.exttS_Date ? new Date(s.exttS_Date).toISOString().split('T')[0] : '',
                ettS_Id: String(s.ettS_Id ?? '')
            })));
        } catch { toast.error('Failed to load subjects'); }
        finally { setLoadingCascade(false); }
    }

    function updateRow(idx: number, field: keyof SubjectRow, value: any) {
        setMainList(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    }

    function validate() {
        const errs: Record<string, string> = {};
        if (!asmay) errs.asmay = 'Academic Year is required';
        if (!asmcl) errs.asmcl = 'Class is required';
        if (!asms) errs.asms = 'Section is required';
        if (!eme) errs.eme = 'Exam is required';
        if (!emg) errs.emg = 'Subject Group is required';
        if (!fromDate) errs.fromDate = 'From Date is required';
        if (!toDate) errs.toDate = 'To Date is required';
        const checked = mainList.filter(r => r.check_save);
        if (!checked.length) errs.mainList = 'Select at least one subject row';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleSave() {
        if (!validate()) return;
        const checkedRows = mainList.filter(r => r.check_save);
        startTransition(async () => {
            try {
                const payload = {
                    ASMS_Id: Number(asms),
                    ASMCL_Id: Number(asmcl),
                    ASMAY_Id: Number(asmay),
                    EME_Id: Number(eme),
                    EMG_Id: Number(emg),
                    EXTT_FromDate: new Date(fromDate).toDateString(),
                    EXTT_EndDate: new Date(toDate).toDateString(),
                    EXTT_Id: exttId,
                    TempararyArrayList: checkedRows.map(r => ({
                        ismS_Id: r.ismS_Id,
                        check_save: 1,
                        exttS_Date: new Date(r.exttS_Date).toDateString(),
                        ettS_Id: Number(r.ettS_Id),
                        ismS_SubjectName: r.ismS_SubjectName
                    }))
                };
                const res = await saveExamTTTransSettings(payload);
                if (res?.data?.returnval === true) {
                    toast.success('Saved successfully');
                    refetchAll?.();
                    onSuccess?.();
                } else if (res?.data?.returnduplicatestatus === 'Duplicate') {
                    toast.error('Records Already Exist!');
                } else {
                    toast.error(res?.message || 'Save failed');
                }
            } catch { toast.error('Failed to save'); }
        });
    }

    function handleReset() {
        setAsmay(''); setAsmcl(''); setAsms(''); setEme(''); setEmg('');
        setFromDate(''); setToDate('');
        setClasses([]); setSections([]); setSubjectGroups([]); setExams([]);
        setMainList([]); setExttId(0); setErrors({});
    }

    return (
        <div className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
            {/* Filter Row 1 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Academic Year */}
                <div>
                    <Label>Academic Year <span className='text-red-500'>*</span></Label>
                    <Select value={asmay} onValueChange={onSelectAcademicYear}>
                        <SelectTrigger><SelectValue placeholder='Select Academic Year' /></SelectTrigger>
                        <SelectContent>
                            {acYearLoading
                                ? <SelectItem value='_' disabled>Loading...</SelectItem>
                                : acYearData?.data?.map((y: any) => (
                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>{y.asmaY_Year}</SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {errors.asmay && <FormError>{errors.asmay}</FormError>}
                </div>

                {/* Class */}
                <div>
                    <Label>Class <span className='text-red-500'>*</span></Label>
                    <Select value={asmcl} onValueChange={onSelectClass} disabled={!asmay || loadingCascade}>
                        <SelectTrigger><SelectValue placeholder={loadingCascade ? 'Loading...' : 'Select Class'} /></SelectTrigger>
                        <SelectContent>
                            {classes.map((c: any) => <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>{c.asmcL_ClassName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.asmcl && <FormError>{errors.asmcl}</FormError>}
                </div>

                {/* Section */}
                <div>
                    <Label>Section <span className='text-red-500'>*</span></Label>
                    <Select value={asms} onValueChange={onSelectSection} disabled={!asmcl || loadingCascade}>
                        <SelectTrigger><SelectValue placeholder={loadingCascade ? 'Loading...' : 'Select Section'} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value='0'>All</SelectItem>
                            {sections.map((s: any) => <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>{s.asmC_SectionName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.asms && <FormError>{errors.asms}</FormError>}
                </div>

                {/* Exam */}
                <div>
                    <Label>Exam Name <span className='text-red-500'>*</span></Label>
                    <Select value={eme} onValueChange={setEme} disabled={!asms}>
                        <SelectTrigger><SelectValue placeholder='Select Exam' /></SelectTrigger>
                        <SelectContent>
                            {exams.map((e: any) => <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>{e.emE_ExamName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.eme && <FormError>{errors.eme}</FormError>}
                </div>

                {/* Subject Group */}
                <div>
                    <Label>Subject Group <span className='text-red-500'>*</span></Label>
                    <Select value={emg} onValueChange={onSelectSubjectGroup} disabled={!asms || loadingCascade}>
                        <SelectTrigger><SelectValue placeholder={loadingCascade ? 'Loading...' : 'Select Subject Group'} /></SelectTrigger>
                        <SelectContent>
                            {subjectGroups.map((g: any) => <SelectItem key={g.emG_Id} value={String(g.emG_Id)}>{g.emG_GroupName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.emg && <FormError>{errors.emg}</FormError>}
                </div>

                {/* From Date */}
                <div>
                    <Label>From Date <span className='text-red-500'>*</span></Label>
                    <Input type='date' value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    {errors.fromDate && <FormError>{errors.fromDate}</FormError>}
                </div>

                {/* To Date */}
                <div>
                    <Label>To Date <span className='text-red-500'>*</span></Label>
                    <Input type='date' value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)} />
                    {errors.toDate && <FormError>{errors.toDate}</FormError>}
                </div>
            </div>

            {/* Subject Grid */}
            {mainList.length > 0 && (
                <div>
                    <Label className='mb-2 block font-semibold'>Exam Time Table</Label>
                    {errors.mainList && <FormError>{errors.mainList}</FormError>}
                    <div className='overflow-x-auto rounded-xl border shadow-sm'>
                        <table className='w-full border-separate border-spacing-0'>
                            <thead>
                                <tr className='bg-primary text-primary-foreground'>
                                    <th className='px-3 py-2 text-left font-medium text-sm'>Select</th>
                                    <th className='px-3 py-2 text-left font-medium text-sm'>Exam Date</th>
                                    <th className='px-3 py-2 text-left font-medium text-sm'>Time Slot</th>
                                    <th className='px-3 py-2 text-left font-medium text-sm'>Subject</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mainList.map((row, idx) => (
                                    <tr key={row.ismS_Id} className='border-gray-200 border-t hover:bg-accent/30 transition-colors'>
                                        <td className='px-3 py-2'>
                                            <Checkbox
                                                checked={!!row.check_save}
                                                onCheckedChange={c => updateRow(idx, 'check_save', c ? 1 : 0)}
                                            />
                                        </td>
                                        <td className='px-3 py-2'>
                                            <Input
                                                type='date'
                                                value={row.exttS_Date}
                                                min={fromDate}
                                                max={toDate}
                                                disabled={!row.check_save}
                                                onChange={e => updateRow(idx, 'exttS_Date', e.target.value)}
                                                className='w-40'
                                            />
                                        </td>
                                        <td className='px-3 py-2'>
                                            <Select
                                                value={row.ettS_Id}
                                                onValueChange={v => updateRow(idx, 'ettS_Id', v)}
                                                disabled={!row.check_save}>
                                                <SelectTrigger className='w-44'>
                                                    <SelectValue placeholder='--Select Time Slot--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((t: any) => (
                                                        <SelectItem key={t.ettS_Id} value={String(t.ettS_Id)}>
                                                            {t.ettS_SessionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className='px-3 py-2 font-medium'>{row.ismS_SubjectName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className='flex gap-3'>
                <Button type='button' onClick={handleSave} disabled={isPending}>
                    {isPending ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Saving...</> : <><Save className='mr-2 h-4 w-4' />Save</>}
                </Button>
                <Button type='button' variant='outline' onClick={handleReset}>
                    <X className='mr-2 h-4 w-4' /> Reset
                </Button>
            </div>
        </div>
    );
}
