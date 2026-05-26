'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type * as z from 'zod';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { employeeAbsentReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { addMonths } from 'date-fns';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface AddEmployeeAbsentReportFormProps {
    onSuccess?: () => void;
    resolvedSearchParams?: any;
    isPageLoading?: boolean;
}

export default function AddEmployeeAbsentReportForm({
    onSuccess,
    resolvedSearchParams: searchParams,
    isPageLoading = false
}: AddEmployeeAbsentReportFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    const [resetkey, setResetKey] = useState(0);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting: isSubmittingForm }
    } = useForm<z.infer<typeof employeeAbsentReportFilterSchema>>({
        resolver: zodResolver(employeeAbsentReportFilterSchema),
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: '',
            fromDate: '',
            toDate: ''
        }
    });

    const isSubmitting = isSubmittingManual || isSubmittingForm || isPageLoading;
    const selectedTypes = watch('type');
    const selectedDepts = watch('department');
    const selectedDesigs = watch('designation');
    const allOrIndividual = watch('allOrIndividual');
    const fromDateValue = watch('fromDate');

    // Cascading data fetching using report-specific hooks
    const { data: groupTypesData, isLoading: isTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDeptLoading } = useReportDepartments(selectedTypes.join(','));
    const { data: designationsData, isLoading: isDesigLoading } = useReportDesignations(selectedTypes.join(','), selectedDepts.join(','));
    const { data: employeesData, isLoading: isEmpLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        selectedTypes.map(Number),
        selectedDepts.map(Number),
        selectedDesigs.map(Number)
    );
    // Derived options - accessing .data property from the ApiResponse with robust key fallbacks
    const typeOptions = useMemo(
        () =>
            groupTypesData?.data?.map((t: any) => ({
                label: t.value || t.hrmgT_EmployeeGroupType || 'Unknown Type',
                value: String(t.key || t.hrmgT_Id)
            })) || [],
        [groupTypesData]
    );

    const deptOptions = useMemo(
        () =>
            departmentsData?.data?.map((d: any) => ({
                label: d.value || d.hrmD_DepartmentName || d.hrmd_departmentName || 'Unknown Dept',
                value: String(d.key || d.hrmD_Id || d.hrmd_id)
            })) || [],
        [departmentsData]
    );

    const desigOptions = useMemo(
        () =>
            designationsData?.data?.map((d: any) => ({
                label: d.value || d.hrmdeS_DesignationName || d.hrmdes_designationName || 'Unknown Desig',
                value: String(d.key || d.hrmdeS_Id || d.hrmdes_id)
            })) || [],
        [designationsData]
    );

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const employeeName = emp.employeeFullName;

                const employeeCode = id;

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    // Handle cascading resets
    useEffect(() => {
        if (selectedTypes.length === 0) setValue('department', []);
    }, [selectedTypes, setValue]);
    useEffect(() => {
        if (selectedDepts.length === 0) setValue('designation', []);
    }, [selectedDepts, setValue]);
    useEffect(() => {
        if (selectedDesigs.length === 0) setValue('employeeIds', '');
    }, [selectedDesigs, setValue]);

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    async function onSubmit(values: z.infer<typeof employeeAbsentReportFilterSchema>) {
        try {
            setIsSubmittingManual(true);
            const params = new URLSearchParams();
            params.set('type', values.type.join(','));
            params.set('department', values.department.join(','));
            params.set('designation', values.designation.join(','));
            params.set('allOrIndividual', values.allOrIndividual);

            // Map employee IDs based on selection
            let hrme_ids = '0';
            if (values.allOrIndividual === 'Individual' && values.employeeIds) {
                hrme_ids = values.employeeIds.toString();
            } else if (values.allOrIndividual === 'All' && employeesDataTransformed.length > 0) {
                hrme_ids = employeesDataTransformed.map((emp: any) => emp.id).join(',');
            }
            params.set('employee', hrme_ids);

            params.set('fromDate', values.fromDate);
            params.set('toDate', values.toDate);

            router.push(`${pathname}?${params.toString()}`);
            onSuccess?.();
        } catch (_error) {
            toast.error('Failed to generate report');
        } finally {
            // Small delay to ensure isPageLoading has a chance to kick in
            setTimeout(() => setIsSubmittingManual(false), 500);
        }
    }

    const handleReset = () => {
        reset({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: '',
            fromDate: '',
            toDate: ''
        });
        router.push(pathname);
        setResetKey((prev) => prev + 1);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Group Type */}
                <div className='col-span-1'>
                    <Label className='mb-2 block font-medium text-sm'>
                        Group Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        key={resetkey}
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={typeOptions}
                                onValueChange={(values) => field.onChange(values)}
                                defaultValue={field.value || []}
                                placeholder={isTypesLoading ? 'Loading...' : 'Select Group Types'}
                                className={`w-full ${errors.type ? 'border-red-500' : ''} ${isTypesLoading || typeOptions.length === 0 ? 'cursor-not-allowed' : ''}`}
                                maxHeight={240}
                                disabled={isTypesLoading || typeOptions.length === 0}
                            />
                        )}
                    />
                    {errors.type && <FormError>{errors.type.message}</FormError>}
                </div>

                {/* Department */}
                <div className='col-span-1'>
                    <Label className='mb-2 block font-medium text-sm'>
                        Department <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        key={resetkey}
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={deptOptions}
                                onValueChange={(values) => field.onChange(values)}
                                defaultValue={field.value || []}
                                placeholder={isDeptLoading ? 'Loading...' : 'Select Departments'}
                                className={`w-full ${errors.department ? 'border-red-500' : ''} ${isDeptLoading || deptOptions.length === 0 ? 'cursor-not-allowed' : ''}`}
                                maxHeight={240}
                                disabled={isDeptLoading || deptOptions.length === 0}
                            />
                        )}
                    />
                    {errors.department && <FormError>{errors.department.message}</FormError>}
                </div>

                {/* Designation */}
                <div className='col-span-1'>
                    <Label className='mb-2 block font-medium text-sm'>
                        Designation <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        key={resetkey}
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={desigOptions}
                                onValueChange={(values) => field.onChange(values)}
                                defaultValue={field.value || []}
                                placeholder={isDesigLoading ? 'Loading...' : 'Select Designations'}
                                className={`w-full ${errors.designation ? 'border-red-500' : ''} ${isDesigLoading || desigOptions.length === 0 ? 'cursor-not-allowed' : ''}`}
                                maxHeight={240}
                                disabled={isDesigLoading || desigOptions.length === 0}
                            />
                        )}
                    />
                    {errors.designation && <FormError>{errors.designation.message}</FormError>}
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Employee Selection */}
                <div className='col-span-1 space-y-4 rounded-lg border bg-muted/30 p-4'>
                    <div className='space-y-3'>
                        <Label className='block font-medium text-sm'>Employee Filter</Label>
                        <Controller
                            key={resetkey}
                            name='allOrIndividual'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='All' id='all' />
                                        <Label htmlFor='all' className='font-normal'>
                                            All Employees
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Individual' id='individual' />
                                        <Label htmlFor='individual' className='font-normal'>
                                            Individual
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                    </div>

                    {allOrIndividual === 'Individual' && (
                        <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>
                                Select Employees <span className='text-red-500'>*</span>
                            </Label>
                            {/* <Controller
                            key={resetkey}
                                name="employeeIds"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={empOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={
                                            isEmpLoading ? "Loading..." : "Select Employees"
                                        }
                                        disabled={selectedDesigs.length === 0}
                                        className={errors.employeeIds ? "border-red-500" : ""}
                                    />
                                )}
                            /> */}
                            <Controller
                                name='employeeIds'
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value || ''} onValueChange={field.onChange}>
                                        <SelectTrigger className={errors.employeeIds ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isEmpLoading ? 'Loading...' : 'Select Employee'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeesDataTransformed.length === 0 ? (
                                                <div className='p-4 text-center text-muted-foreground text-sm'>
                                                    No employees found for the selected criteria.
                                                </div>
                                            ) : (
                                                (employeesDataTransformed as any[]).map((emp: any) => {
                                                    return (
                                                        <SelectItem key={emp.id} value={emp.id?.toString() || ''}>
                                                            {emp.employeeName} - [{emp.employeeCode}]
                                                        </SelectItem>
                                                    );
                                                })
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.employeeIds && <FormError>{errors.employeeIds.message}</FormError>}
                        </div>
                    )}
                </div>

                {/* Date Range */}
                <div className='col-span-1 grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label className='block font-medium text-sm'>
                            From Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            key={resetkey}
                            name='fromDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date: Date | undefined) => {
                                        field.onChange(date?.toISOString());
                                        if (date) {
                                            const nextMonthDate = addMonths(date, 1);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const effectiveToDate = nextMonthDate < today ? nextMonthDate : today;
                                            const _nextYear = effectiveToDate.getFullYear();
                                            const _nextMonth = String(effectiveToDate.getMonth() + 1).padStart(2, '0');
                                            const _nextDay = String(effectiveToDate.getDate()).padStart(2, '0');
                                            // setValue('toDate', `${nextYear}-${nextMonth}-${nextDay}`);
                                        } else {
                                            setValue('toDate', '');
                                        }
                                    }}
                                    placeholder='Select From Date'
                                    className={errors.fromDate ? 'border-red-500' : ''}
                                    disabled={[{ after: today }]}
                                />
                            )}
                        />
                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label className='block font-medium text-sm'>
                            To Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            key={resetkey}
                            name='toDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date: Date | undefined) => field.onChange(date?.toISOString())}
                                    placeholder='Select To Date'
                                    className={errors.toDate ? 'border-red-500' : ''}
                                    disabled={fromDateObject ? [{ before: fromDateObject }, { after: today }] : [{ after: today }]}
                                />
                            )}
                        />
                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:justify-end'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    className='px-8 shadow-sm hover:bg-muted'
                    disabled={isSubmitting}>
                    <RotateCcw className='mr-2 h-4 w-4' /> Reset
                </Button>
                <Button
                    type='submit'
                    className='bg-primary px-8 text-primary-foreground shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg'
                    disabled={isSubmitting || isTypesLoading}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating...
                        </>
                    ) : (
                        <>
                            <Search className='mr-2 h-4 w-4' /> Get Report
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
