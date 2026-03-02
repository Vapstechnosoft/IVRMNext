'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ToggleDayPeriodForm from './DayPeriodToggle';
import { dayPeriodColumns } from './columns';

interface DayPeriodTabProps {
    initialData: any;
    searchParams?: any;
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
        'categorylist',
        'daylist',
        'periodlist'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }
    return [];
};

export default function DayPeriodTab({ initialData, searchParams }: DayPeriodTabProps) {
    return (
        <FormProvider>
            <DayPeriodTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function DayPeriodTabContent({ initialData, searchParams }: DayPeriodTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeAllForms,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow
    } = useFormContext();

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [dayList, setDayList] = useState<any[]>([]);
    const [periodList, setPeriodList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

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

    const {
        reset,
        setValue,
        watch,
        handleSubmit,
        formState: { isSubmitting }
    } = form;
    const watchedYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedSection = watch('asmS_Id');
    const watchedStaff = watch('hrmE_Id');

    const filterData = (list: any[], key: string) => {
        return (list || []).filter((item: any) => {
            if (!item) return false;
            const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
            const val = actualKey ? item[actualKey] : undefined;
            if (val === undefined || val === null) return true;
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
                console.error('Failed to load initial dropdowns:', error);
            }
        };
        loadDropdowns();
    }, []);

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
        }
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setValue('ttmC_Id', 0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
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
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && categoryId) {
            await fetchClasses(watchedYear, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setValue('asmcL_Id', classId);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && classId) {
            try {
                const response = await getSectionDropdownByClassCategory(watchedYear, classId, watchedCategory);
                const sections = extractList(response, 'get_period_section1');
                setSectionList(sections || []);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('asmS_Id', sectionId);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && sectionId) {
            await fetchStaff(watchedYear, watchedCategory, watchedClass, sectionId);
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('hrmE_Id', staffId);
        setValue('ismS_Id', 0);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && watchedSection && staffId) {
            await fetchSubjects(watchedYear, watchedCategory, watchedClass, watchedSection, staffId);
        }
    };

    const { data: gridResponse, isLoading: gridLoading, refetchAll } = useFixingDayPeriodGridData(searchParams);
    const gridData = gridResponse
        ? (gridResponse as any)?.data || (gridResponse as any)?.fix_day_period_list || []
        : initialData?.fix_day_period_list || [];

    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const onEdit = async (item: any) => {
                try {
                    const res = await getFixingDayPeriodDetails(item.ttfdP_Id);
                    if (res?.fix_day_period_edit && (res.fix_day_period_edit as any[]).length > 0) {
                        const d = (res.fix_day_period_edit as any[])[0];

                        if (d.asmaY_Id && d.ttmC_Id) {
                            await fetchClasses(d.asmaY_Id, d.ttmC_Id);
                            if (d.asmcL_Id) {
                                const secRes = await getSectionDropdownByClassCategory(d.asmaY_Id, d.asmcL_Id, d.ttmC_Id);
                                const sections = extractList(secRes, 'get_period_section1');
                                setSectionList(sections || []);
                                if (d.asmS_Id) {
                                    await fetchStaff(d.asmaY_Id, d.ttmC_Id, d.asmcL_Id, d.asmS_Id);
                                    if (d.hrmE_Id) {
                                        await fetchSubjects(d.asmaY_Id, d.ttmC_Id, d.asmcL_Id, d.asmS_Id, d.hrmE_Id);
                                    }
                                }
                            }
                        }

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
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            onEdit(selectedRow);
        }
    }, [isEditFormOpen, selectedRow, reset]);

    const onSubmit: SubmitHandler<FixingDayPeriodSchema> = async (data) => {
        try {
            const res = await saveFixingDayPeriod(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success('Record Saved Successfully');
                refetchAll();
                closeAllForms();
                reset();
            } else if (res?.returnfixstatus === 'Fixed') {
                toast.warning('Selected Staff and Subject is already Fixed!');
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

            <CollapsibleSection title='Day Period Constraints List' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable data={gridData} columns={dayPeriodColumns} isLoading={gridLoading} />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <ToggleDayPeriodForm rowData={selectedRow} onClose={closeToggleForm} />}

            {(isAddFormOpen || isEditFormOpen) && (
                <CollapsibleSection
                    title={isEditFormOpen ? 'Edit Day Period Constraint' : 'Add New Day Period Constraint'}
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg'>
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
                                                <FormLabel>
                                                    Academic Year <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleAcademicYearChange(Number(v))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {academicList.map((item: any) => (
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
                                                <FormLabel>
                                                    Category <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(v) => handleCategoryChange(Number(v))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categoryList.map((item: any) => (
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
                                                <Select onValueChange={(v) => handleClassChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isClassLoading ? 'Loading...' : 'Select'} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {classList.map((item: any) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
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
                                                        {sectionList.map((item: any) => (
                                                            <SelectItem
                                                                key={item.asmS_Id || item.asmC_Id}
                                                                value={(item.asmS_Id || item.asmC_Id).toString()}>
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
                                                        {staffList.map((item: any) => (
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
                                                        {subjectList.map((item: any) => (
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

                                <div className='flex justify-center gap-4 pt-4'>
                                    <Button type='submit' disabled={isSubmitting}>
                                        <Save className='mr-2 h-4 w-4' /> {isEditFormOpen ? 'Update' : 'Save'}
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            reset();
                                            closeAllForms();
                                        }}>
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
