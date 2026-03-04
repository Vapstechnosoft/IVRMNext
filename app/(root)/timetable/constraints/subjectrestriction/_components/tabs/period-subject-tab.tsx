'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useSubjectDropDownMasterDayClasswise,
    useSubjectRestrictionPeriodSubjectGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { periodSubjectSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFixingClassSectionStaffsBySubject } from '@/server/timetable/constraints/fixing';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import PeriodSubjectList from './period-subject-list';
import TogglePeriodSubjectForm from '../toggleButton/periodSubjectToggle';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import type { ColumnDef } from '@tanstack/react-table';

type PeriodSubjectSchema = z.infer<typeof periodSubjectSchema>;

interface PeriodSubjectTabProps {
    initialData: any;
}

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
        'sublist',
        'classlist',
        'sectionlist',
        'stafflist',
        'daylist',
        'periodlist',
        'periodsubjectlist',
        'subjectlist',
        'clssbysub',
        'clsbysubject',
        'secsbysub',
        'secsbysubject',
        'staffbysub',
        'staffsbysubject'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        const result = foundKey ? target[foundKey] : undefined;
        if (Array.isArray(result)) return result;
    }
    return [];
};

export default function PeriodSubjectTab({ initialData }: PeriodSubjectTabProps) {
    return (
        <FormProvider>
            <PeriodSubjectTabContent initialData={initialData} />
        </FormProvider>
    );
}

function PeriodSubjectTabContent({ initialData }: PeriodSubjectTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        selectedRow,
        isToggleFormOpen,
        closeToggleForm
    } = useFormContext();

    // Use hooks for dropdowns
    const { data: academicYearData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const { data: subjectsData, isLoading: subjectsLoading } = useSubjectDropDownMasterDayClasswise();

    const academicList = extractList(academicYearData) || extractList(initialData, 'yearlist');
    const subjectList = extractList(subjectsData) || extractList(initialData, 'subjectlist');
    const [periodList, setPeriodList] = useState<any[]>(extractList(initialData, 'periodlist'));

    const filterData = (list: any[], key: string) => {
        return (list || []).filter((item: any) => {
            if (!item) return false;
            const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
            const val = actualKey ? item[actualKey] : undefined;
            if (val === undefined || val === null) return false;
            return true;
        });
    };

    const form = useForm<PeriodSubjectSchema>({
        resolver: zodResolver(periodSubjectSchema),
        mode: 'onChange',
        defaultValues: {
            ttrpsU_Id: 0,
            asmaY_Id: 0,
            ttmP_Id: 0,
            ismS_Id: 0,
            ttrpsucC_Id: 0,
            ttrpsU_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = form;

    const watchedYear = watch('asmaY_Id') as number | undefined;
    const watchedSubSelectFlag = watch('ttrpsU_SUbSelcFlag') as boolean | undefined;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const { data: gridData, isLoading: gridLoading } = useSubjectRestrictionPeriodSubjectGridData({
        ASMAY_Id: watchedYear || 0,
        TTMC_Id: 0 // Mock Category if not needed
    });

    const tempColumns: ColumnDef<any>[] = [
        { accessorKey: 'clsDisplay', header: 'Class' },
        { accessorKey: 'sectDisplay', header: 'Section' },
        { accessorKey: 'staffDisplay', header: 'Staff' },
        { accessorKey: 'nod', header: 'Days' },
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

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([])

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaffs, setMasterStaffs] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number>();
    const [selectedSection, setSelectedSection] = useState<number>();
    const [selectedStaff, setSelectedStaff] = useState<number>();
    const [nop, setNop] = useState<string>('');

    // Load Initial Dropdowns
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [restrictionData] = await Promise.all([
                    import('@/server/timetable/constraints/subjectrestriction')
                ]);

                const settings = await restrictionData.getSubjectRestrictionDetailsRestrictions();
                const data = settings?.data || settings;
                if (data?.periodlist) {
                    setPeriodList(filterData(data.periodlist, 'ttmP_PeriodName'));
                }
            } catch (error) {
                console.error('Failed to load dropdowns:', error);
            }
        };
        loadDropdowns();
    }, []);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
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


    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedStaff(undefined);

        const filtered = masterStaffs.filter((s) => {
            const key = Object.keys(s).find((k) => k.toLowerCase() === 'asms_id');
            const value = key ? Number(s[key]) : null;
            return value === sectionId;
        });

        if (filtered.length > 0) {
            setStaffList(filterData(filtered, 'staffName'));
        } else {
            setStaffList(filterData(masterStaffs, 'staffName'));
        }
    };

    // Effect for Edit Mode
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const fetchEditData = async () => {
                try {
                    const { getPeriodSubjectEditDetails } = await import('@/server/timetable/constraints/subjectrestriction');
                    const res: any = await getPeriodSubjectEditDetails((selectedRow as any).ttrpsU_Id || (selectedRow as any).ttrpsu_Id);
                    const data = res?.periodsubjectlist?.[0] || selectedRow;

                    // Reset main form with data
                    reset({
                        ttrpsU_Id: (data as any).ttrpsU_Id || (data as any).ttrpsu_Id,
                        asmaY_Id: (data as any).asmaY_Id,
                        ttmP_Id: (data as any).ttmP_Id,
                        ismS_Id: (data as any).ismS_Id,
                        ttrpsU_SUbSelcFlag: (data as any).ttrpsU_SUbSelcFlag === 1 || (data as any).ttrpsU_SUbSelcFlag === true,
                        tempararyArrayList: []
                    });

                    // Trigger loading of dependent dropdowns for sub-grid
                    if (data.asmaY_Id && data.ismS_Id) {
                        handleSubjectChange(data.ismS_Id, data.asmaY_Id);
                    }

                    // Populate sub-grid (combination list) with display names
                    if (data.ttrpsU_SUbSelcFlag || (data as any).ttrpsU_SUbSelcFlag === 1) {
                        const subGridData = res?.periodsubject__classecedit || (data as any).tempararyArrayList || (data as any).combinationlist || [];
                        subGridData.forEach((sub: any) => {
                            append({
                                asmcL_Id: sub.asmcL_Id || sub.ASMCL_Id,
                                asmS_Id: sub.asmS_Id || sub.ASMS_Id,
                                hrmE_Id: sub.hrmE_Id || sub.HRME_Id,
                                nod: sub.ttrpsucC_Periods || sub.TTRPSUCC_Days || sub.nod,
                                clsDisplay: sub.asmcL_ClassName || sub.clsDisplay,
                                sectDisplay: sub.asmC_SectionName || sub.asmS_SectionName || sub.sectDisplay,
                                staffDisplay: sub.staffName || sub.staffDisplay
                            } as any);
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
            nod: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName,
            staffDisplay: staffObj?.staffName || staffObj?.hrmE_EmployeeFirstName
        } as any);
        setNop('');
    };

    const onSubmit: SubmitHandler<PeriodSubjectSchema> = async (data) => {
        try {
            const { savePeriodSubjectDetail } = await import('@/server/timetable/constraints/subjectrestriction');
            const payload = {
                ...data,
                ttrpsU_SUbSelcFlag: data.ttrpsU_SUbSelcFlag,
                tempararyArrayList: data.ttrpsU_SUbSelcFlag
                    ? data.tempararyArrayList?.map((item: any) => ({
                        asmcL_Id: item.asmcL_Id,
                        asmS_Id: item.asmS_Id,
                        hrmE_Id: item.hrmE_Id,
                        nod: item.nod
                    }))
                    : []
            };
            console.log('payload', payload);
            const res = await savePeriodSubjectDetail(payload);
            if (res.success) {
                reset();
                if (isAddFormOpen) closeAddForm();
                if (isEditFormOpen) closeEditForm();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Period Subject Restriction
                    </Button>
                </div>

                <PeriodSubjectList
                    data={(gridData as any)?.periodsubjectlist || extractList(gridData) || extractList(initialData, 'periodsubjectlist')}
                    isLoading={gridLoading}
                    asmaY_Id={Number(watchedYear)}
                />

                {isToggleFormOpen && selectedRow && (
                    <TogglePeriodSubjectForm rowData={selectedRow as any} onClose={closeToggleForm} />
                )}

                {(isAddFormOpen || isEditFormOpen) && (
                    <CollapsibleSection
                        title={isEditFormOpen ? 'Edit Period Subject Constraint' : 'Add New Period Subject Constraint'}
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

                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='asmaY_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => handleAcademicYearChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={academicLoading ? 'Loading...' : '--Select--'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filterData(academicList, 'asmaY_Year').map((item: any) => {
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
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Period <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='ttmP_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
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
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Subject <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='ismS_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => handleSubjectChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={subjectsLoading ? 'Loading...' : '--Select--'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filterData(subjectList, 'ismS_SubjectName').map((item: any) => {
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
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                                    <div className='flex items-center space-x-2'>
                                        <Controller
                                            control={control}
                                            name='ttrpsU_SUbSelcFlag'
                                            render={({ field }) => (
                                                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} id='cs_flag_psu' />
                                            )}
                                        />
                                        <Label htmlFor='cs_flag_psu' className='font-semibold'>
                                            Restriction Class-Section Wise
                                        </Label>
                                    </div>

                                    {watchedSubSelectFlag && (
                                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-6'>
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
                                                                {item.staffName || item.hrmE_EmployeeFirstName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>Days</Label>
                                                <InputText
                                                    value={nop}
                                                    onChange={(e) => setNop(e.target.value)}
                                                    type='number'
                                                />
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
                                        <Save className='mr-2 h-4 w-4' /> Save
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            reset();
                                            if (isEditFormOpen) closeEditForm();
                                            if (isAddFormOpen) closeAddForm();
                                        }}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
