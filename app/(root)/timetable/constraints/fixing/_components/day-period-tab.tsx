'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useFixingDayPeriodGridData } from '@/hooks/timetable/constraints/fixingData';
import { type FixingDayPeriodSchema, fixingDayPeriodSchema } from '@/schemas/timetable/constraints/fixing';
import { getCategoryDropDown } from '@/server/timetable/constraints/FixingForm';
import {
    getFixingClassDropdown,
    getFixingDayPeriodDetails,
    getSectionDropdownByClassCategory,
    getStaffByFixing,
    getSubjectByFixing,
    getdetailsAllFixing,
    saveFixingDayPeriod
} from '@/server/timetable/constraints/fixing';
import type { TTDayPeriodGridData } from '@/types/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ToggleDayPeriodForm from './DayPeriodToggle';
import { dayPeriodColumns } from './columns';

interface DayPeriodTabProps {
    initialData: any;
    searchParams?: any;
}

export const TTGeneration: ColumnDef<TTDayPeriodGridData>[] = [
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: TTDayPeriodGridData }) {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let formContext;
    try {
        formContext = useFormContext<TTDayPeriodGridData>();
    } catch {
        return null;
    }

    const { openEditForm, openToggleForm } = formContext;

    const handleEdit = useCallback(
        (data: TTDayPeriodGridData) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: TTDayPeriodGridData) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttfdP_ActiveFlag'
        />
    );
}

function DayPeriodTabContent({ initialData, searchParams }: DayPeriodTabProps) {
    const { isAddFormOpen, isEditFormOpen, openAddForm, closeAddForm, closeEditForm, selectedRow, closeToggleForm, isToggleFormOpen } =
        useFormContext();

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || []);
    const [periodList, setPeriodList] = useState<any[]>(initialData?.periodlist || []);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

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
        return [];
    };

    const { data: gridResponse, isLoading: isGridLoading, refetchAll } = useFixingDayPeriodGridData(searchParams);

    // Prioritize search results/grid response and avoid fallback to initial data if gridResponse exists
    const gridData = gridResponse
        ? (gridResponse as any)?.data || (gridResponse as any)?.fix_day_period_list || (Array.isArray(gridResponse) ? gridResponse : [])
        : initialData?.fix_day_period_list || [];

    const totalItems =
        (gridResponse as any)?.total ||
        (gridResponse as any)?.count ||
        (Array.isArray(gridResponse) ? gridResponse.length : initialData?.total || gridData.length);

    const form = useForm<FixingDayPeriodSchema>({
        resolver: zodResolver(fixingDayPeriodSchema),
        defaultValues: {
            ttfdP_Id: 0,
            asmaY_Id: undefined,
            ttmC_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            hrmE_Id: undefined,
            ismS_Id: undefined,
            ttmD_Id: undefined,
            ttmP_Id: undefined
        }
    });

    const { reset, setValue, watch, handleSubmit } = form;
    const asmaY_Id = watch('asmaY_Id');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();

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
                const [category, fixingData] = await Promise.all([getCategoryDropDown(), getdetailsAllFixing()]);

                setCategoryList(filterData(category || [], 'ttmC_CategoryName'));

                if (fixingData?.data) {
                    setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));
                    setPeriodList(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'));
                }
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

    const fetchStaff = async (yearId: number, categoryId: number, classId: number, sectionId: number) => {
        try {
            const res = await getStaffByFixing({ ASMAY_Id: yearId, TTMC_Id: categoryId, ASMCL_Id: classId, ASMS_Id: sectionId });
            const list = extractList(res, 'stafflist');
            setStaffList(filterData(list || [], 'staffName'));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load staff');
        }
    };

    const fetchSubjects = async (yearId: number, categoryId: number, classId: number, sectionId: number, staffId: number) => {
        try {
            const res = await getSubjectByFixing({
                ASMAY_Id: yearId,
                TTMC_Id: categoryId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId,
                HRME_Id: staffId
            });
            const list = extractList(res, 'subjectlist');
            setSubjectList(filterData(list || [], 'ismS_SubjectName'));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subjects');
        }
    };

    const handleAcademicYearChange = async (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setValue('ttmC_Id', 0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setSelectedCategory(undefined);
        setSelectedClass(undefined);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('ttmC_Id', categoryId);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setSelectedCategory(categoryId);
        setSelectedClass(undefined);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        const yearId = form.getValues('asmaY_Id');
        if (yearId && categoryId) {
            await fetchClasses(yearId, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setValue('asmcL_Id', classId);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setSelectedClass(classId);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);

        const yearId = form.getValues('asmaY_Id');
        const categoryId = form.getValues('ttmC_Id');

        if (yearId && categoryId && classId) {
            try {
                const response = await getSectionDropdownByClassCategory(yearId, classId, categoryId);
                const sections = extractList(response, 'get_period_section1');
                setSectionList(sections || []);
            } catch (error) {
                console.error('Failed to fetch sections:', error);
                toast.error('Failed to load sections');
            }
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('asmS_Id', sectionId);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setStaffList([]);
        setSubjectList([]);
        const { asmaY_Id, ttmC_Id, asmcL_Id } = form.getValues();
        if (asmaY_Id && ttmC_Id && asmcL_Id && sectionId) {
            await fetchStaff(asmaY_Id, ttmC_Id, asmcL_Id, sectionId);
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('hrmE_Id', staffId);
        setValue('ismS_Id', 0);
        setSubjectList([]);
        const { asmaY_Id, ttmC_Id, asmcL_Id, asmS_Id } = form.getValues();
        if (asmaY_Id && ttmC_Id && asmcL_Id && asmS_Id && staffId) {
            await fetchSubjects(asmaY_Id, ttmC_Id, asmcL_Id, asmS_Id, staffId);
        }
    };

    const onEdit = async (item: any) => {
        try {
            const res = await getFixingDayPeriodDetails(item.ttfdP_Id);
            if (res?.fix_day_period_edit && (res.fix_day_period_edit as any[]).length > 0) {
                const d = (res.fix_day_period_edit as any[])[0];
                reset({
                    ttfdP_Id: d.ttfdP_Id,
                    asmaY_Id: d.asmaY_Id,
                    ttmC_Id: d.ttmC_Id,
                    asmcL_Id: d.asmcL_Id,
                    asmS_Id: d.asmS_Id,
                    hrmE_Id: d.hrmE_Id,
                    ismS_Id: d.ismS_Id,
                    ttmD_Id: d.ttmD_Id,
                    ttmP_Id: d.ttmP_Id
                });

                if (d.asmaY_Id && d.ttmC_Id) {
                    setSelectedCategory(d.ttmC_Id);
                    setSelectedClass(d.asmcL_Id);
                    await fetchClasses(d.asmaY_Id, d.ttmC_Id);

                    if (d.asmcL_Id) {
                        const secRes = await getSectionDropdownByClassCategory(d.asmaY_Id, d.asmcL_Id, d.ttmC_Id);
                        const sections = extractList(secRes, 'get_period_section1');
                        setSectionList(filterData(sections || [], 'asmC_SectionName'));

                        if (d.asmS_Id) {
                            await fetchStaff(d.asmaY_Id, d.ttmC_Id, d.asmcL_Id, d.asmS_Id);
                            if (d.hrmE_Id) {
                                await fetchSubjects(d.asmaY_Id, d.ttmC_Id, d.asmcL_Id, d.asmS_Id, d.hrmE_Id);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmit = async (data: FixingDayPeriodSchema) => {
        try {
            const res = await saveFixingDayPeriod(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res?.message || 'Record Saved Successfully');
                refetchAll();
                closeAddForm();
                closeEditForm();
                reset();
            } else if (res?.returnfixstatus === 'Fixed') {
                toast.warning('Selected Staff and Subject is already Fixed for this selection!');
            } else if (res?.returnduplicatestatus === 'Duplicate') {
                toast.warning('Record Already Exists!');
            } else {
                toast.error(res?.message || 'Failed to save');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred');
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
                    Add Day Period Constraint
                </Button>
            </div>

            <CollapsibleSection
                title='Day Period Constraints List'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable data={gridData} columns={dayPeriodColumns} totalItems={totalItems} isLoading={isGridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <ToggleDayPeriodForm rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Day Period Constraint' : 'Add New Day Period Constraint'}
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
                                        name='ttmC_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleCategoryChange(Number(v))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categoryList
                                                            .filter((item: any) => item.ttmC_Id)
                                                            .map((item: any) => (
                                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                                    {item.ttmC_CategoryName}
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
                                        name='asmcL_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Class</FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleClassChange(Number(v))}
                                                    value={selectedClass?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isClassLoading ? (
                                                            <SelectItem value='loading'>Loading...</SelectItem>
                                                        ) : (
                                                            classList
                                                                .filter((item: any) => item.asmcL_Id)
                                                                .map((item: any) => (
                                                                    <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                        {item.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='asmS_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Section</FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {sectionList
                                                            .filter((item: any) => item.asmS_Id)
                                                            .map((item: any) => (
                                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                    {item.asmS_SectionName || item.asmC_SectionName}
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
                                                            .map((item: any) => (
                                                                <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                                    {item.staffName}
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

                                    <FormField
                                        control={form.control}
                                        name='ttmD_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Day</FormLabel>
                                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {dayList.map((item: any) => (
                                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id.toString()}>
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
                                </div>

                                <div className='flex justify-end gap-2'>
                                    <Button type='submit'>Save</Button>
                                    <Button type='button' variant='outline' onClick={() => reset()}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

export default function DayPeriodTab({ initialData, searchParams }: DayPeriodTabProps) {
    return (
        <FormProvider>
            <DayPeriodTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}
