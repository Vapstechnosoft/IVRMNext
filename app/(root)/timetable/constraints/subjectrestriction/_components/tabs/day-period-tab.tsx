'use client';

import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategtoryDropDownMasterDayClasswise,
    useSubjectRestrictionDayPeriodGridData
} from '@/hooks/timetable/constraints/subjectrestriction';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dayPeriodSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { saveDayPeriodDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import DayPeriodList from './day-period-list';

type DayPeriodSchema = z.infer<typeof dayPeriodSchema>;

interface DayPeriodTabProps {
    initialData: any;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = ['yearlist', 'categorylist', 'daylist', 'periodlist', 'classlist', 'sectionlist', 'stafflist', 'subjectlist'];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
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
    const { isAddFormOpen, isEditFormOpen, openAddForm, closeAddForm, closeEditForm, closeAllForms } = useFormContext();

    // Use hooks for Academic Year and Category
    const { data: academicYearData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const { data: categoryData, isLoading: categoryLoading } = useCategtoryDropDownMasterDayClasswise();

    const academicList = extractList(academicYearData) || extractList(initialData, 'yearlist');
    const categoryList = extractList(categoryData) || extractList(initialData, 'categorylist');

    const form = useForm<DayPeriodSchema>({
        resolver: zodResolver(dayPeriodSchema),
        mode: 'onChange',
        defaultValues: {
            TTRDP_Id: 0,
            ASMAY_Id: 0,
            TTMC_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            HRME_Id: 0,
            ISMS_Id: 0,
            TTMD_Id: 0,
            TTMP_Id: 0,
            TTRDP_SUbSelcFlag: false
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

    const watchedYear = watch('ASMAY_Id');
    const watchedCategory = watch('TTMC_Id');

    const { data: gridData, isLoading: gridLoading } = useSubjectRestrictionDayPeriodGridData({
        ASMAY_Id: watchedYear,
        TTMC_Id: watchedCategory
    });

    const { selectedRow } = useFormContext();

    // Effect for populating form when editing
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const fetchEditData = async () => {
                try {
                    const { getDayPeriodEditDetails } = await import('@/server/timetable/constraints/subjectrestriction');
                    const res = await getDayPeriodEditDetails((selectedRow as any).ttrdP_Id);
                    const data = (res as any)?.dayperiodlist?.[0] || selectedRow;
                    reset({
                        TTRDP_Id: (data as any).ttrdP_Id,
                        ASMAY_Id: (data as any).asmaY_Id,
                        TTMC_Id: (data as any).ttmC_Id,
                        ASMCL_Id: (data as any).asmcL_Id,
                        ASMS_Id: (data as any).asmS_Id,
                        HRME_Id: (data as any).hrmE_Id,
                        ISMS_Id: (data as any).ismS_Id,
                        TTMD_Id: (data as any).ttmD_Id,
                        TTMP_Id: (data as any).ttmP_Id,
                        TTRDP_SUbSelcFlag: (data as any).ttrdP_SUbSelcFlag === 1 || (data as any).ttrdP_SUbSelcFlag === true
                    });
                } catch (err) {
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
                TTRDP_SUbSelcFlag: data.TTRDP_SUbSelcFlag ? 1 : 0
            };
            const res = await saveDayPeriodDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success('Saved Successfully');
                reset();
                closeAddForm();
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

                <DayPeriodList data={extractList(gridData) || extractList(initialData, 'dayperiodlist')} isLoading={gridLoading} />

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

                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
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
                                        {errors.ASMAY_Id && <span className='text-red-500 text-xs'>{errors.ASMAY_Id.message}</span>}
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
                                                        <SelectValue placeholder={categoryLoading ? 'Loading...' : '--Select--'} />
                                                    </SelectTrigger>
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
                                            )}
                                        />
                                        {errors.TTMC_Id && <span className='text-red-500 text-xs'>{errors.TTMC_Id.message}</span>}
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
