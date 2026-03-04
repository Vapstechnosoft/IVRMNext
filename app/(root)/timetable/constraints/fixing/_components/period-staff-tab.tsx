'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { usePeriodStaffGridData } from '@/hooks/timetable/constraints/fixingData';
import { type FixingPeriodStaffSchema, fixingPeriodStaffSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassDropdown,
    getFixingClassSectionSubjectByStaff,
    getFixingPeriodStaffDetails,
    getdetailsAllFixing,
    saveFixingPeriodStaff
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import TogglePeriodStaffForm from './PeriodStaffToggle';
import { periodStaffColumns } from './columns';
import { FixingViewModal } from './fixing-view-modal';

interface PeriodStaffTabProps {
    initialData: any;
    searchParams?: any;
}

function PeriodStaffTabContent({ initialData, searchParams }: PeriodStaffTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        selectedRow,
        closeToggleForm,
        isToggleFormOpen,
        isDetailsViewOpen,
        selectedRow: viewRow,
        closeDetailsView
    } = useFormContext();

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = usePeriodStaffGridData(searchParams);

    const getGridData = (res: any, fallback: any) => {
        if (!res) return fallback || [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.fix_period_staff_list) return res.fix_period_staff_list;

        // Find the first array property in the response if exact name doesn't match
        const arrayProp = Object.values(res).find((val) => Array.isArray(val));
        if (arrayProp) return arrayProp;

        return fallback || [];
    };

    const gridData = getGridData(gridResponse, initialData?.fix_period_staff_list);

    const totalItems =
        (gridResponse as any)?.total ||
        (gridResponse as any)?.count ||
        (Array.isArray(gridResponse) ? gridResponse.length : initialData?.total || gridData.length);

    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || []);
    const [periodList, setPeriodList] = useState<any[]>(initialData?.periodlist || []);
    const [staffList, setStaffList] = useState<any[]>(initialData?.stafflist || []);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subSubjectList, setSubSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    // Master lists for the selected staff member
    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterSubjects, setMasterSubjects] = useState<any[]>([]);

    const extractList = (data: any, preferredKey?: string) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;

        // Handle ApiResponse wrapper or double-nested data
        let target = data?.data !== undefined ? data.data : data;
        if (target && !Array.isArray(target) && typeof target === 'object' && target.data !== undefined) {
            target = target.data;
        }

        if (Array.isArray(target)) return target;
        if (!target || typeof target !== 'object') return [];

        // 1. Precise match (case-insensitive) for the requested key
        if (preferredKey) {
            const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
            const result = foundKey ? target[foundKey] : undefined;
            if (Array.isArray(result)) return result;
        }

        // 2. Fallback to common key names
        const keys = [
            'academiclist',
            'catelist',
            'categorylist',
            'categorylistbystaff',
            'classlist',
            'clssbystaff',
            'clsbystaff',
            'sectionlist',
            'secsbystaff',
            'sectionlistbystaff',
            'subjectlist',
            'subsbystaff',
            'subjectlistbystaff',
            'subsbyall',
            'stafflist',
            'staffbyall',
            'subjectbystaff',
            'sectionbyclass',
            'classbycategory'
        ];

        for (const key of keys) {
            const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
            const result = foundKey ? target[foundKey] : undefined;
            if (Array.isArray(result)) return result;
        }

        // 3. Last resort: first array property found
        const firstArray = Object.values(target).find((v) => Array.isArray(v));
        return Array.isArray(firstArray) ? (firstArray as any[]) : [];
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

    const [viewDetails, setViewDetails] = useState<any[]>([]);
    const [isLoadingView, setIsLoadingView] = useState(false);

    const form = useForm<FixingPeriodStaffSchema>({
        resolver: zodResolver(fixingPeriodStaffSchema),
        defaultValues: {
            ttfpS_Id: 0,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            hrmE_Id: undefined,
            ttfpS_SUbSelcFlag: false,
            ttfpscC_Id: 0,
            tempararyArrayList: []
        }
    });

    const { reset, setValue, watch, control, handleSubmit } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttmP_Id = watch('ttmP_Id');
    const hrmE_Id = watch('hrmE_Id');
    const ttfpS_SUbSelcFlag = watch('ttfpS_SUbSelcFlag');

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [nod, setNod] = useState<string>('');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const filterData = (list: any[], key: string) => {
        return (list || []).filter((item: any) => {
            if (!item) return false;
            // Case-insensitive key lookup
            const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
            const val = actualKey ? item[actualKey] : undefined;
            if (val === undefined || val === null) return false;
            if (typeof val !== 'string') return !!val;
            const name = val.trim();
            return name && name.toLowerCase() !== 'test';
        });
    };

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const fixingData = await getdetailsAllFixing();
                if (fixingData?.data) {
                    setDayList(uniqueById(filterData(fixingData.data.daylist || [], 'ttmD_DayName'), 'ttmD_Id'));
                    setPeriodList(uniqueById(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'), 'ttmP_Id'));
                    setStaffList(uniqueById(filterData(fixingData.data.stafflist || [], 'staffName'), 'hrmE_Id'));
                }
                await refetchAll();
            } catch (error) {
                console.error('Failed to load dropdowns:', error);
                toast.error('Failed to load dropdown options');
            }
        };
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            onEdit(selectedRow);
        }
    }, [isEditFormOpen, selectedRow]); // Effect to handle View
    useEffect(() => {
        if (isDetailsViewOpen && viewRow) {
            onView(viewRow);
        }
    }, [isDetailsViewOpen, viewRow]);



    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        // setClassList([]);
        // setSectionList([]);
        // setSubSubjectList([]);

        const currentStaffId = form.getValues('hrmE_Id');
        if (yearId && currentStaffId) {
            handleStaffChange(currentStaffId, yearId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);

        const filtered = masterSections.filter((s) => Number(s.asmcL_Id ?? s.asmcl_id ?? s.ASMCL_Id) === classId);

        // setSubSubjectList([]);
    };
    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);

        const filtered = masterSubjects.filter((sub) => Number(sub.asmS_Id ?? sub.asms_id ?? sub.ASMS_Id) === sectionId);
    };

    const handleStaffChange = async (staffId: number, yearId?: number) => {
        setValue('hrmE_Id', staffId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        // setClassList([]);
        // setSectionList([]);
        // setSubSubjectList([]);

        const effectiveYearId = yearId ?? form.getValues('asmaY_Id');

        if (effectiveYearId && staffId) {
            try {
                const res = await getFixingClassSectionSubjectByStaff(effectiveYearId, staffId);

                console.log('response details', res);
                if (res && (res.success || res.success === undefined)) {
                    const classes =
                        extractList(res, 'clsbystaff').length > 0 ? extractList(res, 'clsbystaff') : extractList(res, 'classlist');

                    const sections =
                        extractList(res, 'secsbystaff').length > 0 ? extractList(res, 'secsbystaff') : extractList(res, 'sectionlist');

                    const subjects =
                        extractList(res, 'subsbystaff').length > 0 ? extractList(res, 'subsbystaff') : extractList(res, 'subjectlist');

                    setMasterClasses(classes);
                    setMasterSections(sections);
                    setMasterSubjects(subjects);

                    setClassList(uniqueById(classes, 'asmcL_Id'));
                    setSectionList(uniqueById(sections, 'asmS_Id'));
                    setSubSubjectList(uniqueById(subjects, 'ismS_Id'));
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load details for selected staff');
            }
        }
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nod) {
            toast.warning('Please select all fields and ensure Staff is selected in main form for Subject fetch');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const subObj = subSubjectList.find((s) => s.ismS_Id === selectedSubject);

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
            nod: Number(nod),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName,
            subDisplay: subObj?.ismS_SubjectName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'nod', header: 'No Of Days' }
            // {
            //     id: 'actions',
            //     header: 'Actions',
            //     // cell: ({ row }) => (
            //     //     <Button type='button' variant='ghost' size='sm' onClick={() => remove(row.index)}>
            //     //         <span className='text-red-500'>Delete</span>
            //     //     </Button>
            //     // )
            // }
        ],
        [remove]
    );

    const viewColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'nod', header: 'No Of Days' }
        ],
        []
    );

    const onEdit = async (item: any) => {
        try {
            const res = await getFixingPeriodStaffDetails(item.ttfpS_Id);
            if (res?.fix_period_staff_edit && (res.fix_period_staff_edit as any[]).length > 0) {
                const d = (res.fix_period_staff_edit as any[])[0];
                reset({
                    ttfpS_Id: d.ttfpS_Id,
                    asmaY_Id: d.asmaY_Id,
                    ttmP_Id: d.ttmP_Id,
                    hrmE_Id: d.hrmE_Id,
                    ttfpS_SUbSelcFlag: d.ttfpS_SUbSelcFlag,
                    ttfpscC_Id: d.ttfpscC_Id || 0,
                    tempararyArrayList: []
                });
                if (d.ttfpS_SUbSelcFlag && res.fix_period_staff__classecedit) {
                    (res.fix_period_staff__classecedit as any[]).forEach((sub: any) => {
                        append({
                            asmcL_Id: sub.asmcL_Id,
                            asmS_Id: sub.asmS_Id,
                            ismS_Id: sub.ismS_Id,
                            nod: sub.ttfpscC_Days,
                            clsDisplay: sub.asmcL_ClassName,
                            sectDisplay: sub.asmC_SectionName,
                            subDisplay: sub.ismS_SubjectName
                        });
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onView = async (item: any) => {
        try {
            setIsLoadingView(true);
            setViewDetails([]);
            const res = await getFixingPeriodStaffDetails(item.ttfpS_Id);
            if (res?.fix_period_staff__classecedit) {
                const details = (res.fix_period_staff__classecedit as any[]).map((sub: any) => ({
                    clsDisplay: sub.asmcL_ClassName,
                    sectDisplay: sub.asmC_SectionName,
                    subDisplay: sub.ismS_SubjectName,
                    nod: sub.ttfpscC_Days
                }));
                setViewDetails(details);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingView(false);
        }
    };

    const onSubmit = async (data: FixingPeriodStaffSchema) => {
        try {
            if (!data.ttfpS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                toast.warning('Please add at least one Class-Section details');
                return;
            }
            const res = await saveFixingPeriodStaff(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res?.message || 'Record Saved Successfully');
                refetchAll();
                closeAddForm();
                closeEditForm();
                reset();
            } else {
                toast.error(res?.message || 'Failed to save');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Period Staff Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Period Staff Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={periodStaffColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <TogglePeriodStaffForm rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Period Staff Constraint' : 'Add New Period Staff Constraint'}
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={isEditFormOpen ? closeEditForm : closeAddForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>

                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-4 shadow-sm'>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <FormField
                                        control={form.control}
                                        name='asmaY_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Academic Year</FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleAcademicYearChange(Number(v))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <Select onValueChange={(v) => handleStaffChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                    onValueChange={(v) => handleClassChange(Number(v))}
                                                    value={selectedClass?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
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
                                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                                    value={selectedSection?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
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
                                                    onValueChange={(v) => setSelectedSubject(Number(v))}
                                                    value={selectedSubject?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
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
                                                <Input type='number' value={nod} onChange={(e) => setNod(e.target.value)} />
                                            </div>
                                        </div>
                                        <Button type='button' onClick={addToGrid}>
                                            Add
                                        </Button>
                                        {fields.length > 0 && (
                                            <GenericDataTable
                                                data={fields}
                                                columns={subColumns}
                                                totalItems={fields.length}
                                                isLoading={false}
                                            />
                                        )}
                                    </div>
                                )}
                                <div className='flex justify-end gap-2'>
                                    <Button type='button' variant='outline' onClick={() => reset()}>
                                        Cancel
                                    </Button>
                                    <Button type='submit'>Save</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CollapsibleSection>
            )}
            <FixingViewModal
                isOpen={!!isDetailsViewOpen}
                onClose={closeDetailsView}
                title='Class-Section Wise Details'
                data={viewDetails}
                columns={viewColumns}
                isLoading={isLoadingView}
            />
        </div>
    );
}

export default function PeriodStaffTab({ initialData, searchParams }: PeriodStaffTabProps) {
    return (
        <FormProvider>
            <PeriodStaffTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}
