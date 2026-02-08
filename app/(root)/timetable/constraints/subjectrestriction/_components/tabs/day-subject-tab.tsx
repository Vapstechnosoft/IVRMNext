'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InputText } from '@/components/ui/extension/input-text';
import { daySubjectSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import {
    getDaySubjectEditDetails,
    saveDaySubjectDetail,
} from '@/server/timetable/constraints/subjectrestriction';
import {
    getCategoryDropDown,
    getClassDropdown,
    getSectionDropDown,
    getStaffDropDown,
    getSubjectDropDown
} from '@/server/timetable/constraints/FixingForm';
import { useSubjectRestrictionDaySubjectGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import DaySubjectList from './day-subject-list';

type DaySubjectSchema = z.infer<typeof daySubjectSchema>;

interface DaySubjectTabProps {
    initialData: any;
}

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
        isToggleFormOpen
    } = useFormContext();

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [dayList, setDayList] = useState<any[]>(initialData?.daylist || []);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    const form = useForm<DaySubjectSchema>({
        resolver: zodResolver(daySubjectSchema),
        mode: 'onChange',
        defaultValues: {
            TTRDSU_Id: 0,
            ASMAY_Id: 0,
            TTMC_Id: 0,
            TTMD_Id: 0,
            ISMS_Id: 0,
            TTRDSU_SUbSelcFlag: false,
            combinationlist: []
        }
    });

    const {
        handleSubmit,
        control,
        watch,
        reset,
        formState: { isSubmitting }
    } = form;

    const watchedYear = watch('ASMAY_Id');
    const watchedCategory = watch('TTMC_Id');
    const watchedSubSelectFlag = watch('TTRDSU_SUbSelcFlag');

    const { data: gridData, isLoading } = useSubjectRestrictionDaySubjectGridData({
        ASMAY_Id: watchedYear,
        TTMC_Id: watchedCategory
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'combinationlist'
    });

    const [tempInput, setTempInput] = useState({
        ASMCL_Id: 0,
        ASMS_Id: 0,
        HRME_Id: 0,
        TTRDSUCC_Periods: 0
    });

    const handleAdd = () => {
        if (!tempInput.ASMCL_Id || !tempInput.ASMS_Id || !tempInput.HRME_Id || !tempInput.TTRDSUCC_Periods) {
            toast.error('Please fill all fields');
            return;
        }
        append({
            ASMCL_Id: tempInput.ASMCL_Id,
            ASMS_Id: tempInput.ASMS_Id,
            HRME_Id: tempInput.HRME_Id,
            TTRDSUCC_Periods: tempInput.TTRDSUCC_Periods
        });
        setTempInput({ ASMCL_Id: 0, ASMS_Id: 0, HRME_Id: 0, TTRDSUCC_Periods: 0 });
    };

    // Load Dropdowns Generically as requested
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [category, classes, sections, staff, subjects] = await Promise.all([
                    getCategoryDropDown(),
                    getClassDropdown(),
                    getSectionDropDown(),
                    getStaffDropDown(),
                    getSubjectDropDown()
                ]);
                setCategoryList(category || []);
                setClassList(classes || []);
                setSectionList(sections || []);
                setStaffList(staff || []);
                setSubjectList(subjects || []);
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

    // Effect to handle Toggle (Active/Deactive)


    const onEdit = async (item: any) => {
        try {
            const res = await getDaySubjectEditDetails(item.ttrdsU_Id);
            const details = (res as any)?.editdetails || (res as any)?.data || (Array.isArray(res) ? res : []);
            if (details && details.length > 0) {
                const d = details[0];
                reset({
                    TTRDSU_Id: d.ttrdsU_Id,
                    ASMAY_Id: d.asmaY_Id,
                    TTMC_Id: d.ttmC_Id,
                    TTMD_Id: d.ttmD_Id,
                    ISMS_Id: d.ismS_Id,
                    TTRDSU_SUbSelcFlag: d.ttrdsU_SUbSelcFlag,
                    combinationlist: d.combinationlist || []
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load edit details');
        }
    };


    const onSubmit: SubmitHandler<DaySubjectSchema> = async (data) => {
        try {
            const res = await saveDaySubjectDetail(data);
            if (res.returnval === true) {
                toast.success('Saved Successfully');
                window.location.reload();
            } else if (res.returnfixstatus === 'Fixed') {
                toast.warning('Selected Staff And Subject Is Fixed For Selected Details !');
            } else if (res.returnduplicatestatus === 'Duplicate') {
                toast.warning('Records Already Exist !');
            } else {
                toast.error('Failed to Save');
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
                        Add Day Subject Constraint
                    </Button>
                </div>

                <DaySubjectList
                    data={
                        (gridData as any)?.data ||
                        (gridData as any)?.daysubjectlist ||
                        (gridData as any)?.daySubjectList ||
                        (gridData as any)?.daysubject_list ||
                        (Array.isArray(gridData) ? gridData : []) ||
                        initialData?.daysubjectlist ||
                        initialData?.daySubjectList ||
                        []
                    }
                    isLoading={isLoading}
                />

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

                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='ASMAY_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicList.map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Category <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='TTMC_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryList.map((item: any) => (
                                                            <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                                {item.ttmC_CategoryName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Day <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='TTMD_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dayList.map((item: any) => (
                                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id.toString()}>
                                                                {item.ttmD_DayName}
                                                            </SelectItem>
                                                        ))}
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
                                            name='ISMS_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjectList.map((item: any) => (
                                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                                {item.ismS_SubjectName}
                                                            </SelectItem>
                                                        ))}
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
                                            name='TTRDSU_SUbSelcFlag'
                                            render={({ field }) => (
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id='cs_flag' />
                                            )}
                                        />
                                        <Label htmlFor='cs_flag' className='font-semibold'>
                                            Restriction Class-Section Wise
                                        </Label>
                                    </div>

                                    {watchedSubSelectFlag && (
                                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                                            <div className='space-y-2'>
                                                <Label>Class</Label>
                                                <Select
                                                    value={tempInput.ASMCL_Id.toString()}
                                                    onValueChange={(val) => setTempInput((prev) => ({ ...prev, ASMCL_Id: Number(val) }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
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
                                                    value={tempInput.ASMS_Id.toString()}
                                                    onValueChange={(val) => setTempInput((prev) => ({ ...prev, ASMS_Id: Number(val) }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
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
                                                <Label>Staff</Label>
                                                <Select
                                                    value={tempInput.HRME_Id.toString()}
                                                    onValueChange={(val) => setTempInput((prev) => ({ ...prev, HRME_Id: Number(val) }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
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
                                                <Label>Period Count</Label>
                                                <InputText
                                                    type='number'
                                                    value={tempInput.TTRDSUCC_Periods.toString()}
                                                    onChange={(e) =>
                                                        setTempInput((prev: any) => ({ ...prev, TTRDSUCC_Periods: Number(e.target.value) }))
                                                    }
                                                />
                                            </div>
                                            <Button type='button' onClick={handleAdd} variant='secondary'>
                                                <Plus className='mr-2 h-4 w-4' /> Add
                                            </Button>
                                        </div>
                                    )}

                                    {watchedSubSelectFlag && fields.length > 0 && (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Class</TableHead>
                                                    <TableHead>Section</TableHead>
                                                    <TableHead>Staff</TableHead>
                                                    <TableHead>Periods</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field: any, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell>
                                                            {classList.find((c) => c.asmcL_Id === field.ASMCL_Id)?.asmcL_ClassName || field.ASMCL_Id}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sectionList.find((s) => s.asmS_Id === field.ASMS_Id)?.asmC_SectionName || field.ASMS_Id}
                                                        </TableCell>
                                                        <TableCell>
                                                            {staffList.find((st) => st.hrmE_Id === field.HRME_Id)?.staffName || field.HRME_Id}
                                                        </TableCell>
                                                        <TableCell>{field.TTRDSUCC_Periods}</TableCell>
                                                        <TableCell>
                                                            <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)}>
                                                                <Trash className='h-4 w-4 text-red-500' />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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
