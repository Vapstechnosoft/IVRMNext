'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import {
    useBifurcationConstraints,
    usePeriodDropdown,
    useSectionDropdownBifurcationConstraints,
    useStaffDropdownBifurcationConstraints,
    useSubjectDropdownBifurcationConstraints,
    useTimeTableCategoryDropDownData
} from '@/hooks/timetable/useMasters';
import { bifurcationConstraintsSchema, combinationTempSchema } from '@/schemas/timetable/constraints/bifurcationconstraints';
import { getClassDetails, saveBifurcationConstraintsDetail } from '@/server/timetable/constraints/bifurcationconstraints';
import type { ClassDropdownDataTTBifurcation } from '@/types/timetable/constraints/bifurcationconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface BifurcationConstraintsFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type FormFields = z.infer<typeof bifurcationConstraintsSchema.save>;

export default function BifurcationConstraintsForm({ onSuccess, onCancel }: BifurcationConstraintsFormProps) {
    const { data: response, isLoading, error, refetchAll } = useBifurcationConstraints();
    // Local state for dropdowns
    const [classList, setClassList] = useState<ClassDropdownDataTTBifurcation[]>([]);
    // const [staffList, setStaffList] = useState<any[]>([]);
    // const [subjectList, setSubjectList] = useState<any[]>([]);
    // const [periodList, setPeriodList] = useState<any[]>([]);

    const form = useForm<FormFields>({
        resolver: zodResolver(bifurcationConstraintsSchema.save),
        mode: 'onChange',
        defaultValues: {
            TTB_ID: 0,
            ASMAY_Id: 0,
            TTMC_Id: 0,
            TTB_BifurcationName: '',
            TTB_NoOfPeriods: 0,
            TTB_BefAftApplFlag: false,
            TTB_BefAftFalg: '',
            TTMP_Id: 0,
            TTB_ConsecutiveFlag: false,
            TTB_NoOfConPeriods: 0,
            TTB_NoOfConDays: 0,
            combinationlist: [],
            ASMCL_Id_temp: 0,
            ASMS_Id_temp: 0,
            HRME_Id_temp: 0,
            ISMS_Id_temp: 0
        }
    });

    const {
        data: categorydropdowndata,
        isLoading: categorydropdownloading,
        error: categorydropdownerror,
        refetchAll: refetchAllCategory
    } = useTimeTableCategoryDropDownData();

    const {
        data: academicyeardata,
        isLoading: academicyearloading,
        error: academicyearerror,
        refetchAll: refetchAllAcademicYear
    } = usebifurcationAcademicYear();

    const { data: periodList, isLoading: perioddataloading, error: perioddataError, refetchAll: perioddataRefetch } = usePeriodDropdown();

    const {
        data: sectionListFromHook,
        isLoading: sectiondataloading,
        error: sectiondataError,
        refetchAll: sectiondataRefetch
    } = useSectionDropdownBifurcationConstraints();

    console.log('sectionListFromHook', sectionListFromHook);
    const {
        data: staffListNew,
        isLoading: staffdataloading,
        error: staffdataError,
        refetchAll: staffdataRefetch
    } = useStaffDropdownBifurcationConstraints();
    console.log('staffListNew', staffListNew);
    const {
        data: subjectListNew,
        isLoading: subjectdataloading,
        error: subjectdataError,
        refetchAll: subjectdataRefetch
    } = useSubjectDropdownBifurcationConstraints();


    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const handleReset = () => {
        reset();
        setClassList([]);
    };
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'combinationlist'
    });

    // Watchers
    const watchedAcademicYear = watch('ASMAY_Id');
    const watchedCategory = watch('TTMC_Id');
    const watchedBefAftFlag = watch('TTB_BefAftApplFlag');
    const watchedConsecutiveFlag = watch('TTB_ConsecutiveFlag');

    // Fetch Classes on Year/Category Change
    useEffect(() => {
        const fetchClassesHelper = async () => {
            if (watchedAcademicYear && watchedCategory) {
                console.log('watchedCategory', watchedCategory);
                try {
                    // Reset dependent fields when primary filters change
                    setValue('ASMCL_Id_temp', 0);
                    setValue('ASMS_Id_temp', 0);
                    setValue('HRME_Id_temp', 0);
                    setValue('ISMS_Id_temp', 0);
                    //  setStaffList([]);
                    //  setSubjectList([]);

                    const res = await getClassDetails(Number(watchedCategory));

                    if (res.success) {
                        setClassList(res.data || []);
                    } else {
                        setClassList([]);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                setClassList([]);
            }
        };
        fetchClassesHelper();
    }, [watchedAcademicYear, watchedCategory, setValue]);

    // Fetch Staff/Section on Class Selection (for Temp Row)
    const handleClassChange = async (classId: number) => {
        setValue('ASMS_Id_temp', 0);
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
        // setSectionList([]); // This will be handled by the new hook sectionListNew
        //   setStaffList([]);
        //setSubjectList([]);
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
        const watchedClass = watch('ASMCL_Id_temp');
        if (watchedClass && sectionId && watchedAcademicYear && watchedCategory) {
            const payload = {
                ASMAY_Id: watchedAcademicYear,
                TTMC_Id: watchedCategory,
                ASMCL_Id: watchedClass,
                ASMS_Id: sectionId
            };
            // const res = await getStaffSection(payload);
            // if (Array.isArray(res) && res.staffbyall && Array.isArray(res.staffbyall)) {
            //     setStaffList(res.staffbyall);
            // } else {
            //     setStaffList([]);
            //     toast.info('No Staff Allocated');
            // }
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('ISMS_Id_temp', 0);
        const watchedClass = watch('ASMCL_Id_temp');
        const watchedSection = watch('ASMS_Id_temp');
        if (watchedClass && watchedSection && staffId && watchedAcademicYear && watchedCategory) {
            const payload = {
                ASMAY_Id: watchedAcademicYear,
                TTMC_Id: watchedCategory,
                ASMCL_Id: watchedClass,
                ASMS_Id: watchedSection,
                HRME_Id: staffId
            };
            // const res = await getSubjectStaff(payload);
            // if (Array.isArray(res) && res.subjectbystaff && Array.isArray(res.subjectbystaff)) {
            //     setSubjectList(res.subjectbystaff);
            // } else {
            //     setSubjectList([]);
            //     toast.info('No Subject Mapped');
            // }
        }
    };

    const handleAddCombination = () => {
        const tempValues = {
            ASMCL_Id: watch('ASMCL_Id_temp'),
            ASMS_Id: watch('ASMS_Id_temp'),
            HRME_Id: watch('HRME_Id_temp'),
            ISMS_Id: watch('ISMS_Id_temp')
        };

        const result = combinationTempSchema.safeParse(tempValues);
        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }

        // Get Names for Display
        const className = classList.find((c) => c.asmcL_Id === tempValues.ASMCL_Id)?.asmcL_ClassName;
        const sectionName = sectionListFromHook?.data?.find((c: any) => c.asmS_Id === tempValues.ASMS_Id)?.asmC_SectionName;
        //     const staffName = staffList.find((c: any) => c.hrmE_Id === tempValues.HRME_Id)?.staffName;
        // const subjectName =
        //     subjectList.find((c: any) => c.ismS_Id === tempValues.ISMS_Id)?.ismS_SubjectName ||
        //     subjectList.find((c: any) => c.ismS_Id === tempValues.ISMS_Id)?.subjectName;

        append({
            ...tempValues,
            className,
            sectioname: sectionName
            //staffname: staffName,
            // subjectname: subjectName
        });

        // Reset Temp (Partial?)
        setValue('HRME_Id_temp', 0);
        setValue('ISMS_Id_temp', 0);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ttB_ID: data.TTB_ID || 0,
                ttB_Id: data.TTB_ID || 0,
                asmaY_Id: data.ASMAY_Id,
                ttmC_Id: data.TTMC_Id,
                ttB_NoOfPeriods: data.TTB_NoOfPeriods,
                ttB_BifurcationName: data.TTB_BifurcationName,
                ttB_BefAftApplFlag: data.TTB_BefAftApplFlag ? 1 : 0,
                ttB_BefAftFalg: data.TTB_BefAftFalg || '',
                ttmP_Id: data.TTMP_Id || 0,
                ttB_ConsecutiveFlag: data.TTB_ConsecutiveFlag ? 1 : 0,
                ttB_NoOfConPeriods: data.TTB_NoOfConPeriods || 0,
                ttB_NoOfConDays: data.TTB_NoOfConDays || 0,
                combinationlist: data.combinationlist.map((item) => ({
                    ttbD_Id: 0,
                    ttB_Id: data.TTB_ID || 0,
                    asmcL_Id: item.ASMCL_Id,
                    asmS_Id: item.ASMS_Id,
                    hrmE_Id: item.HRME_Id,
                    ismS_Id: item.ISMS_Id,
                    ttbD_ActiveFlag: true
                }))
            };

            console.info('Bifurcation Payload:', payload);
            const response = await saveBifurcationConstraintsDetail(payload);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year<span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='ASMAY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    // onValueChange={field.onChange}
                                    //  value={field.value}
                                    key={field.value || 'empty'}
                                    onValueChange={(value) => {
                                        field.onChange(value ? Number(value) : 0);
                                    }}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger className='h-11 border-purple-100'>
                                        <SelectValue placeholder='-- Select Year --' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicyearloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Years...
                                            </SelectItem>
                                        ) : (
                                            (
                                                (academicyeardata as any)?.data ||
                                                (Array.isArray(academicyeardata) ? academicyeardata : []) ||
                                                []
                                            ).map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <p className='text-red-500 text-xs'>{errors.ASMAY_Id.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Bifurcation Name <span className='text-red-500'>*</span>
                        </Label>
                        <InputText {...register('TTB_BifurcationName')} error={errors.TTB_BifurcationName?.message} />
                    </div>

                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                control={control}
                                name='TTB_BefAftApplFlag'
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='ba_flag' />}
                            />
                            <Label htmlFor='ba_flag' className='font-semibold'>
                                Before After Constraints
                            </Label>
                        </div>

                        {watchedBefAftFlag && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>
                                        Condition <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='TTB_BefAftFalg'
                                        render={({ field }) => (
                                            <Select
                                                key={field.value || 'empty'}
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Before'>Before</SelectItem>
                                                    <SelectItem value='After'>After</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.TTB_BefAftFalg && <FormError>{errors.TTB_BefAftFalg.message}</FormError>}
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
                                                key={field.value?.toString() || 'empty'}
                                                onValueChange={(value) => {
                                                    field.onChange(value ? Number(value) : '');
                                                }}
                                                value={field.value?.toString() || undefined}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Period' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perioddataloading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading Periods
                                                        </SelectItem>
                                                    ) : perioddataError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading Periods
                                                        </SelectItem>
                                                    ) : (
                                                        periodList?.data?.map((item) => (
                                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>
                                                                {item.ttmP_PeriodName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.TTMP_Id && <FormError>{errors.TTMP_Id.message}</FormError>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Category <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='TTMC_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorydropdownloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Categories
                                            </SelectItem>
                                        ) : categorydropdownerror ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Categories
                                            </SelectItem>
                                        ) : (
                                            categorydropdowndata?.data?.map((item) => (
                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                    {item.ttmC_CategoryName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            No of Period <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTB_NoOfPeriods')} error={errors.TTB_NoOfPeriods?.message} />
                    </div>

                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                control={control}
                                name='TTB_ConsecutiveFlag'
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='con_flag' />}
                            />
                            <Label htmlFor='con_flag' className='font-semibold'>
                                Consecutive Constraints
                            </Label>
                        </div>

                        {watchedConsecutiveFlag && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>
                                        No of Consecutive Period <span className='text-red-500'>*</span>
                                    </Label>
                                    <InputText
                                        type='number'
                                        {...register('TTB_NoOfConPeriods')}
                                        error={errors.TTB_NoOfConPeriods?.message}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        Day <span className='text-red-500'>*</span>
                                    </Label>
                                    <InputText type='number' {...register('TTB_NoOfConDays')} error={errors.TTB_NoOfConDays?.message} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className='my-4' />

            {/* Combination Section */}
            <div className='space-y-4'>
                <h3 className='font-medium text-lg'>Combination Details</h3>
                <div className='grid grid-cols-1 items-end gap-4 rounded-md border bg-gray-50 p-4 md:grid-cols-5'>
                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        handleClassChange(Number(val));
                                    }}
                                    value={field.value?.toString() || undefined}>
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
                    </div>
                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMS_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        handleSectionChange(Number(val));
                                    }}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectiondataloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (
                                            sectionListFromHook?.data?.map((item: any) => (
                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>
                            Staff <span className='text-red-500'>*</span>
                        </Label>

                        <Controller
                            control={control}
                            name='HRME_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffdataloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Staff
                                            </SelectItem>
                                        ) : staffdataError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Categories
                                            </SelectItem>
                                        ) : (
                                            staffListNew?.data?.map((item) => (
                                                <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                    {item.staffName}
                                                </SelectItem>
                                            ))
                                        )}
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
                            name='ISMS_Id_temp'
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectdataloading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading Subjects
                                            </SelectItem>
                                        ) : subjectdataError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading Subjects
                                            </SelectItem>
                                        ) : (
                                            subjectListNew?.data?.map((item) => (
                                                <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                    {item.ismS_SubjectName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='pb-2'>
                        <Button type='button' onClick={handleAddCombination} variant='secondary'>
                            <Plus className='mr-2 h-4 w-4' /> Add
                        </Button>
                    </div>
                </div>

                {errors.combinationlist && <FormError>{errors.combinationlist.message}</FormError>}
                {errors.combinationlist?.root && <FormError>{errors.combinationlist.root.message}</FormError>}

                {fields.length > 0 && (
                    <Table className='border'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Staff</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className='w-[80px]'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field: any, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{field.className}</TableCell>
                                    <TableCell>{field.sectioname}</TableCell>
                                    <TableCell>{field.staffname}</TableCell>
                                    <TableCell>{field.subjectname}</TableCell>
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
                        Save
                    </div>
                </Button>
            </div>

            {/* <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-1.5 h-4 w-4' /> {editData ? 'Update' : 'Save'}
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    Cancel
                </Button>
            </div> */}
        </form>
    );
}
