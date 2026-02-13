'use client';

import {
    useAcademicYearDropDownMasterDayClasswise,
    useStaffDropDownDayStaff,
    useSubjectRestrictionDayStaffGridData
} from '@/hooks/timetable/constraints/subjectrestriction';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dayStaffSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { saveDayStaffDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import DayStaffList from './day-staff-list';
import ToggleDayStaffForm from '../toggleButton/dayStaffToggle';

type DayStaffSchema = z.infer<typeof dayStaffSchema>;

interface DayStaffTabProps {
    initialData: any;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = ['yearlist', 'stafflist', 'daylist', 'daystafflist'];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }
    return [];
};

export default function DayStaffTab({ initialData }: DayStaffTabProps) {
    return (
        <FormProvider>
            <DayStaffTabContent initialData={initialData} />
        </FormProvider>
    );
}

function DayStaffTabContent({ initialData }: DayStaffTabProps) {
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
    const { data: staffData, isLoading: staffLoading } = useStaffDropDownDayStaff();

    const academicList = extractList(academicYearData) || extractList(initialData, 'yearlist');
    const staffList = extractList(staffData) || extractList(initialData, 'stafflist');

    const form = useForm<DayStaffSchema>({
        resolver: zodResolver(dayStaffSchema),
        mode: 'onChange',
        defaultValues: {
            TTRDS_Id: 0,
            ASMAY_Id: 0,
            TTMD_Id: 0,
            HRME_Id: 0,
            TTRDS_SUbSelcFlag: false,
            combinationlist: []
        }
    });

    const {
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const watchedYear = watch('ASMAY_Id');

    const { data: gridData, isLoading: gridLoading } = useSubjectRestrictionDayStaffGridData({
        ASMAY_Id: watchedYear,
        TTMC_Id: 0 // Mocking Category if required by type, though tab implies Staff focus
    });

    // Effect for populating form when editing
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const fetchEditData = async () => {
                try {
                    const { getDayStaffEditDetails } = await import('@/server/timetable/constraints/subjectrestriction');
                    const res = await getDayStaffEditDetails((selectedRow as any).ttrdsU_Id || (selectedRow as any).ttrdS_Id);
                    const data = (res as any)?.daystafflist?.[0] || selectedRow;
                    reset({
                        TTRDS_Id: (data as any).ttrdS_Id || (data as any).ttrdsU_Id,
                        ASMAY_Id: (data as any).asmaY_Id,
                        TTMD_Id: (data as any).ttmD_Id,
                        HRME_Id: (data as any).hrmE_Id,
                        TTRDS_SUbSelcFlag: (data as any).ttrdS_SUbSelcFlag === 1 || (data as any).ttrdS_SUbSelcFlag === true,
                        combinationlist: (data as any).combinationlist || []
                    });
                } catch (err) {
                    toast.error('Failed to load edit details');
                }
            };
            fetchEditData();
        }
    }, [isEditFormOpen, selectedRow, reset]);

    const onSubmit: SubmitHandler<DayStaffSchema> = async (data) => {
        try {
            const payload = {
                ...data,
                TTRDS_SUbSelcFlag: data.TTRDS_SUbSelcFlag ? 1 : 0
            };
            const res = await saveDayStaffDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success('Saved Successfully');
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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Day Staff Constraint
                    </Button>
                </div>

                <DayStaffList data={extractList(gridData) || extractList(initialData, 'daystafflist')} isLoading={gridLoading} />

                {isToggleFormOpen && selectedRow && (
                    <ToggleDayStaffForm rowData={selectedRow as any} onClose={closeToggleForm} />
                )}

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

                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
                                        {errors.ASMAY_Id && <span className='text-red-500 text-xs'>{errors.ASMAY_Id.message}</span>}
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Staff <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='HRME_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={staffLoading ? 'Loading...' : '--Select--'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {staffList.map((item: any) => {
                                                            const id = item.hrmE_Id || item.HRME_Id || item.id;
                                                            const name = item.staffName || item.hrmE_EmployeeFirstName || item.employeeName;
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
                                        {errors.HRME_Id && <span className='text-red-500 text-xs'>{errors.HRME_Id.message}</span>}
                                    </div>
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
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
