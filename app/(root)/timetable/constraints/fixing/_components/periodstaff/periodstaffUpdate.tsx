'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingPeriodStaffSchema, fixingPeriodStaffSchema } from '@/schemas/timetable/constraints/fixing';
import { getFixingClassSectionSubjectByStaff, saveFixingPeriodStaff, getFixingPeriodStaffDetails } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from '../dayperiod/utils';

interface PeriodStaffUpdateProps {
    academicList: any[];
    periodList: any[];
    staffList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PeriodStaffUpdate({ academicList, periodList, staffList, selectedRow, onSuccess, onCancel }: PeriodStaffUpdateProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subSubjectList, setSubSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterSubjects, setMasterSubjects] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [nop, setNop] = useState<string>('');

    const form = useForm<FixingPeriodStaffSchema>({
        resolver: zodResolver(fixingPeriodStaffSchema),
        defaultValues: {
            ttfpS_Id: 0,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            hrmE_Id: undefined,
            ttfpS_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const { setValue, watch, handleSubmit, formState: { isSubmitting }, control, reset } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttfpS_SUbSelcFlag = watch('ttfpS_SUbSelcFlag');

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    // --- Helper for Case-Insensitive Field Lookup ---
    const getVal = (obj: any, fieldName: string) => {
        if (!obj) return undefined;
        const key = Object.keys(obj).find(k => k.toLowerCase() === fieldName.toLowerCase());
        return key ? obj[key] : undefined;
    };

    // --- Helper to find an array in payload that contains items with a specific field ---
    const findArrayWithField = (payload: any, fieldName: string, excludeArray?: any[]) => {
        if (!payload) return [];
        for (const key of Object.keys(payload)) {
            const val = payload[key];
            if (Array.isArray(val) && val.length > 0 && val !== excludeArray) {
                const hasField = Object.keys(val[0]).some(k => k.toLowerCase() === fieldName.toLowerCase());
                if (hasField) return val;
            }
        }
        return [];
    };

    useEffect(() => {
        const loadEditData = async () => {
            if (!selectedRow) return;

            try {
                const id = selectedRow?.ttfpS_Id || selectedRow?.TTFPS_Id || selectedRow?.ttfpsU_Id || selectedRow?.ttrpsU_Id;
                if (!id) return;

                const res = await getFixingPeriodStaffDetails(id);
                const responseData = res?.data || res;

                // 1. Greedily find main record
                const editData = findArrayWithField(responseData, 'asmaY_Id') ||
                    responseData?.fixing_period_staff_edit ||
                    responseData?.fixing_period_staff ||
                    responseData?.fixing_period_subject ||
                    (Array.isArray(responseData) ? responseData : undefined);

                const main = (editData && Array.isArray(editData)) ? editData[0] : null;
                if (!main) return;

                // 2. Greedily find sub-details (contains asmcL_Id or asms_Id and is NOT the main array)
                const subDetails: any[] = findArrayWithField(responseData, 'asmcL_Id', editData) ||
                    findArrayWithField(responseData, 'asmcl_id', editData) ||
                    responseData?.fixing_period_staff_class_edit ||
                    responseData?.fixing_period_subject_class_edit ||
                    responseData?.fixing_period_subject__classecedit || [];

                // Resolve IDs for form reset
                const staffId = getVal(main, 'hrmE_Id') || selectedRow?.hrmE_Id;
                const yearId = getVal(main, 'asmaY_Id') || selectedRow?.asmaY_Id;
                const periodId = getVal(main, 'ttmP_Id') || selectedRow?.ttmP_Id;

                // Optional: pre-fill inputs with the first sub-detail if present
                const firstSub = (subDetails && subDetails.length > 0) ? subDetails[0] : null;
                const pCid = firstSub ? (firstSub.asmcL_Id || firstSub.ASMCL_Id || firstSub.asmcl_id) : undefined;
                const pSid = firstSub ? (firstSub.asmS_Id || firstSub.ASMS_Id || firstSub.asms_id) : undefined;
                const pIsid = firstSub ? (firstSub.ismS_Id || firstSub.ISMS_Id || firstSub.isms_id || firstSub.hrmE_Id) : undefined;
                
                // Consolidate NOP keys to be exhaustive
                const nopKeys = [
                    'ttfpsucC_Periods', 'ttfpsucC_Days', 'ttfdscC_Periods', 'ttfdsc_Periods',
                    'ttfdsc_NoOfPeriods', 'ttfdscC_NoOfPeriods', 'TTFDSC_NoOfPeriods',
                    'TTFPSUCC_Periods', 'TTFPSUCC_Days', 'TTRPSUCC_Periods', 'ttrpsucC_Periods',
                    'NOP', 'nop'
                ];
                const getNopValue = (obj: any) => {
                    if (!obj) return 0;
                    for (const k of nopKeys) {
                        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
                    }
                    return 0;
                };

                const pNop = firstSub ? getNopValue(firstSub) : '';

                reset({
                    ttfpS_Id: getVal(main, 'ttfpS_Id') || selectedRow?.ttfpS_Id || id,
                    asmaY_Id: yearId,
                    ttmP_Id: periodId,
                    hrmE_Id: staffId,
                    ttfpS_SUbSelcFlag: !!(subDetails.length > 0 || (getVal(main, 'ttfpS_SUbSelcFlag') ?? getVal(main, 'ttrpsU_SUbSelcFlag') ?? selectedRow?.ttfpS_SUbSelcFlag)),
                    tempararyArrayList: []
                });

                // Load master lists using resolved IDs
                let masterData = { classes: [] as any[], sections: [] as any[], subjects: [] as any[] };
                if (staffId && yearId) {
                    masterData = await handleStaffChange(staffId, yearId);
                }

                if (pCid) setSelectedClass(Number(pCid));
                if (pSid) setSelectedSection(Number(pSid));
                if (pIsid) setSelectedSubject(Number(pIsid));
                if (pNop !== undefined && pNop !== null && pNop !== '') setNop(pNop.toString());

                if (subDetails && Array.isArray(subDetails)) {
                    replace(
                        subDetails.map((sub: any) => {
                            const cid = sub.asmcL_Id || sub.ASMCL_Id || sub.asmcl_id;
                            const sid = sub.asmS_Id || sub.ASMS_Id || sub.asms_id;
                            const isid = sub.ismS_Id || sub.ISMS_Id || sub.isms_id || sub.hrmE_Id;

                            const clsName = sub.asmcL_ClassName || sub.ASMCL_ClassName ||
                                masterData.classes.find(c => Number(getVal(c, 'asmcL_Id')) === Number(cid))?.asmcL_ClassName ||
                                masterData.classes.find(c => Number(getVal(c, 'asmcL_Id')) === Number(cid))?.className || '';

                            const sectName = sub.asmC_SectionName || sub.ASMC_SectionName || sub.asmS_SectionName ||
                                masterData.sections.find(s => Number(getVal(s, 'asmS_Id')) === Number(sid))?.asmC_SectionName ||
                                masterData.sections.find(s => Number(getVal(s, 'asmS_Id')) === Number(sid))?.asmS_SectionName ||
                                masterData.sections.find(s => Number(getVal(s, 'asmS_Id')) === Number(sid))?.sectionName || '';

                            const subName =
                                sub.ismS_SubjectName || sub.ISMS_SubjectName ||
                                masterData.subjects.find(s => Number(getVal(s, 'ismS_Id')) === Number(isid))?.ismS_SubjectName ||
                                masterData.subjects.find(s => Number(getVal(s, 'ismS_Id')) === Number(isid))?.subjectName ||
                                masterData.subjects.find(s => Number(getVal(s, 'ismS_Id')) === Number(isid))?.ismS_SubjectCode || '';

                            return {
                                ttfpscC_Id: sub.ttfpsucC_Id || sub.TTFPSUCC_Id || sub.ttfpscC_Id || sub.TTFPSCC_Id || 0,
                                asmcL_Id: cid,
                                asmS_Id: sid,
                                ismS_Id: isid,
                                nop: Number(getNopValue(sub)),
                                clsDisplay: clsName,
                                sectDisplay: sectName,
                                subDisplay: subName
                            };
                        })
                    );
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load edit data");
            }
        };

        loadEditData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRow]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);
        setMasterClasses([]);
        setMasterSections([]);
        setMasterSubjects([]);

        const currentStaffId = form.getValues('hrmE_Id');
        if (yearId && currentStaffId) {
            handleStaffChange(currentStaffId, yearId);
        }
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
    };

    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
    };

    const handleStaffChange = async (staffId: number, yearId?: number) => {
        setValue('hrmE_Id', staffId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);

        const effectiveYearId = yearId ?? form.getValues('asmaY_Id');

        if (effectiveYearId && staffId) {
            try {
                const res = await getFixingClassSectionSubjectByStaff(effectiveYearId, staffId);
                const payload = res?.data ?? res;

                if (res) {
                    const classes = extractList(res, 'classlist').length > 0 ? extractList(res, 'classlist') :
                        extractList(res, 'clssbystaff').length > 0 ? extractList(res, 'clssbystaff') :
                            extractList(res, 'clsbystaff');
                    const sections = extractList(res, 'sectionlist').length > 0 ? extractList(res, 'sectionlist') :
                        extractList(res, 'secsbystaff').length > 0 ? extractList(res, 'secsbystaff') :
                            extractList(res, 'sectionlistbystaff');
                    const subjects = extractList(res, 'subjectlist').length > 0 ? extractList(res, 'subjectlist') :
                        extractList(res, 'subsbystaff').length > 0 ? extractList(res, 'subsbystaff') :
                            extractList(res, 'subjectlistbystaff');

                    setMasterClasses(classes);
                    setMasterSections(sections);
                    setMasterSubjects(subjects);

                    setClassList(classes);
                    setSectionList(sections);
                    setSubSubjectList(subjects);
                    return { classes, sections, subjects };
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load staff details');
            }
        }
        return { classes: [], sections: [], subjects: [] };
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nop) {
            toast.warning('Please select all fields');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const subObj = subSubjectList.find((s) => Number(getVal(s, 'ismS_Id')) === selectedSubject);

        const exists = fields.some(
            (f: any) => f.asmcL_Id === selectedClass && f.asmS_Id === selectedSection && f.ismS_Id === selectedSubject
        );
        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            ismS_Id: selectedSubject,
            nop: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName || clsObj?.className,
            sectDisplay: secObj?.asmC_SectionName || secObj?.sectionName || secObj?.asmS_SectionName,
            subDisplay: getVal(subObj, 'ismS_SubjectName') || getVal(subObj, 'subjectName')
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'nop', header: 'No Of Days' },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Button type='button' variant='ghost' size='sm' onClick={() => remove(row.index)}>
                        <span className='text-red-500'>Delete</span>
                    </Button>
                )
            }
        ],
        [remove]
    );

    const onSubmit = async (data: FixingPeriodStaffSchema) => {
        try {
            if (!data.ttfpS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else {
                if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                    toast.warning("Please add at least one Class Details");
                    return;
                }
            }

            const res = await saveFixingPeriodStaff(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res.message);
                reset();
                onSuccess();
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-4 shadow-sm'>
                <FormField
                    control={form.control}
                    name='ttfpS_Id'
                    render={({ field }) => <Input type='hidden' {...field} value={field.value || 0} />}
                />
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Academic Year</FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleAcademicYearChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {academicList?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id?.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ttmP_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Period</FormLabel>
                                <Select key={field.value?.toString() || 'empty'} onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {periodList.map((item: any) => {
                                            const id = item.ttmP_Id ?? item.ttmp_id ?? item.TTMP_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ttmP_PeriodName || item.ttmp_periodname || item.periodName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Staff</FormLabel>
                                <Select
                                    value={field.value?.toString()}
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        handleStaffChange(Number(v));
                                    }}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {staffList.filter((item: any) => item.hrmE_Id).map((item: any, idx: number) => (
                                            <SelectItem key={item.hrmE_Id || `staff-${idx}`} value={item.hrmE_Id?.toString()}>
                                                {item.staffName?.trim()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex items-center space-x-2'>
                    <FormField
                        control={form.control}
                        name='ttfpS_SUbSelcFlag'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4'>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                    <FormLabel>Fixing Class-Section Wise</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {ttfpS_SUbSelcFlag && (
                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <h4 className='font-semibold'>Add Class Details</h4>
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                            <div className='space-y-2'>
                                <FormLabel>Class</FormLabel>
                                <Select
                                    key={selectedClass?.toString() || 'empty'}
                                    onValueChange={(v) => handleClassChange(Number(v))}
                                    value={selectedClass?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                    <SelectContent>
                                        {isClassLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            classList.map((item: any) => {
                                                const id = item.asmcL_Id ?? item.asmcl_id ?? item.ASMCL_Id;
                                                return (
                                                    <SelectItem key={id} value={id?.toString()}>
                                                        {item.asmcL_ClassName || item.asmcL_Classname || item.className}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>Section</FormLabel>
                                <Select
                                    key={selectedSection?.toString() || 'empty'}
                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                    value={selectedSection?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => {
                                            const id = item.asmS_Id ?? item.asms_id ?? item.ASMS_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>Subject</FormLabel>
                                <Select
                                    key={selectedSubject?.toString() || 'empty'}
                                    value={selectedSubject?.toString()}
                                    onValueChange={(v) => setSelectedSubject(Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subSubjectList.map((item: any) => {
                                            const id = item.ismS_Id ?? item.isms_id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ismS_SubjectName || item.subjectName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>No Of Days</FormLabel>
                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} />
                            </div>
                        </div>
                        <Button type='button' onClick={addToGrid}>
                            Add
                        </Button>
                        {fields.length > 0 && <DataTable data={fields} columns={subColumns} totalItems={fields.length} />}
                    </div>
                )}

                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Update
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
