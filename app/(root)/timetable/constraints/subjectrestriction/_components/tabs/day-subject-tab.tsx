'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useSubjectRestrictionDaySubjectGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { daySubjectSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getCategoryDropDown } from '@/server/timetable/constraints/FixingForm';
import { getFixingClassSectionStaffsBySubject, getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { getDaySubjectEditDetails, saveDaySubjectDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Save, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import ToggleDaySubjectForm from '../toggleButton/daySubjectToggle';
import DaySubjectList from './day-subject-list';

// import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

type DaySubjectSchema = z.infer<typeof daySubjectSchema>;

interface DaySubjectTabProps {
    initialData: any;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
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
        return [];
    }

    const keys = [
        'academiclist',
        'categorylist',
        'sublist',
        'classlist',
        'sectionlist',
        'stafflist',
        'daylist',
        'daysubjectlist',
        'subjectlist',
        'clssbysubject',
        'clsbysubject',
        'clssbysub',
        'secsbysubject',
        'sectionlistbysubject',
        'secsbysub',
        'staffsbysubject',
        'stafflistbysubject',
        'staffbysub'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        const result = foundKey ? target[foundKey] : undefined;
        if (Array.isArray(result)) return result;
    }
    return [];
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

const filterData = (list: any[], key: string) => {
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
        const val = actualKey ? item[actualKey] : undefined;
        return val !== undefined && val !== null;
    });
};

export default function DaySubjectTab({ initialData }: DaySubjectTabProps) {
    return (
        <FormProvider>
            <DaySubjectTabContent initialData={initialData} />
        </FormProvider>
    );
}

function DaySubjectTabContent({ initialData }: DaySubjectTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        selectedRow,
        closeToggleForm,
        isToggleFormOpen,
        closeAllForms
    } = useFormContext();

    const form = useForm<DaySubjectSchema>({
        resolver: zodResolver(daySubjectSchema),
        mode: 'onChange',
        defaultValues: {
            ttrdsU_Id: 0,
            asmaY_Id: 0,
            ttmD_Id: 0,
            ismS_Id: 0,
            ttrdsU_SUbSelcFlag: false,
            ttrdsucC_Id: 0,
            tempararyArrayList: []
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
    const watchedSubSelectFlag = watch('ttrdsU_SUbSelcFlag');

    const {
        data: gridData,
        isLoading: isGridLoading,
        refetchAll
    } = useSubjectRestrictionDaySubjectGridData({
        ASMAY_Id: watchedYear || initialData?.asmaY_Id || 0,
        TTMC_Id: 0
    });

    const [dayList, setDayList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [categoryList, setCategoryList] = useState<any[]>([]);

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaffs, setMasterStaffs] = useState<any[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<number>();
    const [selectedClass, setSelectedClass] = useState<number>();
    const [selectedSection, setSelectedSection] = useState<number>();
    const [selectedStaff, setSelectedStaff] = useState<number>();
    const [nop, setNop] = useState<string>('');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const { data: academicData } = useAcademicYearDropDownMasterDayClasswise();
    const academicList = extractList(academicData) || extractList(initialData, 'yearlist');

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                // ✅ Load Category From API
                const categoryRes = await getCategoryDropDown();
                const categoryData = categoryRes;

                setCategoryList(uniqueById(filterData(extractList(categoryData, 'categorylist'), 'ttmC_CategoryName'), 'ttmC_Id'));

                // ✅ Load Day + Subject
                const fixingData = await getdetailsAllFixing();
                if (fixingData?.data) {
                    setDayList(uniqueById(filterData(fixingData.data.daylist || [], 'ttmD_DayName'), 'ttmD_Id'));

                    const subjects = fixingData.data.subjectlist || fixingData.data.sublist || [];

                    setSubjectList(uniqueById(filterData(subjects, 'ismS_SubjectName'), 'ismS_Id'));
                }

                await refetchAll();
            } catch (error) {
                console.error('Failed to load dropdowns:', error);
                toast.error('Failed to load dropdown options');
            }
        };

        loadDropdowns();
    }, []);

    // const { data: subjectsData } = useSubjectDropDownMasterDayClasswise();
    // useEffect(() => {
    //     if (subjectsData) {
    //         setSubjectList(extractList(subjectsData, 'subjectlist'));
    //     }
    // }, [subjectsData]);

    // useEffect(() => {
    //     if (isEditFormOpen && selectedRow) {
    //         onEdit(selectedRow);
    //     }
    // }, [isEditFormOpen, selectedRow]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedCategory(undefined);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);

        const currentSubjectId = form.getValues('ismS_Id');
        if (yearId && currentSubjectId) {
            handleSubjectChange(currentSubjectId, yearId);
        }
    };

    const handleSubjectChange = async (subjectId: number, yearId?: number) => {
        setValue('ismS_Id', subjectId);

        setSelectedCategory(undefined);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);

        setClassList([]);
        setSectionList([]);
        setStaffList([]);

        const effectiveYearId = yearId ?? form.getValues('asmaY_Id');

        if (!effectiveYearId || !subjectId) return;

        try {
            const res = await getFixingClassSectionStaffsBySubject(effectiveYearId, subjectId);

            if (res) {
                const dataObj = res.data || res;
                const classes =
                    extractList(dataObj, 'clssbysub').length > 0 ? extractList(dataObj, 'clssbysub') : extractList(dataObj, 'clsbysubject');
                const sections =
                    extractList(dataObj, 'secsbysub').length > 0
                        ? extractList(dataObj, 'secsbysub')
                        : extractList(dataObj, 'secsbysubject');
                const staffs =
                    extractList(dataObj, 'staffbysub').length > 0
                        ? extractList(dataObj, 'staffbysub')
                        : extractList(dataObj, 'staffsbysubject');

                setMasterClasses(classes);
                setMasterSections(sections);
                setMasterStaffs(staffs);

                setClassList(filterData(classes, 'asmcL_ClassName'));
                setSectionList(filterData(sections, 'asmC_SectionName'));
                setStaffList(filterData(staffs, 'staffName'));
            }
        } catch (e) {
            console.error('Error fetching assignments:', e);
            toast.error('Failed to load details for selected subject');
        }
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
        }

        // setSectionList([]);
        //  setSubStaffList([]);

        // console.log(masterStaff, 'masterStaffdata after category change');
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedStaff(undefined);

        // Filter subjects from master list by section
        const filtered = masterStaffs.filter((s) => {
            const key = Object.keys(s).find((k) => k.toLowerCase() === 'asms_id');
            const value = key ? Number(s[key]) : null;
            return value === sectionId;
        });

        if (filtered.length > 0) {
            setStaffList(filterData(filtered, 'staffName'));
        } else {
            // If local filter is missing link, show staff's full subject list as it's specifically for them
            setStaffList(filterData(masterStaffs, 'staffName'));
        }
    };

    const handleAdd = () => {
        if (!selectedClass || !selectedSection || !selectedStaff || !nop) {
            toast.error('Please fill all fields');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const staffObj = staffList.find((st) => st.hrmE_Id === selectedStaff);

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
            nop: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName,
            staffDisplay: staffObj?.staffName || staffObj?.hrmE_EmployeeFirstName
        });
        setNop('');
    };

    const onEdit = async (item: any) => {
        try {
            const res: any = await getDaySubjectEditDetails(item.ttrdsU_Id);
            const data = (res as any)?.daysubjectlist?.[0] || item;
            reset({
                ttrdsU_Id: data.ttrdsU_Id,
                asmaY_Id: data.asmaY_Id,
                ttmD_Id: data.ttmD_Id,
                ismS_Id: data.ismS_Id,
                ttrdsU_SUbSelcFlag: data.ttrdsU_SUbSelcFlag === 1 || data.ttrdsU_SUbSelcFlag === true,
                tempararyArrayList: []
            });
            if (data.ttrdsU_SUbSelcFlag && res?.daysubject__classecedit) {
                res.daysubject__classecedit.forEach((sub: any) => {
                    append({
                        asmcL_Id: sub.asmcL_Id,
                        asmS_Id: sub.asmS_Id,
                        hrmE_Id: sub.hrmE_Id,
                        nop: sub.ttrdsucC_Periods,
                        clsDisplay: sub.asmcL_ClassName,
                        sectDisplay: sub.asmC_SectionName || sub.asmS_SectionName,
                        staffDisplay: sub.staffName
                    } as any);
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load edit details');
        }
    };

    const onSubmit: SubmitHandler<DaySubjectSchema> = async (values) => {
        try {
            const payload = {
                ...values,
                ttrdsU_SUbSelcFlag: values.ttrdsU_SUbSelcFlag === true,
                tempararyArrayList: values.ttrdsU_SUbSelcFlag
                    ? values.tempararyArrayList?.map((item) => ({
                          nop: item.nop,
                          hrmE_Id: item.hrmE_Id,
                          asmS_Id: item.asmS_Id,
                          asmcL_Id: item.asmcL_Id
                      }))
                    : []
            };
            const res = await saveDaySubjectDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success('Saved Successfully');
                refetchAll();
                reset();
                closeAllForms();
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

    const tempColumns: ColumnDef<any>[] = [
        { accessorKey: 'clsDisplay', header: 'Class' },
        { accessorKey: 'sectDisplay', header: 'Section' },
        { accessorKey: 'staffDisplay', header: 'Staff' },
        { accessorKey: 'nop', header: 'Periods' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button variant='ghost' size='sm' type='button' onClick={() => remove(row.index)}>
                    <Trash className='h-4 w-4 text-red-500' />
                </Button>
            )
        }
    ];

    return (
        <div className='space-y-4 p-1'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Day Subject Constraint
                </Button>
            </div>

            <DaySubjectList
                data={(gridData as any)?.daysubjectlist || (Array.isArray(gridData) ? gridData : [])}
                isLoading={isGridLoading}
                asmaY_Id={watchedYear}
            />

            {isToggleFormOpen && selectedRow && <ToggleDaySubjectForm rowData={selectedRow as any} onClose={closeToggleForm} />}

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
                                                    onValueChange={(val) => handleAcademicYearChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filterData(academicList, 'asmaY_Year').map((item: any) => (
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
                                        control={control}
                                        name='ttmD_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Day <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
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
                                        control={control}
                                        name='ismS_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Subject <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(val) => handleSubjectChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filterData(subjectList, 'ismS_SubjectName').map((item: any) => (
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

                                <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                                    <FormField
                                        control={control}
                                        name='ttrdsU_SUbSelcFlag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className='space-y-1 leading-none'>
                                                    <FormLabel className='font-semibold'>Restriction Class-Section Wise</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {watchedSubSelectFlag && (
                                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-6'>
                                            <div className='space-y-2'>
                                                <Label>Category</Label>
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
                                                <Label>Class</Label>
                                                <Select
                                                    onValueChange={(v) => handleClassChange(Number(v))}
                                                    value={selectedClass?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classList.map((item: any) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>Section</Label>
                                                <Select
                                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                                    value={selectedSection?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sectionList.map((item: any) => (
                                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                {item.asmC_SectionName || item.asmS_SectionName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>Staff</Label>
                                                <Select
                                                    onValueChange={(v) => setSelectedStaff(Number(v))}
                                                    value={selectedStaff?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {staffList.map((item: any) => (
                                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                                {item.staffName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>Periods</Label>
                                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} />
                                            </div>
                                            <Button type='button' onClick={handleAdd} variant='secondary'>
                                                <Plus className='mr-2 h-4 w-4' /> Add
                                            </Button>
                                        </div>
                                    )}

                                    {watchedSubSelectFlag && fields.length > 0 && (
                                        <div className='mt-4'>
                                            <GenericDataTable<any>
                                                data={fields}
                                                columns={tempColumns}
                                                isPaginationRequired={false}
                                                isLoading={false}
                                            />
                                        </div>
                                    )}
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
    );
}
