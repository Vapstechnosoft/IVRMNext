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
import { useSubjectRestrictionDayStaffGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { dayStaffSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getCategoryDropDown } from '@/server/timetable/constraints/FixingForm';
import { getFixingClassSectionSubjectByStaff } from '@/server/timetable/constraints/fixing';
import {
    getDayStaffEditDetails,
    getSubjectRestrictionDayStaffGridData,
    getSubjectRestrictionDetailsRestrictions,
    saveDayStaffDetail
} from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import ToggleDayStaffForm from '../toggleButton/dayStaffToggle';
import DayStaffList from './day-staff-list';

type DayStaffSchema = z.infer<typeof dayStaffSchema>;

interface DayStaffTabProps {
    initialData: any;
    searchParams?: any;
}

export default function DayStaffTab({ initialData, searchParams }: DayStaffTabProps) {
    return (
        <FormProvider>
            <DayStaffTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
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
        closeAllForms
    } = useFormContext();

    const form = useForm<DayStaffSchema>({
        resolver: zodResolver(dayStaffSchema),
        defaultValues: {
            ttrdS_Id: 0,
            asmaY_Id: 0,
            ttmD_Id: 0,
            hrmE_Id: 0,
            ttrdS_SUbSelcFlag: false,
            ttrdscC_Id: 0,
            tempararyArrayList: []
        }
    });

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const categoryData = await getCategoryDropDown();
                setCategoryList(filterData(extractList(categoryData, 'categorylist'), 'ttmC_CategoryName'));

                const [fixingData, gridRes] = await Promise.all([
                    getSubjectRestrictionDetailsRestrictions(),
                    getSubjectRestrictionDayStaffGridData(searchParams)
                ]);

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

    const {
        reset,
        setValue,
        watch,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = form;

    const asmaY_Id = watch('asmaY_Id');
    const ttrdS_SUbSelcFlag = watch('ttrdS_SUbSelcFlag');

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const [dayList, setDayList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    const {
        data: gridResponse,
        isLoading: isGridLoading,
        refetchAll
    } = useSubjectRestrictionDayStaffGridData({
        ASMAY_Id: asmaY_Id || initialData?.asmaY_Id || 0,
        TTMC_Id: 0
    });

    const gridData = (gridResponse as any)?.daystafflist || (Array.isArray(gridResponse) ? gridResponse : []);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subSubjectList, setSubSubjectList] = useState<any[]>([]);
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    // Master lists for the selected staff member
    const [masterCategories, setMasterCategories] = useState<any[]>([]);
    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterSubjects, setMasterSubjects] = useState<any[]>([]);

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
            'classlist',
            'clssbystaff',
            'clsbystaff',
            'sectionlist',
            'secsbystaff',
            'sectionlistbystaff',
            'subjectlist',
            'subsbystaff',
            'subjectlistbystaff',
            'stafflist',
            'daylist',
            'daystafflist'
        ];
        for (const key of keys) {
            const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
            const result = foundKey ? target[foundKey] : undefined;
            if (Array.isArray(result)) return result;
        }
        return [];
    };

    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
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
            const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
            const val = actualKey ? item[actualKey] : undefined;
            if (val === undefined || val === null) return false;
            return true;
        });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [cats, settings] = await Promise.all([getCategoryDropDown(), getSubjectRestrictionDetailsRestrictions()]);
                setCategoryList(filterData(extractList(cats, 'categorylist'), 'ttmC_CategoryName'));
                const sData = settings?.data || settings;
                setDayList(extractList(sData, 'daylist'));
                setStaffList(extractList(sData, 'stafflist'));
            } catch (err) {
                console.error(err);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            onEdit(selectedRow);
        }
    }, [isEditFormOpen, selectedRow]);
    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedCategory(undefined);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);

        const currentStaffId = form.getValues('hrmE_Id');
        if (yearId && currentStaffId) {
            handleStaffChange(currentStaffId);
        }

        // Fetch categories when year changes is already handled by main effect or can be removed if strictly only once
        // Removing local override as per user request to keep list "clear" and only from one source
    };

    const handleStaffChange = async (staffId: number, yearId?: number) => {
        setValue('hrmE_Id', staffId);
        setSelectedCategory(undefined);
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

                    setMasterCategories(cats);
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

    // const handleCategoryChange = (categoryId: number) => {
    //     setSelectedCategory(categoryId);
    //     setSelectedClass(undefined);
    //     const filtered = masterClasses.filter(c =>
    //         (c.ttmC_Id !== undefined && Number(c.ttmC_Id) === categoryId)
    //     );
    //     setClassList(filterData(filtered, 'asmcL_ClassName'));
    // };

    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategory(categoryId);
        setSelectedClass(undefined);

        // Just show all staff classes
        setClassList(filterData(masterClasses, 'asmcL_ClassName'));
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);

        const filtered = masterSections.filter((s) => {
            const key = Object.keys(s).find((k) => k.toLowerCase() === 'asmcl_id');
            const value = key ? Number(s[key]) : null;
            return value === classId;
        });
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);

        // Filter subjects from master list by section
        const filtered = masterSubjects.filter((sub) => sub.asmS_Id !== undefined && Number(sub.asmS_Id) === sectionId);

        if (filtered.length > 0) {
            setSubSubjectList(filterData(filtered, 'ismS_SubjectName'));
        } else {
            // If local filter is missing link, show staff's full subject list as it's specifically for them
            setSubSubjectList(filterData(masterSubjects, 'ismS_SubjectName'));
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

    const onEdit = async (item: any) => {
        try {
            const res: any = await getDayStaffEditDetails(item.ttrdS_Id);
            const data = res?.daystafflist?.[0] || item;
            reset({
                ttrdS_Id: data.ttrdS_Id,
                asmaY_Id: data.asmaY_Id,
                ttmD_Id: data.ttmD_Id,
                hrmE_Id: data.hrmE_Id,
                ttrdS_SUbSelcFlag: data.ttrdS_SUbSelcFlag,
                tempararyArrayList: []
            });
            if (data.ttrdS_SUbSelcFlag && res?.daystaff__classecedit) {
                res.daystaff__classecedit.forEach((sub: any) => {
                    append({
                        asmcL_Id: sub.asmcL_Id,
                        asmS_Id: sub.asmS_Id,
                        ismS_Id: sub.ismS_Id,
                        nop: sub.ttrdscC_Periods,
                        clsDisplay: sub.asmcL_ClassName,
                        sectDisplay: sub.asmC_SectionName || sub.asmS_SectionName,
                        subDisplay: sub.ismS_SubjectName
                    } as any);
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmit: SubmitHandler<DayStaffSchema> = async (values) => {
        try {
            const payload = {
                ...values,
                ttrdS_SUbSelcFlag: values.ttrdS_SUbSelcFlag ? 1 : 0
            };
            const res = await saveDayStaffDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success('Saved Successfully');
                refetchAll();
                reset();
                closeAllForms();
            } else {
                toast.error(res.message || 'Failed to Save');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const tempColumns: ColumnDef<any>[] = [
        { accessorKey: 'clsDisplay', header: 'Class' },
        { accessorKey: 'sectDisplay', header: 'Section' },
        { accessorKey: 'subDisplay', header: 'Subject' },
        { accessorKey: 'nop', header: 'NOP' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button variant='ghost' size='sm' type='button' onClick={() => remove(row.index)}>
                    <X className='h-4 w-4 text-red-500' />
                </Button>
            )
        }
    ];

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

            <DayStaffList data={gridData} isLoading={isGridLoading} asmaY_Id={asmaY_Id} />

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
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-6'>
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
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v)); // ✅ THIS WAS MISSING
                                                        handleAcademicYearChange(Number(v));
                                                    }}
                                                    value={field.value ? field.value.toString() : undefined}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {academicList.map((item: any) => (
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
                                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id?.toString()}>
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
                                        name='hrmE_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Staff Name <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(val) => handleStaffChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {staffList.map((item: any) => (
                                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id?.toString()}>
                                                                {item.staffName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name='ttrdS_SUbSelcFlag'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-2'>
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel>Class-Section Wise Restriction</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {ttrdS_SUbSelcFlag && (
                                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
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
                                                        {classList.map((item: any) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
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
                                                                {item.asmC_SectionName}
                                                            </SelectItem>
                                                        ))}
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
                                                        {subSubjectList.map((item: any) => (
                                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                                {item.ismS_SubjectName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <FormLabel>No of Periods</FormLabel>
                                                <Input
                                                    type='number'
                                                    value={nop}
                                                    onChange={(e) => setNop(e.target.value)}
                                                    placeholder='No of Periods'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex justify-end'>
                                            <Button type='button' onClick={addToGrid}>
                                                Add
                                            </Button>
                                        </div>

                                        {fields.length > 0 && (
                                            <GenericDataTable<any>
                                                data={fields}
                                                columns={tempColumns}
                                                isPaginationRequired={false}
                                                isLoading={false}
                                            />
                                        )}
                                    </div>
                                )}

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
