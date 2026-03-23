'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { periodSubjectSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getFixingClassSectionStaffsBySubject } from '@/server/timetable/constraints/fixing';
import { getPeriodSubjectEditDetails, savePeriodSubjectDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';

type PeriodSubjectSchema = z.infer<typeof periodSubjectSchema>;

interface PeriodSubjectUpdateProps {
    academicList: any[];
    periodList: any[];
    subjectList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    let target = data?.data !== undefined ? data.data : data;
    if (target && !Array.isArray(target) && typeof target === 'object' && target.data !== undefined) {
        target = target.data;
    }
    if (Array.isArray(target)) return target;
    return [];
};

const filterData = (list: any[], key: string) => {
    return (list || []).filter((item: any) => item && Object.keys(item).some(k => k.toLowerCase() === key.toLowerCase()));
};

export default function PeriodSubjectUpdate({ academicList, periodList, subjectList, selectedRow, onSuccess, onCancel }: PeriodSubjectUpdateProps) {
    const form = useForm<PeriodSubjectSchema>({
        resolver: zodResolver(periodSubjectSchema),
        defaultValues: { ttrpsU_Id: 0, asmaY_Id: 0, ttmP_Id: 0, ismS_Id: 0, ttrpsucC_Id: 0, ttrpsU_SUbSelcFlag: false, tempararyArrayList: [] }
    });

    const { handleSubmit, control, watch, reset, setValue, formState: { isSubmitting } } = form;
    const watchedYear = watch('asmaY_Id');
    const watchedSubSelectFlag = watch('ttrpsU_SUbSelcFlag');
    const { fields, append, remove, replace } = useFieldArray({ control, name: 'tempararyArrayList' });

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [masterStaffs, setMasterStaffs] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number>();
    const [selectedSection, setSelectedSection] = useState<number>();
    const [selectedStaff, setSelectedStaff] = useState<number>();
    const [nop, setNop] = useState<string>('');

    useEffect(() => {
        const loadEditData = async () => {
            const id = selectedRow?.ttrpsU_Id || selectedRow?.TTRPSU_Id || selectedRow?.ttfpsU_Id || selectedRow?.TTFPSU_Id;
            if (!id) return;
            try {
                const res: any = await getPeriodSubjectEditDetails(id);
                const responseData = res?.data || res;
                const data = responseData?.restrict_period_subject_edit?.[0] ||
                    responseData?.restriction_period_subject_edit?.[0] ||
                    responseData?.restrict_day_period_subject_edit?.[0] ||
                    responseData?.restrict_period_subject?.[0] ||
                    responseData?.periodsubjectlist?.[0] ||
                    (Array.isArray(responseData) ? responseData[0] : selectedRow);
                reset({
                    ttrpsU_Id: data.ttrpsU_Id || data.ttrpsu_Id,
                    asmaY_Id: data.asmaY_Id, ttmP_Id: data.ttmP_Id, ismS_Id: data.ismS_Id,
                    ttrpsU_SUbSelcFlag: data.ttrpsU_SUbSelcFlag === 1 || data.ttrpsU_SUbSelcFlag === true, tempararyArrayList: []
                });
                if (data.asmaY_Id && data.ismS_Id) await loadAssignments(data.ismS_Id, data.asmaY_Id);
                const list = responseData?.restrict_period_subject_classedit ||
                    responseData?.restriction_period_subject_class_edit ||
                    responseData?.restrict_day_period_subject_classedit ||
                    responseData?.periodsubject__classecedit ||
                    responseData?.data?.restrict_period_subject_classedit ||
                    data.tempararyArrayList || data.combinationlist || [];
                if (list) {
                    replace(list.map((sub: any) => ({
                        asmcL_Id: sub.asmcL_Id || sub.ASMCL_Id, asmS_Id: sub.asmS_Id || sub.ASMS_Id, hrmE_Id: sub.hrmE_Id || sub.HRME_Id, nod: sub.ttrpsucC_Periods || sub.TTRPSUCC_Days || sub.TTRPSUCC_Periods || sub.nod,
                        clsDisplay: sub.asmcL_ClassName || sub.clsDisplay, sectDisplay: sub.asmC_SectionName || sub.asmS_SectionName || sub.sectDisplay, staffDisplay: sub.staffName || sub.staffDisplay
                    })));
                }
            } catch (e) { console.error(e); }
        };
        loadEditData();
    }, [selectedRow, reset]);

    const loadAssignments = async (subjectId: number, yearId: number) => {
        const res = await getFixingClassSectionStaffsBySubject(yearId, subjectId);
        if (res) {
            const dataObj = res.data || res;
            const classes = extractList(dataObj, 'clssbysub').length > 0 ? extractList(dataObj, 'clssbysub') : extractList(dataObj, 'clsbysubject');
            const sections = extractList(dataObj, 'secsbysub').length > 0 ? extractList(dataObj, 'secsbysub') : extractList(dataObj, 'secsbysubject');
            const staffs = extractList(dataObj, 'staffbysub').length > 0 ? extractList(dataObj, 'staffbysub') : extractList(dataObj, 'staffsbysubject');
            setMasterStaffs(staffs);
            setClassList(filterData(classes, 'asmcL_ClassName'));
            setSectionList(filterData(sections, 'asmC_SectionName'));
            setStaffList(filterData(staffs, 'staffName'));
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedStaff(undefined);
        const filtered = masterStaffs.filter((s) => Number(s.asmS_Id || s.ASMS_Id) === sectionId);
        setStaffList(filterData(filtered.length > 0 ? filtered : masterStaffs, 'staffName'));
    };

    const handleAdd = () => {
        if (!selectedClass || !selectedSection || !selectedStaff || !nop) return;
        const clsObj = classList.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === selectedClass);
        const secObj = sectionList.find((s) => Number(s.asmS_Id || s.ASMS_Id) === selectedSection);
        const staffObj = staffList.find((st) => Number(st.hrmE_Id || st.HRME_Id) === selectedStaff);
        append({
            asmcL_Id: selectedClass, asmS_Id: selectedSection, hrmE_Id: selectedStaff, nod: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName, sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName, staffDisplay: staffObj?.staffName
        });
        setNop('');
    };

    const onSubmit = async (values: PeriodSubjectSchema) => {
        try {
            const res = await savePeriodSubjectDetail(values);
            if (res.success) { 
                toast.success(res.message); 
                onSuccess(); }
            else toast.error(res.message);
        } catch (error : any) { 
            toast.error(error.message);
        }
    };

    const tempColumns: ColumnDef<any>[] = [
        { accessorKey: 'clsDisplay', header: 'Class' }, { accessorKey: 'sectDisplay', header: 'Section' },
        { accessorKey: 'staffDisplay', header: 'Staff' }, { accessorKey: 'nod', header: 'Days' },
        { id: 'actions', header: 'Actions', cell: ({ row }) => (<Button variant='ghost' size='sm' type='button' onClick={() => remove(row.index)}><Trash className='h-4 w-4 text-red-500' /></Button>) }
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='space-y-2'><Label>Academic Year <span className='text-red-500'>*</span></Label>
                    <Controller control={control} name='asmaY_Id' render={({ field }) => (
                        <Select onValueChange={(val) => { field.onChange(Number(val)); if (form.getValues('ismS_Id')) loadAssignments(form.getValues('ismS_Id'), Number(val)); }} value={field.value?.toString()}>
                            <SelectTrigger><SelectValue placeholder='--Select--' /></SelectTrigger>
                            <SelectContent>{academicList.map((item: any) => (<SelectItem key={item.asmaY_Id} value={item.asmaY_Id?.toString()}>{item.asmaY_Year}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                </div>
                <div className='space-y-2'><Label>Period <span className='text-red-500'>*</span></Label>
                    <Controller control={control} name='ttmP_Id' render={({ field }) => (
                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                            <SelectTrigger><SelectValue placeholder='--Select--' /></SelectTrigger>
                            <SelectContent>{periodList.map((item: any) => (<SelectItem key={item.ttmP_Id || item.id} value={(item.ttmP_Id || item.id)?.toString()}>{item.ttmP_PeriodName || item.periodName}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                </div>
                <div className='space-y-2'><Label>Subject <span className='text-red-500'>*</span></Label>
                    <Controller control={control} name='ismS_Id' render={({ field }) => (
                        <Select onValueChange={(val) => { field.onChange(Number(val)); if (watchedYear) loadAssignments(Number(val), watchedYear); }} value={field.value?.toString()}>
                            <SelectTrigger><SelectValue placeholder='--Select--' /></SelectTrigger>
                            <SelectContent>{subjectList.map((item: any) => (<SelectItem key={item.ismS_Id} value={item.ismS_Id?.toString()}>{item.ismS_SubjectName}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                </div>
            </div>
            <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                <div className='flex items-center space-x-2'>
                    <Controller control={control} name='ttrpsU_SUbSelcFlag' render={({ field }) => (<Checkbox checked={!!field.value} onCheckedChange={field.onChange} id='cs_flag_psu_upd' />)} />
                    <Label htmlFor='cs_flag_psu_upd' className='font-semibold'>Restriction Class-Section Wise</Label>
                </div>
                {watchedSubSelectFlag && (
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-6'>
                        <div className='space-y-2'><Label>Class</Label>
                            <Select onValueChange={(v) => { setSelectedClass(Number(v)); setSelectedSection(undefined); }} value={selectedClass?.toString()}>
                                <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                <SelectContent>{classList.map((item: any) => (<SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>{item.asmcL_ClassName}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'><Label>Section</Label>
                            <Select onValueChange={(v) => handleSectionChange(Number(v))} value={selectedSection?.toString()}>
                                <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                <SelectContent>{sectionList.map((item: any) => (<SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>{item.asmC_SectionName}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'><Label>Staff</Label>
                            <Select onValueChange={(v) => setSelectedStaff(Number(v))} value={selectedStaff?.toString()}>
                                <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                <SelectContent>{staffList.map((item: any) => (<SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>{item.staffName}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'><Label>Days</Label><InputText value={nop} onChange={(e) => setNop(e.target.value)} type='number' /></div>
                        <Button type='button' onClick={handleAdd} variant='secondary'><Plus className='mr-2 h-4 w-4' /> Add</Button>
                    </div>
                )}
                {watchedSubSelectFlag && fields.length > 0 && <div className='mt-4'><GenericDataTable data={fields} columns={tempColumns} isPaginationRequired={false} isLoading={false} /></div>}
            </div>
            <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting}><Save className='mr-2 h-4 w-4' /> Update</Button>
                <Button type='button' variant='outline' onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
}
