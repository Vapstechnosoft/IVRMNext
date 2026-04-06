'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategtoryDropDownMasterDayClasswise,
    useSubjectRestrictionDayPeriodGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { dayPeriodSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import {
    getFixingClassDropdown,
    getSectionDropdownByClassCategory,
    getStaffByFixing,
    getSubjectByFixing,
    getdetailsAllFixing
} from '@/server/timetable/constraints/fixing';
import { getDayPeriodEditDetails, getSubjectRestrictionDayPeriodDetails, saveDayPeriodDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import ToggleDayPeriodForm from '../toggleButton/dayPeriodToggle';
import { columns } from './day-period-columns';

type DayPeriodSchema = z.infer<typeof dayPeriodSchema>;

interface DayPeriodTabProps {
    initialData: any;
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
        'yearlist',
        'academiclist',
        'categorylist',
        'catelist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist',
        'daylist',
        'periodlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }
    return [];
};

export default function DayPeriodTab({ initialData }: DayPeriodTabProps) {
    return (
        <FormProvider>
            <DayPeriodTabContent initialData={initialData} />
        </FormProvider>
    );
}

function DayPeriodTabContent({ initialData }: DayPeriodTabProps) {
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

    const { data: academicYearData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const { data: categoryData, isLoading: categoryLoading } = useCategtoryDropDownMasterDayClasswise();

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [dayList, setDayList] = useState<any[]>([]);
    const [periodList, setPeriodList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const form = useForm<DayPeriodSchema>({
        resolver: zodResolver(dayPeriodSchema),
        mode: 'onChange',
        defaultValues: {
            ttrdP_Id: 0,
            asmaY_Id: 0,
            ttmC_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            hrmE_Id: 0,
            ismS_Id: 0,
            ttmD_Id: 0,
            ttmP_Id: 0,
            ttrdP_SUbSelcFlag: false
        }
    });

    const {
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
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
    // Consolidate edit data loading into the isEditFormOpen effect below.
    // Removed the redundant effect here to avoid conflicts and fix the ttrdsU_Id error.

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const fixingData = await getdetailsAllFixing(); // SAME API USED IN FIXING

                if (fixingData?.data) {
                    setDayList(filterData(fixingData.data.daylist || [], 'ttmD_DayName'));

                    setPeriodList(filterData(fixingData.data.periodlist || [], 'ttmP_PeriodName'));
                }
            } catch (error) {
                console.error('Failed to load day & period:', error);
                toast.error('Failed to load day & period');
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
            setClassList(filterData(list, 'asmcL_ClassName'));
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

    const handleYearChange = (yearId: number) => {
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

    const {
        data: gridData,
        isLoading: gridLoading,
        refetch
    } = useSubjectRestrictionDayPeriodGridData({
        ASMAY_Id: watchedYear,
        TTMC_Id: watchedCategory
    });

    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const fetchEditData = async () => {
                try {
                    // Robust ID extraction following the "fixing" pattern
                    let d = selectedRow as any;
                    const id = d?.ttrdP_Id || d?.ttrdsU_Id || d?.ttfdP_Id || d?.TTFDP_Id || d?.ttfD_Id;

                    if (id) {
                        // Use the specific API requested by the user: /RestrictionFacade/DayPeriodEdit/
                        const res = await getSubjectRestrictionDayPeriodDetails(id);
                        const editData = (res as any)?.dayperiodlist || (res as any)?.data || res;

                        if (editData && Array.isArray(editData) && editData.length > 0) {
                            d = editData[0];
                        } else if (editData && !Array.isArray(editData)) {
                            d = editData;
                        }
                    }

                    if (d) {
                        // Normalize keys (handle PascalCase and variant names)
                        const editYearId = d.asmaY_Id ?? d.ASMAY_Id;
                        const editCategoryId = d.ttmC_Id ?? d.TTMC_Id;
                        const editClassId = d.asmcL_Id ?? d.ASMCL_Id;
                        const editSectionId = d.asmS_Id ?? d.ASMS_Id ?? d.asmC_Id ?? d.ASMC_Id;
                        const editStaffId = d.hrmE_Id ?? d.HRME_Id;

                        // Sequentially fetch all dependent dropdowns before resetting the form
                        if (editYearId && editCategoryId) {
                            await fetchClasses(editYearId, editCategoryId);
                            if (editClassId) {
                                const secRes = await getSectionDropdownByClassCategory(editYearId, editClassId, editCategoryId);
                                const sections = extractList(secRes, 'get_period_section1');
                                setSectionList(sections || []);

                                if (editSectionId) {
                                    await fetchStaff(editYearId, editCategoryId, editClassId, editSectionId);
                                    if (editStaffId) {
                                        await fetchSubjects(editYearId, editCategoryId, editClassId, editSectionId, editStaffId);
                                    }
                                }
                            }
                        }

                        // Reset form with normalized data
                        reset({
                            ttrdP_Id: d.ttrdP_Id ?? d.ttrdsU_Id ?? d.TTRDP_Id ?? d.ttfdP_Id ?? d.TTFDP_Id ?? 0,
                            asmaY_Id: editYearId,
                            ttmC_Id: editCategoryId,
                            asmcL_Id: editClassId,
                            asmS_Id: editSectionId,
                            hrmE_Id: editStaffId,
                            ismS_Id: d.ismS_Id ?? d.ISMS_Id,
                            ttmD_Id: d.ttmD_Id ?? d.TTMD_Id,
                            ttmP_Id: d.ttmP_Id ?? d.TTMP_Id,
                            ttrdP_SUbSelcFlag:
                                d.ttrdP_SUbSelcFlag === 1 ||
                                d.ttrdP_SUbSelcFlag === true ||
                                d.TTRDP_SUbSelcFlag === 1 ||
                                d.ttrdsU_SUbSelcFlag === true
                        });
                    }
                } catch (err) {
                    console.error('Error fetching edit details:', err);
                    toast.error('Failed to load edit details');
                }
            };
            fetchEditData();
        }
    }, [isEditFormOpen, selectedRow, reset]);

    const onSubmit: SubmitHandler<DayPeriodSchema> = async (data) => {
        try {
            const payload = {
                ...data,
                ttrdP_SUbSelcFlag: data.ttrdP_SUbSelcFlag ? 1 : 0
            };
            const res = await saveDayPeriodDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success('Saved Successfully');
                reset();
                closeAllForms();
                refetch();
            } else if (res.returnfixstatus === 'Fixed') {
                toast.warning('Selected Staff And Subject Is Fixed For Selected Details !');
            } else if (res.returnduplicatestatus === 'Duplicate') {
                toast.warning('Records Already Exist !');
            } else {
                toast.error(res.message || 'Failed to Save');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    const academicList = extractList(academicYearData) || extractList(initialData, 'yearlist');
    const categoryList = extractList(categoryData) || extractList(initialData, 'categorylist');

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
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
                    className='shadow-lg'>
                    <GenericDataTable
                        data={extractList(gridData) || extractList(initialData, 'dayperiodlist')}
                        columns={columns}
                        isLoading={gridLoading}
                    />
                </CollapsibleSection>

                {isToggleFormOpen && selectedRow && <ToggleDayPeriodForm rowData={selectedRow as any} onClose={closeToggleForm} />}

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
                                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                        <FormField
                                            control={control}
                                            name='asmaY_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Academic Year <span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => handleYearChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={academicLoading ? 'Loading...' : '--Select--'} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {academicList.map((item: any) => {
                                                                const id = item.asmaY_Id || item.ASMAY_Id || item.id;
                                                                const year = item.asmaY_Year || item.asmay_Year || item.year;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {year}
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
                                            control={control}
                                            name='ttmC_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Category <span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => handleCategoryChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={categoryLoading ? 'Loading...' : '--Select--'} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categoryList.map((item: any) => {
                                                                const id = item.ttmC_Id || item.TTMC_Id || item.id;
                                                                const name = item.ttmC_CategoryName || item.categoryName;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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
                                            control={control}
                                            name='asmcL_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Class</FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => handleClassChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isClassLoading ? 'Loading...' : '--Select--'} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {classList.map((item: any) => {
                                                                const id = item.asmcL_Id || item.ASMCL_Id || item.id;
                                                                const name = item.asmcL_ClassName || item.className;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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
                                            control={control}
                                            name='asmS_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Section</FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => handleSectionChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {sectionList.map((item: any) => {
                                                                const id = item.asmS_Id || item.ASMS_Id || item.asmC_Id || item.ASMC_Id || item.id;
                                                                const name =
                                                                    item.asmC_SectionName || item.asmS_SectionName || item.sectionName;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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
                                            control={control}
                                            name='hrmE_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Staff Name</FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => handleStaffChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {staffList.map((item: any) => {
                                                                const id = item.hrmE_Id || item.HRME_Id || item.id;
                                                                const name =
                                                                    item.staffName || item.hrmE_EmployeeFirstName || item.employeeName;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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
                                            control={control}
                                            name='ismS_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subject</FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {subjectList.map((item: any) => {
                                                                const id = item.ismS_Id || item.ISMS_Id || item.id;
                                                                const name = item.ismS_SubjectName || item.subjectName;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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
                                            control={control}
                                            name='ttmD_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Day</FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {dayList.map((item: any) => {
                                                                const id = item.ttmD_Id || item.TTMD_Id || item.id;
                                                                const name = item.ttmD_DayName || item.dayName;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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
                                            control={control}
                                            name='ttmP_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Period</FormLabel>
                                                    <Select
                                                        key={field.value?.toString() || 'empty'}
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {periodList.map((item: any) => {
                                                                const id = item.ttmP_Id || item.TTMP_Id || item.id;
                                                                const name = item.ttmP_PeriodName || item.periodName;
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {name}
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

                                    <div className='flex justify-center gap-4 pt-4'>
                                        <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
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
        </div>
    );
}
