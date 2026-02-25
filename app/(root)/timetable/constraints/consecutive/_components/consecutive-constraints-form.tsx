'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useCategoryDropDownMasterDayClasswise,
    useClassDropDownMasterDayClasswise,
    useConsecutive,
    useSectionDropDownMasterDayClasswise,
    useStaffDropDownMasterDayClasswise,
    useSubjectDropDownMasterDayClasswise
} from '@/hooks/timetable/constraints/consecutive';
import { consecutiveConstraintsSchema } from '@/schemas/timetable/constraints/consecutive';
import { getConsecutiveConstraintsEditDetails, saveConsecutiveConstraintsDetail } from '@/server/timetable/constraints/consecutive';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof consecutiveConstraintsSchema.save>;

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
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
        'consecutivelstedit'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }
    return [];
};

interface ConsecutiveConstraintsFormProps {
    editData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ConsecutiveConstraintsForm({ editData, onSuccess, onCancel }: ConsecutiveConstraintsFormProps) {
    const { refetchAll } = useConsecutive();

    const form = useForm<FormFields>({
        resolver: zodResolver(consecutiveConstraintsSchema.save),
        mode: 'onChange',
        defaultValues: {
            TTC_Id: 0,
            ASMAY_Id: undefined,
            TTMC_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            HRME_Id: undefined,
            ISMS_Id: undefined,
            TTC_NoOfConDays: 1,
            TTC_NoOfConPeriods: 1,
            TTC_NoOfPeriods: 1,
            TTC_BefAftApplFlag: false,
            TTC_BefAftFalg: '',
            TTC_BefAftPeriod: 0
        }
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const watchedConDays = watch('TTC_NoOfConDays');
    const watchedConPeriods = watch('TTC_NoOfConPeriods');
    const watchedBefAftFlag = watch('TTC_BefAftApplFlag');

    // Cascading Hooks
    const { data: academicData, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const academicList = extractList(academicData, 'academiclist');

    const { data: categoryData } = useCategoryDropDownMasterDayClasswise();
    const categoryList = extractList(categoryData, 'catelist');

    const { data: classData } = useClassDropDownMasterDayClasswise();
    const classList = extractList(classData, 'classlist');

    const { data: sectionData } = useSectionDropDownMasterDayClasswise();
    const sectionList = extractList(sectionData, 'sectionlist');

    const { data: staffData } = useStaffDropDownMasterDayClasswise();
    const staffList = extractList(staffData, 'stafflist');

    const { data: subjectData } = useSubjectDropDownMasterDayClasswise();
    const subjectList = extractList(subjectData, 'subjectlist');

    const handleAcademicYearChange = (yearId: number) => {
        setValue('ASMAY_Id', yearId);
        setValue('TTMC_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleCategoryChange = (categoryId: number) => {
        setValue('TTMC_Id', categoryId);
        setValue('ASMCL_Id', 0);
    };

    // Calculate Total Periods
    useEffect(() => {
        const days = Number(watchedConDays) || 0;
        const periods = Number(watchedConPeriods) || 0;
        setValue('TTC_NoOfPeriods', days * periods);
    }, [watchedConDays, watchedConPeriods, setValue]);

    // Edit Mode
    useEffect(() => {
        const fetchEditDetails = async () => {
            const editId = editData?.ttC_Id || (Array.isArray(editData) && editData[0]?.ttC_Id);
            if (editId) {
                try {
                    const apiResponse = await getConsecutiveConstraintsEditDetails(editId);
                    const editRecord = extractList(apiResponse, 'consecutivelstedit')?.[0];

                    if (editRecord) {
                        reset({
                            TTC_Id: editRecord.ttC_Id,
                            ASMAY_Id: editRecord.asmaY_Id,
                            TTMC_Id: editRecord.ttmC_Id,
                            ASMCL_Id: editRecord.asmcL_Id,
                            ASMS_Id: editRecord.asmS_Id,
                            HRME_Id: editRecord.hrmE_Id,
                            ISMS_Id: editRecord.ismS_Id,
                            TTC_NoOfConDays: editRecord.ttC_NoOfConDays,
                            TTC_NoOfConPeriods: editRecord.ttC_NoOfConPeriods,
                            TTC_NoOfPeriods: editRecord.ttC_NoOfConPeriods * editRecord.ttC_NoOfConDays,
                            TTC_BefAftApplFlag: editRecord.ttC_BefAftApplFlag === 1,
                            TTC_BefAftFalg: editRecord.ttC_BefAftFalg ? String(editRecord.ttC_BefAftFalg) : '',
                            TTC_BefAftPeriod: editRecord.ttC_BefAftPeriod
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch edit details', err);
                    toast.error('Failed to load record details');
                }
            }
        };

        if (editData) {
            fetchEditDetails();
        }
    }, [editData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                TTC_BefAftApplFlag: data.TTC_BefAftApplFlag ? 1 : 0,
                TTC_AllotPeriods: data.TTC_NoOfPeriods,
                TTC_RemPeriods: data.TTC_NoOfPeriods,
                TTC_AllotedFlag: 'N'
            };

            const res = await saveConsecutiveConstraintsDetail(payload);
            if (res.returnval === true) {
                toast.success(editData ? 'Updated Successfully' : 'Saved Successfully');
                refetchAll();
                onSuccess?.();
            } else if (res.returnduplicatestatus === 'Duplicate') {
                toast.warning('Record Already Exists');
            } else {
                toast.error('Failed to Save');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleAcademicYearChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            academicList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => setValue('ASMCL_Id', Number(val))} value={field.value?.toString()}>
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
                            )}
                        />
                        {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Staff <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='HRME_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => setValue('HRME_Id', Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                {item.staffName || item.hrmE_EmployeeFirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRME_Id && <FormError>{errors.HRME_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Days <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConDays')} error={errors.TTC_NoOfConDays?.message} />
                    </div>
                </div>

                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Category <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='TTMC_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleCategoryChange(Number(val))} value={field.value?.toString()}>
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
                        {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMS_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => setValue('ASMS_Id', Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmS_SectionName || item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Subject <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ISMS_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => setValue('ISMS_Id', Number(val))} value={field.value?.toString()}>
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
                        {errors.ISMS_Id && <FormError>{errors.ISMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Periods <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConPeriods')} error={errors.TTC_NoOfConPeriods?.message} />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>Calculated Total Periods</Label>
                    <InputText {...register('TTC_NoOfPeriods')} disabled className='bg-gray-100' />
                </div>
            </div>

            <div className='mt-4 space-y-4 rounded-md border bg-gray-50 p-4'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        control={control}
                        name='TTC_BefAftApplFlag'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='ba_flag' />}
                    />
                    <Label htmlFor='ba_flag' className='font-semibold'>
                        Before After Consecutive
                    </Label>
                </div>

                {watchedBefAftFlag && (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='TTC_BefAftFalg'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Before</SelectItem>
                                            <SelectItem value='2'>After</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.TTC_BefAftFalg && <FormError>{errors.TTC_BefAftFalg.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Period <span className='text-red-500'>*</span>
                            </Label>
                            <InputText type='number' {...register('TTC_BefAftPeriod')} error={errors.TTC_BefAftPeriod?.message} />
                        </div>
                    </div>
                )}
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting} className='order-2 w-fit sm:order-1'>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting} className='order-1 w-fit sm:order-2' isLoading={isSubmitting}>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' /> {editData ? 'Update' : 'Save'}
                    </div>
                </Button>
            </div>
        </form>
    );
}
