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
import { useDaySubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { type FixingDaySubjectSchema, fixingDaySubjectSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassDropdown,
    getFixingClassSectionStaffsBySubject,
    getFixingDaySubjectDetails,
    getdetailsAllFixing,
    saveFixingDaySubject
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ToggleDaySubjectForm from './DaysSubjectToggle';
import { daySubjectColumns } from './columns';
import { FixingViewModal } from './fixing-view-modal';

interface DaySubjectTabProps {
    initialData: any;
    searchParams?: any;
}

function DaySubjectTabContent({ initialData, searchParams }: DaySubjectTabProps) {
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

    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || []);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useDaySubjectGridData(searchParams);

    const getGridData = (res: any, fallback: any) => {
        if (!res) return fallback || [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.fix_day_subject_list) return res.fix_day_subject_list;

        // Find the first array property in the response if exact name doesn't match
        const arrayProp = Object.values(res).find((val) => Array.isArray(val));
        if (arrayProp) return arrayProp;

        return fallback || [];
    };

    const gridData = getGridData(gridResponse, initialData?.fix_day_subject_list);

    const totalItems = (gridResponse as any)?.total || (gridResponse as any)?.count || gridData.length;

    // const [classList, setClassList] = useState<any[]>([]);
    // const [sectionList, setSectionList] = useState<any[]>([]);
    // const [subStaffList, setSubStaffList] = useState<any[]>([]);
    // const [categoryList, setCategoryList] = useState<any[]>(initialData?.categorylist || []);
    // const [isClassLoading, setIsClassLoading] = useState(false);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subStaffList, setSubStaffList] = useState<any[]>([]);
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    // Master lists for the selected subject
    const [masterCategories, setMasterCategories] = useState<any[]>([]);
    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaff, setMasterStaff] = useState<any[]>([]);

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
            'classlist',
            'clsbysubject',
            'clssbysub',
            'sectionlist',
            'sectbysubject',
            'secsbysub',
            'stafflist',
            'staffbysubject',
            'staffbysub',
            'staffbyall',
            'subjectlist',
            'classbycategory',
            'sectionbyclass',
            'subjectbystaff'
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

    const form = useForm<FixingDaySubjectSchema>({
        resolver: zodResolver(fixingDaySubjectSchema),
        defaultValues: {
            ttfdsU_Id: 0,
            asmaY_Id: undefined,
            ttmD_Id: undefined,
            ismS_Id: undefined,
            ttfdsU_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const { reset, setValue, watch, handleSubmit, control } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttfdsU_SUbSelcFlag = watch('ttfdsU_SUbSelcFlag');

    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedStaff, setSelectedStaff] = useState<number | undefined>();
    const [nop, setNop] = useState<string>('');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const filterData = (list: any[], key: string) => {
        return (list || []).filter((item: any) => {
            if (!item) return false;
            const val = item[key] ?? item[Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase()) || ''];
            if (!val) return true; // Keep items even if key is missing, unless explicitly "test"
            if (typeof val !== 'string') return !!val;
            const name = val.trim();
            return name && name.toLowerCase() !== 'test';
        });
    };

    // Removal of handleStaffChange as it belongs to DayStaff tab and contains errors here.

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setCategoryList(
                    uniqueById(
                        filterData(initialData?.categorylist || initialData?.data?.categorylist || [], 'ttmC_CategoryName'),
                        'ttmC_Id'
                    )
                );
                const fixingData = await getdetailsAllFixing();
                if (fixingData?.data) {
                    setDayList(uniqueById(filterData(fixingData.data.daylist || [], 'ttmD_DayName'), 'ttmD_Id'));
                    setSubjectList(uniqueById(filterData(fixingData.data.subjectlist || [], 'ismS_SubjectName'), 'ismS_Id'));
                }
                if (asmaY_Id && selectedCategory) {
                    await fetchClasses(asmaY_Id, selectedCategory);
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
    }, [isEditFormOpen, selectedRow]);
    // Effect to handle View
    useEffect(() => {
        if (isDetailsViewOpen && viewRow) {
            onView(viewRow);
        }
    }, [isDetailsViewOpen, viewRow]);

    const fetchClasses = async (yearId: number, categoryId: number) => {
        if (!yearId || !categoryId) {
            setClassList([]);
            return;
        }
        setIsClassLoading(true);
        try {
            const data = await getFixingClassDropdown(yearId, categoryId);
            const list = extractList(data, 'classbycategory');
            setClassList(filterData(list || [], 'asmcL_ClassName'));
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setIsClassLoading(false);
        }
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedCategory(undefined);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setSelectedCategory(categoryId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        //  setSelectedStaff(undefined);

        // Filter classes from master list by category
        const filtered = masterClasses.filter(
            (c) =>
                (c.ttmC_Id !== undefined && Number(c.ttmC_Id) === categoryId) ||
                (c.ttmc_id !== undefined && Number(c.ttmc_id) === categoryId) ||
                (c.TTMC_Id !== undefined && Number(c.TTMC_Id) === categoryId)
        );

        if (filtered.length > 0) {
            setClassList(uniqueById(filterData(filtered, 'asmcL_ClassName'), 'asmcL_Id'));
        } else {
            // If filtering fails (no link), show all classes for this subject to keep data visible
            setClassList(uniqueById(filterData(masterClasses, 'asmcL_ClassName'), 'asmcL_Id'));

            // Or fetch from server as fallback
            if (asmaY_Id) {
                try {
                    const data = await getFixingClassDropdown(asmaY_Id, categoryId);
                    const list = extractList(data, 'classlist');
                    if (list && list.length > 0) {
                        setClassList(uniqueById(filterData(list, 'asmcL_ClassName'), 'asmcL_Id'));
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // setSectionList([]);
        //  setSubStaffList([]);

        console.log(masterStaff, 'masterStaffdata after category change');
    };

    // console.log(masterClasses, 'masterClasses');
    // const handleClassChange = async (classId: number) => {
    //     setSelectedClass(classId);
    //     setSelectedSection(undefined);
    //     setSelectedStaff(undefined);

    //     // Filter sections from master list by class
    //     const filtered = masterSections.filter(
    //         (s) =>
    //             (s.asmcL_Id !== undefined && Number(s.asmcL_Id) === classId) ||
    //             (s.asmcl_id !== undefined && Number(s.asmcl_id) === classId) ||
    //             (s.ASMCL_Id !== undefined && Number(s.ASMCL_Id) === classId)
    //     );

    //     const listToUse = filtered.length > 0 ? filtered : masterSections;
    //     setSectionList(uniqueById(filterData(listToUse, 'asmC_SectionName'), 'asmS_Id'));

    //     setSubStaffList([]);
    // };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
    };
    console.log(masterSections, 'mastersections');
    // const handleSectionChange = async (sectionId: number) => {
    //     setSelectedSection(sectionId);
    //     setSelectedStaff(undefined);

    //     // Filter staff from master list by section
    //     const filtered = masterStaff.filter(
    //         (st) =>
    //             (st.asmS_Id !== undefined && Number(st.asmS_Id) === sectionId) ||
    //             (st.asms_id !== undefined && Number(st.asms_id) === sectionId) ||
    //             (st.asmS_id !== undefined && Number(st.asmS_id) === sectionId) ||
    //             (st.ASMS_Id !== undefined && Number(st.ASMS_Id) === sectionId)
    //     );

    //     const listToUse = filtered.length > 0 ? filtered : masterStaff;
    //     setSubStaffList(uniqueById(filterData(listToUse, 'staffName'), 'hrmE_Id'));
    // };
    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
    };

    console.log(subStaffList, 'subStaffList');
    // const handleSubjectChange = async (subjectId: number) => {
    //     setValue('ismS_Id', subjectId);
    //     setSelectedCategory(undefined);
    //     setSelectedClass(undefined);
    //     setSelectedSection(undefined);
    //     setSelectedStaff(undefined);
    //     setClassList([]);
    //     setSectionList([]);
    //     setSubStaffList([]);

    //     if (asmaY_Id && subjectId) {
    //         try {
    //             const res = await getFixingClassSectionStaffsBySubject(asmaY_Id, subjectId);
    //             console.log('DaySubject - get_cls_sec_staffsData response:', res);

    //             if (res) {
    //                 const cats = extractList(res, 'categorylist').length > 0 ? extractList(res, 'categorylist') : extractList(res, 'catelist');

    //                 const classes = extractList(res, 'classlist').length > 0
    //                     ? extractList(res, 'classlist')
    //                     : (extractList(res, 'clsbysubject').length > 0 ? extractList(res, 'clsbysubject') : (extractList(res, 'clssbysub').length > 0 ? extractList(res, 'clssbysub') : extractList(res, 'clssbysubject')));

    //                 const sections = extractList(res, 'sectionlist').length > 0
    //                     ? extractList(res, 'sectionlist')
    //                     : (extractList(res, 'sectbysubject').length > 0 ? extractList(res, 'sectbysubject') : (extractList(res, 'secsbysub').length > 0 ? extractList(res, 'secsbysub') : extractList(res, 'sectionsbysubject')));

    //                 const staff = extractList(res, 'stafflist').length > 0
    //                     ? extractList(res, 'stafflist')
    //                     : (extractList(res, 'staffbysubject').length > 0 ? extractList(res, 'staffbysubject') : (extractList(res, 'staffbysub').length > 0 ? extractList(res, 'staffbysub') : extractList(res, 'staffbyall')));

    //                 setMasterCategories(cats);
    //                 setMasterClasses(classes);
    //                 setMasterSections(sections);
    //                 setMasterStaff(staff);

    //                 if (cats && cats.length > 0) {
    //                     setCategoryList(uniqueById(filterData(cats, 'ttmC_CategoryName'), 'ttmC_Id'));
    //                 }
    //                 if (classes && classes.length > 0) {
    //                     setClassList(uniqueById(filterData(classes, 'asmcL_ClassName'), 'asmcL_Id'));
    //                 }
    //                 if (sections && sections.length > 0) {
    //                     setSectionList(uniqueById(filterData(sections, 'asmC_SectionName'), 'asmS_Id'));
    //                 }
    //                 if (staff && staff.length > 0) {
    //                     setSubStaffList(uniqueById(filterData(staff, 'staffName'), 'hrmE_Id'));
    //                 }
    //             }
    //         } catch (e) {
    //             console.error(e);
    //             toast.error('Failed to load details for selected subject');
    //         }
    //     }
    // };

    const handleSubjectChange = async (subjectId: number) => {
        setValue('ismS_Id', subjectId);

        if (asmaY_Id && subjectId) {
            const res = await getFixingClassSectionStaffsBySubject(asmaY_Id, subjectId);

            const classes = res?.data?.clssbysub || [];
            const sections = res?.data?.secsbysub || [];
            const staff = res?.data?.staffbysub || [];

            setClassList(classes);
            setSectionList(sections);
            setSubStaffList(staff);
        }
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedStaff || !nop) {
            toast.warning('Please select all fields');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const staffObj = subStaffList.find((s) => s.hrmE_Id === selectedStaff);

        const exists = fields.some(
            (f: any) => f.asmcL_Id === Number(selectedClass) && f.asmS_Id === Number(selectedSection) && f.hrmE_Id === Number(selectedStaff)
        );
        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            hrmE_Id: selectedStaff,
            nop: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName || clsObj?.asmcL_Classname,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmC_Sectionname || secObj?.asmS_SectionName,
            staffDisplay: staffObj?.staffName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
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

    const viewColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
            { accessorKey: 'nop', header: 'No Of Periods' }
        ],
        []
    );

    const onEdit = async (item: any) => {
        try {
            const res = await getFixingDaySubjectDetails(item.ttfdsU_Id);
            if (res?.fix_day_subject_edit && (res.fix_day_subject_edit as any[]).length > 0) {
                const d = (res.fix_day_subject_edit as any[])[0];
                reset({
                    ttfdsU_Id: d.ttfdsU_Id,
                    asmaY_Id: d.asmaY_Id,
                    ttmD_Id: d.ttmD_Id,
                    ismS_Id: d.ismS_Id,
                    ttfdsU_SUbSelcFlag: d.ttfdsU_SUbSelcFlag,
                    tempararyArrayList: []
                });
                if (d.ttfdsU_SUbSelcFlag && res.fix_day_subject__classecedit) {
                    (res.fix_day_subject__classecedit as any[]).forEach((sub: any) => {
                        append({
                            asmcL_Id: sub.asmcL_Id,
                            asmS_Id: sub.asmS_Id,
                            hrmE_Id: sub.hrmE_Id,
                            nop: sub.ttfdsucC_Periods || sub.ttscC_Periods,
                            clsDisplay: sub.asmcL_ClassName,
                            sectDisplay: sub.asmC_SectionName,
                            staffDisplay: sub.staffName
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
            const res = await getFixingDaySubjectDetails(item.ttfdsU_Id);
            if (res?.fix_day_subject__classecedit) {
                const details = (res.fix_day_subject__classecedit as any[]).map((sub: any) => ({
                    clsDisplay: sub.asmcL_ClassName,
                    sectDisplay: sub.asmC_SectionName,
                    staffDisplay: sub.staffName,
                    nop: sub.ttfdsucC_Periods || sub.ttscC_Periods
                }));
                setViewDetails(details);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingView(false);
        }
    };

    const onSubmit = async (data: FixingDaySubjectSchema) => {
        try {
            console.log('save payload', data);
            if (!data.ttfdsU_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else {
                if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                    toast.warning('Please add at least one Class-Section details');
                    return;
                }
            }
            const res = await saveFixingDaySubject(data);
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
                    Add Day Subject Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Day Subject Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={daySubjectColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <ToggleDaySubjectForm rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Day Subject Constraint' : 'Add New Day Subject Constraint'}
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
                                        render={({ field }: { field: any }) => (
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
                                                        {dayList.map((item: any) => {
                                                            const id = item.ttmD_Id ?? item.ttmd_id ?? item.TTMD_Id;
                                                            return (
                                                                <SelectItem key={id} value={id?.toString()}>
                                                                    {item.ttmD_DayName || item.ttmD_Dayname || item.ttmd_dayname}
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
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleSubjectChange(Number(v))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subjectList
                                                            .filter((item: any) => item.ismS_Id || item.isms_id || item.ISMS_Id)
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
                                        name='ttfdsU_SUbSelcFlag'
                                        render={({ field }: { field: any }) => (
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

                                {ttfdsU_SUbSelcFlag && (
                                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                                        <h4 className='font-semibold'>Add Class Details</h4>
                                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                                            <div className='space-y-2'>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleCategoryChange(Number(v))}
                                                    value={selectedCategory?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryList.map((item: any) => {
                                                            const id = item.ttmC_Id ?? item.ttmc_id ?? item.TTMC_Id;
                                                            return (
                                                                <SelectItem key={id} value={id?.toString()}>
                                                                    {item.ttmC_CategoryName || item.ttmc_categoryname || item.categoryName}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
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
                                                <FormLabel>Staff</FormLabel>
                                                <Select
                                                    onValueChange={(v) => setSelectedStaff(Number(v))}
                                                    value={selectedStaff?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
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

export default function DaySubjectTab({ initialData, searchParams }: DaySubjectTabProps) {
    return (
        <FormProvider>
            <DaySubjectTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}
