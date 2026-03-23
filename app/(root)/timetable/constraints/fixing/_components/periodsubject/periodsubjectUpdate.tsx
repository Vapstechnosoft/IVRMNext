'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingPeriodSubjectSchema, fixingPeriodSubjectSchema } from '@/schemas/timetable/constraints/fixing';
import { getFixingClassSectionStaffsBySubject, saveFixingPeriodSubject, getFixingPeriodSubjectDetails } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];

    if (preferredKey) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }

    const keys = [
        'academiclist', 'catelist', 'categorylist', 'classlist', 'clsbysubject', 'clssbysub',
        'sectionlist', 'sectbysubject', 'secsbysub', 'stafflist', 'staffbysubject', 'staffbysub',
        'staffbyall', 'subjectlist', 'classbycategory', 'sectionbyclass', 'subjectbystaff'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }

    const firstArray = Object.values(target).find((v) => Array.isArray(v));
    return Array.isArray(firstArray) ? firstArray : [];
};

const uniqueById = (list: any[], idKey: string) => {
    const seen = new Set();
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === idKey.toLowerCase());
        const id = actualKey ? item[actualKey] : undefined;
        if (id === undefined || id === null) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

export default function PeriodSubjectUpdate({ academicList, periodList, subjectList, selectedRow, onSuccess, onCancel }: PeriodSubjectUpdateProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subStaffList, setSubStaffList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaff, setMasterStaff] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedStaff, setSelectedStaff] = useState<number | undefined>();
    const [nod, setNod] = useState<string>('');

    const form = useForm<FixingPeriodSubjectSchema>({
        resolver: zodResolver(fixingPeriodSubjectSchema),
        defaultValues: {
            ttrpsU_Id: 0,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            ismS_Id: undefined,
            ttfpsU_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const { setValue, watch, handleSubmit, formState: { isSubmitting }, control, reset } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttfpsU_SUbSelcFlag = watch('ttfpsU_SUbSelcFlag');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    useEffect(() => {
        const loadEditData = async () => {
            try {
                let d = selectedRow;
                const id = d?.ttfpsU_Id || d?.ttrpsU_Id || d?.TTFPSU_Id;
                let fullRes: any = null;
                if (id) {
                    fullRes = await getFixingPeriodSubjectDetails(id);
                    console.log('[PeriodSubjectUpdate] Edit API raw response:', JSON.stringify(fullRes));

                    // Try multiple possible key names for the main record
                    const responseData = fullRes?.data || fullRes;
                    const editData =
                        responseData?.fixing_period_subject_edit ||
                        responseData?.fixing_period_subject ||
                        responseData?.fix_period_subject_edit ||
                        responseData?.period_subject_edit ||
                        (Array.isArray(responseData) ? responseData : undefined);

                    if (editData && Array.isArray(editData) && editData.length > 0) {
                        d = editData[0];
                    } else if (editData && !Array.isArray(editData)) {
                        d = editData;
                    }
                }

                if (d) {
                    // Resolve IDs — use > 0 check so API zeros fall through to selectedRow
                    const yearId = (d.asmaY_Id > 0 ? d.asmaY_Id : null) ?? (d.ASMAY_Id > 0 ? d.ASMAY_Id : null) ?? selectedRow?.asmaY_Id;
                    const periodId = (d.ttmP_Id > 0 ? d.ttmP_Id : null) ?? (d.TTMP_Id > 0 ? d.TTMP_Id : null) ?? selectedRow?.ttmP_Id;
                    const subjectId = (d.ismS_Id > 0 ? d.ismS_Id : null) ?? (d.ISMS_Id > 0 ? d.ISMS_Id : null) ?? selectedRow?.ismS_Id;
                    const subSelcFlag = d.ttfpsU_SUbSelcFlag ?? d.TTFPSU_SUbSelcFlag ?? d.ttrpsU_SUbSelcFlag ?? selectedRow?.ttfpsU_SUbSelcFlag ?? false;

                    // ✅ Call reset() FIRST so form values are set before any dependent logic
                    reset({
                        ttrpsU_Id: d.ttrpsU_Id ?? d.ttfpsU_Id ?? selectedRow?.ttrpsU_Id ?? 0,
                        ttfpsU_Id: d.ttfpsU_Id ?? d.ttrpsU_Id ?? selectedRow?.ttfpsU_Id ?? 0,
                        asmaY_Id: yearId,
                        ttmP_Id: periodId,
                        ismS_Id: subjectId,
                        ttfpsU_SUbSelcFlag: !!subSelcFlag,
                        tempararyArrayList: []
                    });

                    // ✅ Load class/section/staff dropdowns with EXPLICIT ids (not stale watched values)
                    if (subjectId && yearId) {
                        await handleSubjectChange(subjectId, yearId);
                    }

                    // ✅ Populate the grid from sub-details
                    const responseData = fullRes?.data || fullRes;
                    const subDetails =
                        responseData?.fixing_period_subject_class_edit ||
                        responseData?.fixing_period_subject__classecedit ||
                        responseData?.fix_period_subject__classecedit ||
                        responseData?.period_subject_class_edit ||
                        selectedRow?.fixing_period_subject_class_edit || [];

                    if (subSelcFlag && subDetails && Array.isArray(subDetails) && subDetails.length > 0) {
                        const gridItems = subDetails.map((sub: any) => ({
                            asmcL_Id: sub.asmcL_Id ?? sub.ASMCL_Id,
                            asmS_Id: sub.asmS_Id ?? sub.ASMS_Id ?? sub.asmC_Id ?? sub.ASMC_Id,
                            hrmE_Id: sub.hrmE_Id ?? sub.HRME_Id,
                            nop: sub.ttfpsucC_Days ?? sub.nop ?? sub.TTFPSUCC_Days,
                            clsDisplay: sub.asmcL_ClassName ?? sub.ASMCL_ClassName,
                            sectDisplay: sub.asmC_SectionName ?? sub.ASMC_SectionName ?? sub.asmS_SectionName ?? sub.ASMS_SectionName,
                            staffDisplay: sub.staffName ?? sub.staffname ?? sub.hrmE_EmployeeFirstName ?? sub.HRME_EmployeeFirstName
                        }));
                        // Use replace if available, otherwise append
                        gridItems.forEach((item: any) => append(item));
                    }
                }
            } catch (error) {
                console.error('Error processing edit data:', error);
                toast.error('Failed to load edit details');
            }
        };

        if (selectedRow) loadEditData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRow]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setValue('ismS_Id', 0);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);
        setMasterClasses([]);
        setMasterSections([]);
        setMasterStaff([]);
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
    };

    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
    };

    const handleSubjectChange = async (subjectId: number, asmayIdOverride?: number) => {
        // NOTE: do NOT call setValue('ismS_Id') here when called from loadEditData — reset() handles it
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);

        // Always use the explicit override if provided (avoids stale watched value during initial load)
        const activeYearId = asmayIdOverride ?? asmaY_Id;

        if (!activeYearId || !subjectId) return;

        try {
            const res = await getFixingClassSectionStaffsBySubject(activeYearId, subjectId);

            // 🔍 DEBUG: log raw response to identify actual key names
            console.log('[PeriodSubjectUpdate] get_cls_sec_staffsData raw response:', JSON.stringify(res));

            // Unwrap one level of nesting
            const payload = res?.data ?? res;

            // Auto-detect: scan all array-valued keys, pick the one whose items have the target field
            const findArrayByField = (fieldName: string): any[] => {
                for (const key of Object.keys(payload ?? {})) {
                    const val = (payload as any)[key];
                    if (Array.isArray(val) && val.length > 0 && fieldName in val[0]) return val;
                }
                return [];
            };

            // Try known keys first, then auto-detect by field name
            const classes =
                extractList(res, 'clssbysub').length > 0 ? extractList(res, 'clssbysub') :
                extractList(res, 'clsbysubject').length > 0 ? extractList(res, 'clsbysubject') :
                extractList(res, 'classlist').length > 0 ? extractList(res, 'classlist') :
                findArrayByField('asmcL_Id');

            const sections =
                extractList(res, 'secsbysub').length > 0 ? extractList(res, 'secsbysub') :
                extractList(res, 'secsbysubject').length > 0 ? extractList(res, 'secsbysubject') :
                extractList(res, 'sectionlist').length > 0 ? extractList(res, 'sectionlist') :
                findArrayByField('asmS_Id');

            const staff =
                extractList(res, 'staffbysub').length > 0 ? extractList(res, 'staffbysub') :
                extractList(res, 'staffbysubject').length > 0 ? extractList(res, 'staffbysubject') :
                extractList(res, 'stafflist').length > 0 ? extractList(res, 'stafflist') :
                findArrayByField('hrmE_Id');

            console.log('[PeriodSubjectUpdate] Resolved → classes:', classes.length, 'sections:', sections.length, 'staff:', staff.length);

            setMasterClasses(classes);
            setMasterSections(sections);
            setMasterStaff(staff);

            setClassList(uniqueById(classes, 'asmcL_Id'));
            setSectionList(uniqueById(sections, 'asmS_Id'));
            setSubStaffList(uniqueById(staff, 'hrmE_Id'));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subject details');
        }
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedStaff || !nod) {
            toast.warning('Please select all fields');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const staffObj = subStaffList.find((s) => s.hrmE_Id === selectedStaff);

        const exists = fields.some(
            (f: any) => f.asmcL_Id === selectedClass && f.asmS_Id === selectedSection && f.hrmE_Id === selectedStaff
        );
        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            hrmE_Id: selectedStaff,
            nop: Number(nod),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName,
            staffDisplay: staffObj?.hrmE_EmployeeFirstName || staffObj?.staffName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
            { accessorKey: 'nod', header: 'No Of Days' },
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

    const onSubmit = async (data: FixingPeriodSubjectSchema) => {
        try {
            if (!(data as any).ttfpsU_SUbSelcFlag && !(data as any).ttrpsU_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                toast.warning('Please add at least one Class-Section details');
                return;
            }
            const res = await saveFixingPeriodSubject(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res?.message);
                reset();
                onSuccess();
            } else {
                toast.error(res?.message);
            }
        } catch (error : any) {
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-4 shadow-sm'>
                <FormField
                    control={form.control}
                    name='ttrpsU_Id'
                    render={({ field }) => <Input type='hidden' {...field} value={field.value || 0} />}
                />
                <FormField
                    control={form.control}
                    name='ttfpsU_Id'
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
                        name='ismS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleSubjectChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {subjectList
                                            .filter((item: any) => item.ismS_Id || item.isms_id)
                                            .map((item: any) => {
                                                const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                                return (
                                                    <SelectItem key={id} value={id?.toString()}>
                                                        {item.ismS_SubjectName || item.isms_subjectname || item.subjectName}
                                                    </SelectItem>
                                                );
                                            })}
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
                        name={'ttfpsU_SUbSelcFlag' as any}
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

                {ttfpsU_SUbSelcFlag && (
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
                                <FormLabel>Staff</FormLabel>
                                <Select
                                    key={selectedStaff?.toString() || 'empty'}
                                    onValueChange={(v) => setSelectedStaff(Number(v))}
                                    value={selectedStaff?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                    <SelectContent>
                                        {subStaffList.map((item: any) => {
                                            const id = item.hrmE_Id ?? item.hrme_id ?? item.HRME_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.staffName?.replace(/\n/g, ' ').trim()}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>No Of Days</FormLabel>
                                <Input type='number' value={nod} onChange={(e) => setNod(e.target.value)} />
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
