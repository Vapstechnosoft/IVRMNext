'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategtoryDropDownMasterDayClasswise,
    useClassDropDownMasterDayClasswise,
    useMasterDayClasswiseDetails
} from '@/hooks/timetable/useMasters';
import { masterDayClasswiseSchema } from '@/schemas/timetable/masters';
import { getClassByCategory, savePeriodClass } from '@/server/timetable/masters/periodallocation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterDayClasswiseSchema.addOrUpdate>;

interface MasterPeriodClassFormProps {
    onSuccess?: () => void;
}

export default function MasterDayClassWiseAddForm({ onSuccess }: MasterPeriodClassFormProps) {
    const { refetchAll } = useMasterDayClasswiseDetails();
    const [classList, setClassList] = useState<any[]>([]);

    const [classSearch, setClassSearch] = useState('');
    const [daySearch, setDaySearch] = useState('');

    const [isLoadingClasses, setIsLoadingClasses] = useState(false);

    const {
        data: academicList,
        isLoading: academicLoading,
        error: academicError,
        refetchAll: academicRefetch
    } = useAcademicYearDropDownMasterDayClasswise();

    const {
        data: categoryList,
        isLoading: categoryLoading,
        error: categoryError,
        refetchAll: categoryRefetch
    } = useCategtoryDropDownMasterDayClasswise();

    const { data: classData, isLoading: classloading, error: classError, refetchAll: classRefetch } = useClassDropDownMasterDayClasswise();

    const {
        data: Masterdaydata,
        isLoading: masterdaydataloading,
        error: masterdaydataError,
        refetchAll: masterdaydataRefetch
    } = useClassDropDownMasterDayClasswise();
    //const academicList = (response as any)?.academiclist || [];
    //const categoryList = (response as any)?.catelist || [];

    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterDayClasswiseSchema.addOrUpdate),
        defaultValues: {
            // noOfPeriods: 1
        }
    });

    const watchedAcademicYear = watch('asmay_id');
    const watchedCategory = watch('ttmC_Id');
    // const watchedNoOfPeriods = watch('noOfPeriods');

    // Fetch Classes based on Category and Academic Year
    useEffect(() => {
        const fetchClasses = async () => {
            if (watchedAcademicYear && watchedCategory) {
                try {
                    const res = await getClassByCategory({
                        ASMAY_Id: watchedAcademicYear,
                        TTMC_Id: watchedCategory
                    });
                    if (res?.tempararyArray) {
                        setClassList(res.tempararyArray as any[]);
                    } else {
                        setClassList([]);
                    }
                } catch (err) {
                    console.error('Error fetching classes', err);
                }
            } else {
                setClassList([]);
            }
        };
        fetchClasses();
    }, [watchedAcademicYear, watchedCategory]);

    // Fetch Period Class list
    // useEffect(() => {
    //     const fetchPeriods = async () => {
    //         // if (watchedNoOfPeriods) {
    //         //     try {
    //         //         const count = Number(watchedNoOfPeriods);
    //         //         const res = await getPeriodClass({ period_count: count });
    //         //         if (res?.periodlist_class) {
    //         //             setPeriods(res.periodlist_class as any[]);
    //         //         } else {
    //         //             setPeriods([]);
    //         //         }
    //         //     } catch (err) {
    //         //         console.error('Error fetching periods', err);
    //         //         setPeriods([]);
    //         //     }
    //         // }
    //     };
    //     fetchPeriods();
    // }, [watchedNoOfPeriods]);

    // const toggleClass = (id: string) => {
    //     let updated = [];

    //     if (watchedClassIds.includes(id)) {
    //         updated = watchedClassIds.filter((v: string) => v !== id);
    //     } else {
    //         updated = [...watchedClassIds, id];
    //     }

    //     if (updated.length === 0) {
    //         setValue('classIds', undefined as any);
    //     } else {
    //         setValue('classIds', updated as [string, ...string[]], {
    //             shouldValidate: true
    //         });
    //     }
    // };

    // const selectAllClasses = () => {
    //     const all = classList.map(c => c.asmcL_Id.toString());

    //     if (watchedClassIds.length === all.length) {
    //         setValue('classIds', undefined as any);
    //     } else {
    //         setValue('classIds', all as [string, ...string[]], {
    //             shouldValidate: true
    //         });
    //     }
    // };

    // // Day multi-select handlers
    // const toggleDay = (id: string) => {
    //     let updated = [];

    //     if (watchedDayIds.includes(id)) {
    //         updated = watchedDayIds.filter((v: string) => v !== id);
    //     } else {
    //         updated = [...watchedDayIds, id];
    //     }

    //     if (updated.length === 0) {
    //         setValue('dayIds', undefined as any);
    //     } else {
    //         setValue('dayIds', updated as [string, ...string[]], {
    //             shouldValidate: true
    //         });
    //     }
    // };

    // const selectAllDays = () => {
    //     const all = masterDays?.data?.map(d => d.ttmD_Id.toString()) || [];

    //     if (watchedDayIds.length === all.length) {
    //         setValue('dayIds', undefined as any);
    //     } else {
    //         setValue('dayIds', all as [string, ...string[]], {
    //             shouldValidate: true
    //         });
    //     }
    // };

    // // Filter classes based on search
    // const filteredClasses = classList.filter(c =>
    //     c.asmcL_ClassName?.toLowerCase().includes(classSearch.toLowerCase())
    // );

    // // Filter days based on search
    // const filteredDays = masterDays?.data?.filter(d =>
    //     d.ttmD_DayName?.toLowerCase().includes(daySearch.toLowerCase())
    // ) || [];

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                TTMPC_Id: 0,
                // temp_period_Array: periods.map((p) => ({
                //     ttmP_Id: p.ttmP_Id,
                //     ttmP_PeriodName: p.ttmP_PeriodName
                // })),
                ASMAY_Id: data.asmay_id
                // Temp_class_Array: data.classIds.map((c) => ({
                //     asmcL_Id: c.asmcL_Id,
                //     asmcL_ClassName: c.asmcL_ClassName,
                //     class: true // Mimic legacy structure if needed
                // }))
            };

            const response = await savePeriodClass(payload);
            if (response.returnval) {
                // if (data.classIds.length > 1) {
                //     toast.warning('Select Only One Class !!!'); // Mimic legacy behavior/alert if needed, though successfully saved maybe?
                //     // Legacy code: if (promise.returnval === true) { ... if ($scope.checkclaaslst.length > 1) { swal('Select Only One Class !!!'); } ... }
                //     // Does it actually prevent save? Logic seems mixed in legacy.
                //     // It says "Data successfully Saved" otherwise.
                // } else {
                //     toast.success('Data successfully Saved');
                // }
                onSuccess?.();
            } else if (response.returnduplicatestatus === 'Duplicate') {
                toast.error('Records Already Exist !');
            } else {
                toast.error('Data Not Saved !');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmay_id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                key={field.value || 'empty'}
                                onValueChange={(value) => {
                                    field.onChange(Number(value) || '');
                                }}
                                value={field.value?.toString() || undefined}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading Academic Years...
                                        </SelectItem>
                                    ) : academicError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading Academic Years...
                                        </SelectItem>
                                    ) : (
                                        academicList?.data?.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmay_id && <span className='text-red-500 text-sm'>{errors.asmay_id.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Category Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='ttmC_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                key={field.value || 'empty'}
                                onValueChange={(value) => {
                                    field.onChange(Number(value) || '');
                                }}
                                value={field.value?.toString() || undefined}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading CategoryData
                                        </SelectItem>
                                    ) : academicError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading CategoryData
                                        </SelectItem>
                                    ) : (
                                        categoryList?.data?.map((item) => (
                                            <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                {item.ttmC_CategoryName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ttmC_Id && <span className='text-red-500 text-sm'>{errors.ttmC_Id.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='calssids'
                        render={({ field }) => (
                            <MultiSelect
                                options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                defaultValue={field.value?.map((v: any) => v.asmcL_Id.toString()) || []}
                                onValueChange={(vals) => {
                                    const selectedObjs = vals
                                        .map((id) => {
                                            const found = classList.find((c) => c.asmcL_Id.toString() === id);
                                            return found ? { asmcL_Id: found.asmcL_Id, asmcL_ClassName: found.asmcL_ClassName } : null;
                                        })
                                        .filter((x) => x);
                                    field.onChange(selectedObjs);
                                }}
                                placeholder='Select Classes'
                            />
                        )}
                    />
                    {errors.calssids && <span className='text-red-500 text-sm'>{errors.calssids.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Day <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='calssids'
                        render={({ field }) => (
                            <MultiSelect
                                options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                defaultValue={field.value?.map((v: any) => v.asmcL_Id.toString()) || []}
                                onValueChange={(vals) => {
                                    const selectedObjs = vals
                                        .map((id) => {
                                            const found = classList.find((c) => c.asmcL_Id.toString() === id);
                                            return found ? { asmcL_Id: found.asmcL_Id, asmcL_ClassName: found.asmcL_ClassName } : null;
                                        })
                                        .filter((x) => x);
                                    field.onChange(selectedObjs);
                                }}
                                placeholder='Select Classes'
                            />
                        )}
                    />
                    {errors.calssids && <span className='text-red-500 text-sm'>{errors.calssids.message}</span>}
                </div>
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save Master Day Class Wise
                    </div>
                </Button>
            </div>
        </form>
    );
}
