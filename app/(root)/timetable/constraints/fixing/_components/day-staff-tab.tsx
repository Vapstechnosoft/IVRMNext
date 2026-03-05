'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useDayStaffGridData } from '@/hooks/timetable/constraints/fixingData';
import { type FixingDayStaffSchema, fixingDayStaffSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassDropdown,
    getFixingClassSectionSubjectByStaff,
    getFixingDayStaffDetails,
    getFixingDayStaffGridData,
    getdetailsAllFixing,
    saveFixingDayStaff
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ToggleDayStaffForm from './DayStaffToggle';
import { dayStaffColumns } from './columns';
import { FixingViewModal } from './fixing-view-modal';

interface DayStaffTabProps {
    initialData: any;
    searchParams?: any;
}

function DayStaffTabContent({ initialData, searchParams }: DayStaffTabProps) {
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
    const academicList = Array.isArray(academicData) ? academicData : (academicData as any)?.data || [];

    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || initialData?.data?.daylist || []);
    const [staffList, setStaffList] = useState<any[]>(initialData?.stafflist || initialData?.data?.stafflist || []);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useDayStaffGridData(searchParams);

    const gridData = gridResponse
        ? (gridResponse as any)?.data || (gridResponse as any)?.fix_day_staff_list || (Array.isArray(gridResponse) ? gridResponse : [])
        : initialData?.data?.fix_day_staff_list || initialData?.fix_day_staff_list || [];

    const totalItems =
        (gridResponse as any)?.total ||
        (gridResponse as any)?.count ||
        (Array.isArray(gridResponse) ? gridResponse.length : initialData?.total || gridData.length);

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

        if (preferredKey) {
            const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
            const result = foundKey ? target[foundKey] : undefined;
            if (Array.isArray(result)) return result;
            // If preferred key fails, don't fall through to generic loop as it can pick the wrong list (e.g. class for section)
            return [];
        }

        const keys = [
            'academiclist',
            'categorylist',
            'catelist',
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

        const firstArray = Object.values(target).find((v) => Array.isArray(v));
        return Array.isArray(firstArray) ? (firstArray as any[]) : [];
    };

    // View Modal State
    const [viewDetails, setViewDetails] = useState<any[]>([]);
    const [isLoadingView, setIsLoadingView] = useState(false);

    const form = useForm<FixingDayStaffSchema>({
        resolver: zodResolver(fixingDayStaffSchema),
        defaultValues: {
            ttfdS_Id: 0,
            asmaY_Id: undefined,
            ttmD_Id: undefined,
            hrmE_Id: undefined,
            ttfdS_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const { reset, setValue, watch, handleSubmit, control } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttfdS_SUbSelcFlag = watch('ttfdS_SUbSelcFlag');


    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [nop, setNop] = useState<string>('');

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

                const [fixingData, gridRes] = await Promise.all([getdetailsAllFixing(), getFixingDayStaffGridData(searchParams)]);

                if (fixingData?.data) {
                    setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                    setStaffList(filterData(fixingData.data.stafflist || [], 'staffName'));
                }

                await refetchAll();
            } catch (error) {
                console.error('Failed to load dropdowns:', error);
                toast.error('Failed to load dropdown options');
            }
        };
        loadDropdowns();
    }, []);

    // Effect to populate form on Edit
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            onEdit(selectedRow);
        }
    }, [isEditFormOpen, selectedRow]);

    // Effect to handle Toggle (Active/Deactivate)
    // useEffect(() => {
    //     if (isToggleFormOpen && selectedRow) {
    //         onToggle(selectedRow);
    //         closeToggleForm();
    //     }
    // }, [isToggleFormOpen, selectedRow]);

    // Effect to handle View
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
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);

        const currentStaffId = form.getValues('hrmE_Id');
        if (yearId && currentStaffId) {
            handleStaffChange(currentStaffId, yearId);
        }

        // Fetch categories when year changes is already handled by main effect or can be removed if strictly only once
        // Removing local override as per user request to keep list "clear" and only from one source
    };

    // If masterClasses don't have category link, or filter yields nothing,
    // fallback to server fetch for this category or keep current list

    const handleClassChange = async (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);

        // Filter sections from master list by class
        const filtered = masterSections.filter(
            (s) =>
                (s.asmcL_Id !== undefined && Number(s.asmcL_Id) === classId) ||
                (s.asmcl_id !== undefined && Number(s.asmcl_id) === classId) ||
                (s.ASMCL_Id !== undefined && Number(s.ASMCL_Id) === classId)
        );

        setSectionList(filterData(filtered.length > 0 ? filtered : masterSections, 'asmC_SectionName'));
        setSubSubjectList([]);
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);

        // Filter subjects from master list by section
        const filtered = masterSubjects.filter(
            (sub) =>
                (sub.asmS_Id !== undefined && Number(sub.asmS_Id) === sectionId) ||
                (sub.asms_id !== undefined && Number(sub.asms_id) === sectionId) ||
                (sub.ASMS_Id !== undefined && Number(sub.ASMS_Id) === sectionId)
        );

        if (filtered.length > 0) {
            setSubSubjectList(filterData(filtered, 'ismS_SubjectName'));
        } else {
            // If local filter is missing link, show staff's full subject list as it's specifically for them
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
                console.log(`Fetching assignments for Year: ${effectiveYearId}, Staff: ${staffId}`);
                const res = await getFixingClassSectionSubjectByStaff(effectiveYearId, staffId);
                console.log('DayStaff - get_cls_sec_subsData response:', res);

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

                    const cats =
                        extractList(res, 'categorylist').length > 0 ? extractList(res, 'categorylist') : extractList(res, 'catelist');


                    setMasterClasses(classes);
                    setMasterSections(sections);
                    setMasterSubjects(subjects);

                    // Populate lists directly for Day Staff as per user request (dropdowns should come on staff change)
                    if (classes && classes.length > 0) {
                        setClassList(filterData(classes, 'asmcL_ClassName'));
                    }
                    if (sections && sections.length > 0) {
                        setSectionList(filterData(sections, 'asmC_SectionName'));
                    }
                    if (subjects && subjects.length > 0) {
                        setSubSubjectList(filterData(subjects, 'ismS_SubjectName'));
                    }

                    // Category list updates removed as per user request to keep it "clear" from getCategoryDropDown only
                } else {
                    console.warn('API returned unsuccessful status:', res);
                }
            } catch (e) {
                console.error('Error fetching assignments:', e);
                toast.error('Failed to load details for selected staff');
            }
        } else {
            console.warn('Missing yearId or staffId for assignment fetch:', { effectiveYearId, staffId });
        }
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nop) {
            toast.warning('Please select all fields');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const subObj = subSubjectList.find((s) => s.ismS_Id === selectedSubject);

        // Check duplicate
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
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName,
            subDisplay: subObj?.ismS_SubjectName || subObj?.subjectName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'nop', header: 'No Of Periods' }
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

    // View Columns (No Actions)
    const viewColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'NOP', header: 'No Of Periods' }
        ],
        []
    );

    const onEdit = async (item: any) => {
        try {
            const res = await getFixingDayStaffDetails(item.ttfdS_Id);
            if (res?.fix_day_staff_edit && (res.fix_day_staff_edit as any[]).length > 0) {
                const d = (res.fix_day_staff_edit as any[])[0];

                reset({
                    ttfdS_Id: d.ttfdS_Id,
                    asmaY_Id: d.asmaY_Id,
                    ttmD_Id: d.ttmD_Id,
                    hrmE_Id: d.hrmE_Id,
                    ttfdS_SUbSelcFlag: d.ttfdS_SUbSelcFlag,
                    tempararyArrayList: []
                });

                if (d.ttfdS_SUbSelcFlag && res.fix_day_staff__classecedit) {
                    (res.fix_day_staff__classecedit as any[]).forEach((sub: any) => {
                        append({
                            asmcL_Id: sub.asmcL_Id,
                            asmS_Id: sub.asmS_Id,
                            ismS_Id: sub.ismS_Id,
                            nop: sub.ttfdscC_Periods || sub.ttscC_Periods,
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
            const res = await getFixingDayStaffDetails(item.ttfdS_Id);
            if (res?.fix_day_staff__classecedit) {
                const details = (res.fix_day_staff__classecedit as any[]).map((sub: any) => ({
                    clsDisplay: sub.asmcL_ClassName,
                    sectDisplay: sub.asmC_SectionName,
                    subDisplay: sub.ismS_SubjectName,
                    nop: sub.ttfdscC_Periods || sub.ttscC_Periods
                }));
                setViewDetails(details);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingView(false);
        }
    };

    // const onToggle = async (item: any) => {
    //     try {
    //         const payload = { TTFDS_Id: item.ttfdS_Id, TTFDS_ActiveFlag: !item.ttfdS_ActiveFlag };
    //         const res = await deactivateFixingDayStaff(payload);
    //         if (res?.returnval === true) {
    //             toast.success('Status Updated');
    //             window.location.reload();
    //         } else {
    //             toast.error('Failed to update status');
    //         }
    //     } catch (e) {
    //         console.error(e);
    //     }
    // };

    const onSubmit = async (data: FixingDayStaffSchema) => {
        try {
            if (!data.ttfdS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else {
                if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                    return;
                }
            }

            const res = await saveFixingDayStaff(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res?.message);
                refetchAll();
                closeAddForm();
                closeEditForm();
                reset();
            } else {
                toast.error(res?.message);
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
                    Add Day Staff Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Day Staff Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={dayStaffColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <ToggleDayStaffForm rowData={selectedRow as any} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Day Staff Constraint' : 'Add New Day Staff Constraint'}
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
                                                        {academicList
                                                            .filter((item: any) => item.asmaY_Id)
                                                            .map((item: any, idx: number) => (
                                                                <SelectItem
                                                                    key={item.asmaY_Id || `acad-${idx}`}
                                                                    value={item.asmaY_Id.toString()}>
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
                                        name='ttmD_Id'
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Day</FormLabel>
                                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {dayList.map((item: any, idx: number) => (
                                                            <SelectItem key={item.ttmD_Id || `day-${idx}`} value={item.ttmD_Id.toString()}>
                                                                {item.ttmD_DayName}
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
                                                        {staffList
                                                            .filter((item: any) => item.hrmE_Id)
                                                            .map((item: any, idx: number) => (
                                                                <SelectItem
                                                                    key={item.hrmE_Id || `staff-${idx}`}
                                                                    value={item.hrmE_Id.toString()}>
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
                                        name='ttfdS_SUbSelcFlag'
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

                                {ttfdS_SUbSelcFlag && (
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
                                                            classList.map((item: any, idx: number) => {
                                                                const id = item.asmcL_Id ?? item.asmcl_id ?? item.ASMCL_Id;
                                                                const name =
                                                                    item.asmcL_ClassName ??
                                                                    item.asmcl_classname ??
                                                                    item.ASMCL_ClassName ??
                                                                    item.className ??
                                                                    item.asmcL_Classname ??
                                                                    '';
                                                                return (
                                                                    <SelectItem key={id || `cls-${idx}`} value={id?.toString()}>
                                                                        {name}
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
                                                        {sectionList.map((item: any, idx: number) => {
                                                            const id = item.asmS_Id ?? item.asms_id ?? item.ASMS_Id;
                                                            const name =
                                                                item.asmC_SectionName ??
                                                                item.asmc_sectionname ??
                                                                item.asmS_SectionName ??
                                                                item.asms_sectionname ??
                                                                item.asmC_Sectionname ??
                                                                item.sectionName ??
                                                                '';
                                                            return (
                                                                <SelectItem key={id || `sec-${idx}`} value={id?.toString()}>
                                                                    {name}
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
                                                        {subSubjectList.map((item: any, idx: number) => {
                                                            const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                                            const name =
                                                                item.ismS_SubjectName ??
                                                                item.isms_subjectname ??
                                                                item.ISMS_SubjectName ??
                                                                item.subjectName ??
                                                                '';
                                                            return (
                                                                <SelectItem key={id || `sub-${idx}`} value={id?.toString()}>
                                                                    {name}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <FormLabel>Periods</FormLabel>
                                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} />
                                            </div>
                                        </div>
                                        <Button type='button' onClick={addToGrid}>
                                            Add
                                        </Button>

                                        {fields.length > 0 && <DataTable data={fields} columns={subColumns} totalItems={fields.length} />}
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

export default function DayStaffTab({ initialData, searchParams }: DayStaffTabProps) {
    return (
        <FormProvider>
            <DayStaffTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}
