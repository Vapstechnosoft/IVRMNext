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
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import PeriodSubjectList from './period-subject-list';

type PeriodSubjectSchema = z.infer<typeof periodSubjectSchema>;

interface PeriodSubjectTabProps {
    initialData: any;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = ['yearlist', 'subjectlist', 'periodlist', 'classlist', 'sectionlist', 'stafflist', 'periodsubjectlist'];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
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
    const { isAddFormOpen, isEditFormOpen, openAddForm, closeAddForm, closeEditForm, selectedRow } = useFormContext();

    // Use hooks for dropdowns
    const { data: academicYearData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const { data: subjectsData, isLoading: subjectsLoading } = useSubjectDropDownMasterDayClasswise();

    const academicList = extractList(academicYearData) || extractList(initialData, 'yearlist');
    const subjectList = extractList(subjectsData) || extractList(initialData, 'subjectlist');
    const periodList = extractList(initialData, 'periodlist');

    const form = useForm<PeriodSubjectSchema>({
        resolver: zodResolver(periodSubjectSchema),
        mode: 'onChange',
        defaultValues: {
            TTRPSU_Id: 0,
            ASMAY_Id: 0,
            TTMP_Id: 0,
            ISMS_Id: 0,
            TTRPSU_SUbSelcFlag: false,
            combinationlist: []
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const watchedYear = watch('ASMAY_Id');

    const { data: gridData, isLoading: gridLoading } = useSubjectRestrictionPeriodSubjectGridData({
        ASMAY_Id: watchedYear,
        TTMC_Id: 0 // Mock Category if not needed
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'combinationlist'
    });

    const watchedSubSelectFlag = watch('TTRPSU_SUbSelcFlag');
    const [tempInput, setTempInput] = useState({
        ASMCL_Id: 0,
        ASMS_Id: 0,
        HRME_Id: 0,
        NOD: ''
    });

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    // Load Class, Section, Staff Dropdowns for sub-grid
    useEffect(() => {
        const loadSubDropdowns = async () => {
            try {
                const { getClassDropdown, getSectionDropDown, getStaffDropDown } = await import(
                    '@/server/timetable/constraints/FixingForm'
                );
                const [classes, sections, staff] = await Promise.all([getClassDropdown(), getSectionDropDown(), getStaffDropDown()]);
                setClassList(classes || []);
                setSectionList(sections || []);
                setStaffList(staff || []);
            } catch (error) {
                console.error('Failed to load sub-dropdowns:', error);
            }
        };
        loadSubDropdowns();
    }, []);

    // Effect for Edit Mode
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const fetchEditData = async () => {
                try {
                    const { getPeriodSubjectEditDetails } = await import('@/server/timetable/constraints/subjectrestriction');
                    const res = await getPeriodSubjectEditDetails((selectedRow as any).ttrpsU_Id || (selectedRow as any).ttrpsu_Id);
                    const data = (res as any)?.periodsubjectlist?.[0] || selectedRow;
                    reset({
                        TTRPSU_Id: (data as any).ttrpsU_Id || (data as any).ttrpsu_Id,
                        ASMAY_Id: (data as any).asmaY_Id,
                        TTMP_Id: (data as any).ttmP_Id,
                        ISMS_Id: (data as any).ismS_Id,
                        TTRPSU_SUbSelcFlag: (data as any).ttrpsU_SUbSelcFlag === 1 || (data as any).ttrpsU_SUbSelcFlag === true,
                        combinationlist: (data as any).combinationlist || []
                    });
                } catch (err) {
                    toast.error('Failed to load edit details');
                }
            };
            fetchEditData();
        }
    }, [isEditFormOpen, selectedRow, reset]);

    const handleAdd = () => {
        if (!tempInput.ASMCL_Id || !tempInput.ASMS_Id || !tempInput.HRME_Id || !tempInput.NOD) {
            toast.error('Please fill all fields');
            return;
        }
        append({
            ASMCL_Id: tempInput.ASMCL_Id,
            ASMS_Id: tempInput.ASMS_Id,
            HRME_Id: tempInput.HRME_Id,
            TTRPSUCC_Days: Number(tempInput.NOD)
        });
        setTempInput({ ASMCL_Id: 0, ASMS_Id: 0, HRME_Id: 0, NOD: '' });
    };

    const onSubmit: SubmitHandler<PeriodSubjectSchema> = async (data) => {
        try {
            const { savePeriodSubjectDetail } = await import('@/server/timetable/constraints/subjectrestriction');
            const payload = {
                ...data,
                TTRPSU_SUbSelcFlag: data.TTRPSU_SUbSelcFlag ? 1 : 0
            };
            const res = await savePeriodSubjectDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success('Saved Successfully');
                reset();
                if (isAddFormOpen) closeAddForm();
                if (isEditFormOpen) closeEditForm();
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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Period Subject Constraint
                    </Button>
                </div>

                <PeriodSubjectList
                    data={extractList(gridData) || extractList(initialData, 'periodsubjectlist')}
                    isLoading={gridLoading}
                    asmaY_Id={watchedYear}
                />

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
                                {/* Existing form content */}
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
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
                                                        <SelectValue placeholder={academicLoading ? 'Loading...' : '--Select--'} />
                                                    </SelectTrigger>
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
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Period <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='TTMP_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {periodList.map((item: any) => (
                                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>
                                                                {item.ttmP_PeriodName}
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
                                                        <SelectValue placeholder={subjectsLoading ? 'Loading...' : '--Select--'} />
                                                    </SelectTrigger>
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
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                                    <div className='flex items-center space-x-2'>
                                        <Controller
                                            control={control}
                                            name='TTRPSU_SUbSelcFlag'
                                            render={({ field }) => (
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id='cs_flag_psu' />
                                            )}
                                        />
                                        <Label htmlFor='cs_flag_psu' className='font-semibold'>
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
                                                        <SelectItem value='0'>Select</SelectItem>
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
                                                        <SelectItem value='0'>Select</SelectItem>
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
                                                        <SelectItem value='0'>Select</SelectItem>
                                                        {staffList.map((item: any) => (
                                                            <SelectItem
                                                                key={item.hrmE_Id}
                                                                value={item.staffName ? item.staffName : item.hrmE_EmployeeFirstName}>
                                                                {item.staffName ? item.staffName : item.hrmE_EmployeeFirstName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>Days</Label>
                                                <InputText
                                                    value={tempInput.NOD}
                                                    onChange={(e) => setTempInput((prev) => ({ ...prev, NOD: e.target.value }))}
                                                    type='number'
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
                                                    <TableHead>Days</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell>{field.ASMCL_Id}</TableCell>
                                                        <TableCell>{field.ASMS_Id}</TableCell>
                                                        <TableCell>{field.HRME_Id}</TableCell>
                                                        <TableCell>{field.TTRPSUCC_Days}</TableCell>
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
