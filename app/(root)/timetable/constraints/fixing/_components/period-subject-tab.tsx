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
    getFixingPeriodSubjectDetails,
    getSectionByClass,
    getStaffByFixing,
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
            toggleConditionKey='ttrpsU_ActiveFlag'
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
    const [categoryList, setCategoryList] = useState<any[]>(initialData?.categorylist || []);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subStaffList, setSubStaffList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

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
            'classlist',
            'sectionlist',
            'stafflist',
            'subjectlist',
            'staffbyall',
            'subjectbystaff',
            'sectionbyclass',
            'classbycategory',
            'categorylist'
        ];
        for (const key of keys) {
            const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
            if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
        }

        const firstArray = Object.values(target).find((v) => Array.isArray(v));
        return Array.isArray(firstArray) ? firstArray : [];
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
            ttrpsU_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const { reset, setValue, watch, control, handleSubmit } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttmP_Id = watch('ttmP_Id');
    const ismS_Id = watch('ismS_Id');
    const ttrpsU_SUbSelcFlag = watch('ttrpsU_SUbSelcFlag');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
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
            const val = item[key] ?? item[Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase()) || ''];
            if (!val) return true;
            if (typeof val !== 'string') return !!val;
            const name = val.trim();
            return name && name.toLowerCase() !== 'test';
        });
    };

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setCategoryList(filterData(initialData?.categorylist || initialData?.data?.categorylist || [], 'ttmC_CategoryName'));
                const fixingData = await getdetailsAllFixing();
                if (fixingData?.data) {
                    setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                    setPeriodList(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'));
                    setSubjectList(filterData(fixingData.data.subjectlist || [], 'ismS_SubjectName'));
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
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);
        if (asmaY_Id && categoryId) {
            await fetchClasses(asmaY_Id, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setSectionList([]);
        setSubStaffList([]);
        if (asmaY_Id && selectedCategory && classId) {
            try {
                const res = await getSectionByClass({ ASMAY_Id: asmaY_Id, ASMCL_Id: classId, TTMC_Id: selectedCategory });
                const sections = extractList(res, 'sectionlist');
                setSectionList(filterData(sections || [], 'asmC_SectionName'));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedStaff(undefined);
        setSubStaffList([]);
        if (asmaY_Id && selectedCategory && selectedClass && sectionId) {
            try {
                const res = await getStaffByFixing({
                    ASMAY_Id: asmaY_Id,
                    TTMC_Id: selectedCategory,
                    ASMCL_Id: selectedClass!,
                    ASMS_Id: sectionId
                });
                const staff = extractList(res, 'stafflist');
                setSubStaffList(filterData(staff || [], 'staffName'));
            } catch (e) {
                console.error(e);
            }
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
            const res = await getFixingPeriodSubjectDetails(item.ttrpsU_Id);
            if (res?.fix_period_subject_edit && (res.fix_period_subject_edit as any[]).length > 0) {
                const d = (res.fix_period_subject_edit as any[])[0];
                reset({
                    ttrpsU_Id: d.ttrpsU_Id,
                    asmaY_Id: d.asmaY_Id,
                    ttmP_Id: d.ttmP_Id,
                    ismS_Id: d.ismS_Id,
                    ttrpsU_SUbSelcFlag: d.ttrpsU_SUbSelcFlag,
                    tempararyArrayList: []
                });
                if (d.ttrpsU_SUbSelcFlag && res.fix_period_subject__classecedit) {
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
            const res = await getFixingPeriodSubjectDetails(item.ttrpsU_Id);
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
            if (!data.ttrpsU_SUbSelcFlag) {
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
                                                        {academicList
                                                            .filter((item: any) => item.asmaY_Id)
                                                            .map((item: any) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
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
                                                        {periodList.map((item: any) => (
                                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>
                                                                {item.ttmP_PeriodName}
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
                                        name='ismS_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subjectList
                                                            .filter((item: any) => item.ismS_Id)
                                                            .map((item: any) => (
                                                                <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                                    {item.ismS_SubjectName}
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
                                        name='ttrpsU_SUbSelcFlag'
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

                                {ttrpsU_SUbSelcFlag && (
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
                                                        {categoryList.map((item: any) => (
                                                            <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                                {item.ttmC_CategoryName}
                                                            </SelectItem>
                                                        ))}
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
                                                            classList.map((item: any) => (
                                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                    {item.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))
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
                                                        {sectionList.map((item: any) => (
                                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                {item.asmS_SectionName || item.asmC_SectionName}
                                                            </SelectItem>
                                                        ))}
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
                                                        {subStaffList.map((item: any) => (
                                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                                {item.hrmE_EmployeeCode}-{item.hrmE_EmployeeFirstName}
                                                            </SelectItem>
                                                        ))}
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

export default function PeriodSubjectTab({ initialData, searchParams }: PeriodSubjectTabProps) {
    return (
        <FormProvider>
            <PeriodSubjectTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}
