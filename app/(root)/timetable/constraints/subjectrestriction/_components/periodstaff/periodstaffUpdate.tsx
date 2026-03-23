'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayStaffSchema, dayStaffSchema, daySubjectSchema, DaySubjectSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getFixingClassSectionSubjectByStaff } from '@/server/timetable/constraints/fixing';
import { getPeriodStaffEditDetails, savePeriodStaffDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from '../../../fixing/_components/dayperiod/utils';
// import { extractList, filterData } from '../dayperiod/utils';

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

    const form = useForm<DayStaffSchema>({
        resolver: zodResolver(dayStaffSchema),
        defaultValues: {
            ttrpS_Id: 0,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            hrmE_Id: undefined,
            ttrpS_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const { setValue, watch, handleSubmit, formState: { isSubmitting }, control, reset } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttrpS_SUbSelcFlag = watch('ttrpS_SUbSelcFlag');

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    useEffect(() => {
        const loadEditData = async () => {
            if (!selectedRow) return;

            try {
                const id = selectedRow?.ttrpS_Id || selectedRow?.TTRPS_Id || selectedRow?.ttfdS_Id;
                if (!id) return;

                const res = await getPeriodStaffEditDetails(id);
                // Be more resilient with response structure
                const responseData = res?.data || res;

                const editData = responseData?.restrict_period_staff_edit ||
                    responseData?.restriction_period_staff_edit ||
                    responseData?.restrict_day_period_staff_edit ||
                    responseData?.restrict_period_staff ||
                    responseData?.periodstafflist ||
                    (Array.isArray(responseData) ? responseData : undefined);

                const subDetails = responseData?.restrict_period_staff_classedit ||
                    responseData?.restriction_period_staff_class_edit ||
                    responseData?.restrict_day_period_staff_classedit ||
                    responseData?.periodstaff__classecedit ||
                    responseData?.data?.restrict_period_staff_classedit || [];

                if (!editData || !Array.isArray(editData) || editData.length === 0) return;

                const main = editData[0];

                reset({
                    ttrpS_Id: main.ttrpS_Id || main.TTRPS_Id,
                    asmaY_Id: main.asmaY_Id || main.ASMAY_Id,
                    ttmP_Id: main.ttmP_Id || main.TTMP_Id,
                    hrmE_Id: main.hrmE_Id || main.HRME_Id,
                    ttrpS_SUbSelcFlag: !!main.ttrpS_SUbSelcFlag || !!main.ttrpS_SubSelcFlag || !!main.TTRPS_SUbSelcFlag,
                    tempararyArrayList: []
                });

                let masterData = { classes: [] as any[], sections: [] as any[], subjects: [] as any[] };
                if (main.hrmE_Id || main.HRME_Id) {
                    masterData = await handleStaffChange(main.hrmE_Id || main.HRME_Id, main.asmaY_Id || main.ASMAY_Id);
                }

                if (subDetails && Array.isArray(subDetails)) {
                    replace(
                        subDetails.map((sub: any) => {
                            const cid = sub.asmcL_Id || sub.ASMCL_Id || sub.asmcl_id;
                            const sid = sub.asmS_Id || sub.ASMS_Id || sub.asms_id;
                            const isid = sub.ismS_Id || sub.ISMS_Id || sub.isms_id || sub.ismS_id;

                            // Lookup names if missing from sub object
                            const clsName = sub.asmcL_ClassName || sub.ASMCL_ClassName ||
                                masterData.classes.find(c => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.asmcL_ClassName ||
                                masterData.classes.find(c => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.className || '';

                            const sectName = sub.asmC_SectionName || sub.ASMC_SectionName || sub.asmS_SectionName ||
                                masterData.sections.find(s => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmC_SectionName ||
                                masterData.sections.find(s => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmS_SectionName ||
                                masterData.sections.find(s => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.sectionName || '';

                            const subName = sub.ismS_SubjectName || sub.ISMS_SubjectName ||
                                masterData.subjects.find(s => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.ismS_SubjectName ||
                                masterData.subjects.find(s => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.subjectName ||
                                masterData.subjects.find(s => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.ismS_SubjectCode || '';

                            console.log("Sub object from API:", sub);
                            const nopKey = Object.keys(sub).find(k =>
                                k.toLowerCase().includes('period') ||
                                k.toLowerCase() === 'days' ||
                                k.toLowerCase() === 'nop' ||
                                k.toLowerCase() === 'nod'
                            );
                            const nopValue = nopKey ? sub[nopKey] : 0;
                            console.log("Resolved NOP property key:", nopKey, "value:", nopValue);

                            return {
                                ttrpscC_Id: sub.ttrpscC_Id || sub.TTRPSCC_Id || sub.ttfdscC_Id || sub.TTFDSCC_Id,
                                asmcL_Id: cid,
                                asmS_Id: sid,
                                ismS_Id: isid,
                                nop: Number(sub.ttrpscC_Days ?? sub.TTRPSCC_Days ?? sub.ttfdscC_Periods ?? sub.nop ?? sub.nod ?? 0) || 0,
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
    }, [selectedRow]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);

        const currentStaffId = form.getValues('hrmE_Id');
        if (yearId && currentStaffId) {
            handleStaffChange(currentStaffId, yearId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);

        const filtered = masterSections.filter(
            (s) =>
                (s.asmcL_Id !== undefined && Number(s.asmcL_Id) === classId)
        );

        setSectionList(filterData(filtered.length > 0 ? filtered : masterSections, 'asmC_SectionName'));
        setSubSubjectList([]);
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);

        const filtered = masterSubjects.filter(
            (sub) =>
                (sub.asmS_Id !== undefined && Number(sub.asmS_Id) === sectionId)
        );

        if (filtered.length > 0) {
            setSubSubjectList(filterData(filtered, 'ismS_SubjectName'));
        } else {
            setSubSubjectList(filterData(masterSubjects, 'ismS_SubjectName'));
        }
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
                if (res && (res.success || res.success === undefined)) {
                    const classes =
                        extractList(res, 'classlist').length > 0
                            ? extractList(res, 'classlist')
                            : extractList(res, 'clssbystaff').length > 0
                                ? extractList(res, 'clssbystaff')
                                : extractList(res, 'clsbystaff');

                    const sections =
                        extractList(res, 'sectionlist').length > 0
                            ? extractList(res, 'sectionlist')
                            : extractList(res, 'secsbystaff').length > 0
                                ? extractList(res, 'secsbystaff')
                                : extractList(res, 'sectionlistbystaff');

                    const subjects =
                        extractList(res, 'subjectlist').length > 0
                            ? extractList(res, 'subjectlist')
                            : extractList(res, 'subsbystaff').length > 0
                                ? extractList(res, 'subsbystaff')
                                : extractList(res, 'subjectlistbystaff');

                    setMasterClasses(classes);
                    setMasterSections(sections);
                    setMasterSubjects(subjects);

                    if (classes && classes.length > 0) {
                        setClassList(filterData(classes, 'asmcL_ClassName'));
                    }
                    if (sections && sections.length > 0) {
                        setSectionList(filterData(sections, 'asmC_SectionName'));
                    }
                    if (subjects && subjects.length > 0) {
                        setSubSubjectList(filterData(subjects, 'ismS_SubjectName'));
                    }
                    return { classes, sections, subjects };
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load details for selected staff');
            }
        }
        return { classes: [], sections: [], subjects: [] };
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nop) {
            toast.warning('Please select all fields');
            return;
        }

        // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
        if (isNaN(Number(nop))) {
            toast.warning('Enter valid number');
            return;
        }

        const exists = fields.some(
            (f: any) =>
                f.asmcL_Id === selectedClass &&
                f.asmS_Id === selectedSection &&
                f.ismS_Id === selectedSubject
        );

        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const subObj = subSubjectList.find((s) => s.ismS_Id === selectedSubject);

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            ismS_Id: selectedSubject,
            nop: Number(nop) || 0,
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName,
            subDisplay: subObj?.ismS_SubjectName
        });

        setNop('');
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

    const onSubmit = async (data: DayStaffSchema) => {
        try {
            if (!data.ttrpS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                toast.warning('Please add at least one Class-Section details');
                return;
            }
            const res = await savePeriodStaffDetail(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res.message );
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
                    name='ttrpS_Id'
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
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        handleAcademicYearChange(Number(v));
                                    }}
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
                                <Select key={field.value?.toString() || 'empty'} onValueChange={(v) => { field.onChange(Number(v)); handleStaffChange(Number(v)); }} value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {staffList?.map((item: any) => {
                                            const id = item.hrmE_Id ?? item.hrme_id ?? item.HRME_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.staffName || item.hrmE_EmployeeFirstName || item.employeeName}
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
                        name='ttrpS_SUbSelcFlag'
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

                {ttrpS_SUbSelcFlag && (
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
                                                        {item.asmcL_ClassName}
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
                                    onValueChange={(v) => setSelectedSubject(Number(v))}
                                    value={selectedSubject?.toString()}>
                                    <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                                    <SelectContent>
                                        {subSubjectList.map((item: any) => {
                                            const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ismS_SubjectName}
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
