'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { usePeriodSubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { type FixingPeriodSubjectSchema, fixingPeriodSubjectSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassDropdown,
    getFixingClassSectionStaffsBySubject,
    getFixingPeriodSubjectDetails,
    getdetailsAllFixing,
    saveFixingPeriodSubject
} from '@/server/timetable/constraints/fixing';
import type { TTPeriodSubjectGridData } from '@/types/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import TogglePeriodSubjectForm from './PeriodSubjectToggle';
import { periodSubjectColumns } from './columns';
import { FixingViewModal } from './fixing-view-modal';

interface PeriodSubjectTabProps {
    initialData: any;
    searchParams?: any;
}

export const TTGeneration: ColumnDef<TTPeriodSubjectGridData>[] = [
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: TTPeriodSubjectGridData }) {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let formContext;
    try {
        formContext = useFormContext<TTPeriodSubjectGridData>();
    } catch {
        return null;
    }

    const { openEditForm, openToggleForm } = formContext;

    const handleEdit = useCallback(
        (data: TTPeriodSubjectGridData) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: TTPeriodSubjectGridData) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttfpsU_ActiveFlag'
        />
    );
}

function PeriodSubjectTabContent({ initialData, searchParams }: PeriodSubjectTabProps) {
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
    const [periodList, setPeriodList] = useState<any[]>(initialData?.periodlist || []);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subStaffList, setSubStaffList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    // Master lists for the selected subject
    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaff, setMasterStaff] = useState<any[]>([]);

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = usePeriodSubjectGridData(searchParams);

    const gridData = gridResponse
        ? (gridResponse as any)?.data || (gridResponse as any)?.fix_period_subject_list || (Array.isArray(gridResponse) ? gridResponse : [])
        : initialData?.fix_period_subject_list || [];

    const totalItems =
        (gridResponse as any)?.total ||
        (gridResponse as any)?.count ||
        (Array.isArray(gridResponse) ? gridResponse.length : initialData?.total || gridData.length);

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
            if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
        }

        const firstArray = Object.values(target).find((v) => Array.isArray(v));
        return Array.isArray(firstArray) ? firstArray : [];
    };

    const uniqueById = (list: any[], idKey: string) => {
        const seen = new Set();
        return (list || []).filter((item: any) => {
            if (!item) return false;
            // Case-insensitive key lookup
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

    const { reset, setValue, watch, control, handleSubmit } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttmP_Id = watch('ttmP_Id');
    const ismS_Id = watch('ismS_Id');
    const ttfpsU_SUbSelcFlag = watch('ttfpsU_SUbSelcFlag');
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedStaff, setSelectedStaff] = useState<number | undefined>();
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
                    setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                    setPeriodList(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'));
                    setSubjectList(filterData(fixingData.data.subjectlist || [], 'ismS_SubjectName'));
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



    // const handleCategoryChange = async (categoryId: number) => {
    //     setSelectedCategory(categoryId);
    //     setSelectedClass(undefined);
    //     setSelectedSection(undefined);
    //     setSelectedStaff(undefined);

    //     // Filter classes from master list by category
    //     const filtered = masterClasses.filter(
    //         (c) =>
    //             (c.ttmC_Id !== undefined && Number(c.ttmC_Id) === categoryId) ||
    //             (c.ttmc_id !== undefined && Number(c.ttmc_id) === categoryId) ||
    //             (c.TTMC_Id !== undefined && Number(c.TTMC_Id) === categoryId)
    //     );

    //     if (filtered.length > 0) {
    //         setClassList(uniqueById(filterData(filtered, 'asmcL_ClassName'), 'asmcL_Id'));
    //     } else {
    //         // Fallback: show all classes or fetch (to keep data visible if links are missing)
    //         setClassList(uniqueById(filterData(masterClasses, 'asmcL_ClassName'), 'asmcL_Id'));
    //         if (asmaY_Id) {
    //             try {
    //                 const data = await getFixingClassDropdown(asmaY_Id, categoryId);
    //                 const list = extractList(data, 'classlist');
    //                 if (list && list.length > 0) {
    //                     setClassList(uniqueById(filterData(list, 'asmcL_ClassName'), 'asmcL_Id'));
    //                 }
    //             } catch (e) {
    //                 console.error(e);
    //             }
    //         }
    //     }

    //     setSectionList([]);
    //     setSubStaffList([]);
    // };

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
    //             console.log('PeriodSubject - get_cls_sec_staffsData response:', res);

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


        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);

        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);

        if (!asmaY_Id || !subjectId) return;

        try {
            const res = await getFixingClassSectionStaffsBySubject(asmaY_Id, subjectId);

            const classes = extractList(res, 'clssbysub');
            const sections = extractList(res, 'secsbysub');
            const staff = extractList(res, 'staffbysub');

            // 🔥 STORE MASTER DATA
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
    // const handleSubjectChange = async (subjectId: number) => {
    //     setValue('ismS_Id', subjectId);

    //     if (asmaY_Id && subjectId) {
    //         const res = await getFixingClassSectionStaffsBySubject(asmaY_Id, subjectId);

    //         const classes = res?.data?.clssbysub || [];
    //         const sections = res?.data?.secsbysub || [];
    //         const staff = res?.data?.staffbysub || [];

    //         setClassList(classes);
    //         setSectionList(sections);
    //         setSubStaffList(staff);
    //     }
    // };

    console.log('staffsdata later', subStaffList);

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
            nod: Number(nod),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName,
            staffDisplay: staffObj?.hrmE_EmployeeFirstName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
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
            { accessorKey: 'staffDisplay', header: 'Staff' },
            { accessorKey: 'nod', header: 'No Of Days' }
        ],
        []
    );

    const onEdit = async (item: any) => {
        try {
            const res = await getFixingPeriodSubjectDetails(item.ttfpsU_Id);
            if (res?.fix_period_subject_edit && (res.fix_period_subject_edit as any[]).length > 0) {
                const d = (res.fix_period_subject_edit as any[])[0];
                reset({
                    ttrpsU_Id: d.ttfpsU_Id || d.ttrpsU_Id,
                    asmaY_Id: d.asmaY_Id,
                    ttmP_Id: d.ttmP_Id,
                    ismS_Id: d.ismS_Id,
                    ttfpsU_SUbSelcFlag: d.ttfpsU_SUbSelcFlag || d.ttrpsU_SUbSelcFlag,
                    tempararyArrayList: []
                });
                if ((d.ttfpsU_SUbSelcFlag || d.ttrpsU_SUbSelcFlag) && res.fix_period_subject__classecedit) {
                    (res.fix_period_subject__classecedit as any[]).forEach((sub: any) => {
                        append({
                            asmcL_Id: sub.asmcL_Id,
                            asmS_Id: sub.asmS_Id,
                            hrmE_Id: sub.hrmE_Id,
                            nod: sub.ttfpsucC_Days,
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
            const res = await getFixingPeriodSubjectDetails(item.ttfpsU_Id);
            if (res?.fix_period_subject__classecedit) {
                const details = (res.fix_period_subject__classecedit as any[]).map((sub: any) => ({
                    clsDisplay: sub.asmcL_ClassName,
                    sectDisplay: sub.asmC_SectionName,
                    staffDisplay: sub.staffName,
                    nod: sub.ttfpsucC_Days
                }));
                setViewDetails(details);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingView(false);
        }
    };

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
                    Add Period Subject Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Period Subject Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={periodSubjectColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <TogglePeriodSubjectForm rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isAddFormOpen ? 'Add New Period Subject Constraint' : 'Edit Period Subject Constraint'}
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
                                        name='ismS_Id'
                                        render={({ field }) => (
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
                                                            .filter((item: any) => item.ismS_Id)
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
                        </Form >
                    </div >
                </CollapsibleSection >
            )
            }

            <FixingViewModal
                isOpen={!!isDetailsViewOpen}
                onClose={closeDetailsView}
                title='Class-Section Wise Details'
                data={viewDetails}
                columns={viewColumns}
                isLoading={isLoadingView}
            />
        </div >
    );
}

export default function PeriodSubjectTab({ initialData, searchParams }: PeriodSubjectTabProps) {
    return (
        <FormProvider>
            <PeriodSubjectTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}
