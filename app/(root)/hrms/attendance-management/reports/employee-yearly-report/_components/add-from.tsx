'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { cn } from '@/lib/utils';
import { employeeYearlyReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeYearlyReport } from '@/server/hrms/hrmsConfig/reports/employee-yearly-report';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addMonths } from 'date-fns';
import { Save } from 'lucide-react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeYearlyReportFilterSchema>;

interface AddEmployeeYearlyReportFormProps {
    onSuccess?: () => void;
    className?: string;
    searchParams?: any;
    groupTypes?: Array<{ label: string; value: string }>;
}

export default function AddEmployeeYearlyReportForm({
    onSuccess,
    className = '',
    searchParams,
    groupTypes = []
}: AddEmployeeYearlyReportFormProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize form with searchParams if available
    const urlModes = useMemo(() => {
        const m = searchParams?.mode;
        return Array.isArray(m) ? m : m ? [m] : [];
    }, [searchParams?.mode]);

    const urlTypes = useMemo(() => {
        const t = searchParams?.type;
        return Array.isArray(t) ? t : t ? [t] : [];
    }, [searchParams?.type]);

    const urlDepartments = useMemo(() => {
        const d = searchParams?.department;
        return Array.isArray(d) ? d : d ? [d] : [];
    }, [searchParams?.department]);

    const urlDesignations = useMemo(() => {
        const d = searchParams?.designation;
        return Array.isArray(d) ? d : d ? [d] : [];
    }, [searchParams?.designation]);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        clearErrors,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeYearlyReportFilterSchema),
        mode: 'onChange',
        defaultValues: {
            type: urlTypes,
            department: urlDepartments,
            designation: urlDesignations,
            allOrIndividual: (searchParams?.allOrIndividual as any) || 'All',
            employee: (searchParams?.employee as string) || '',
            fromDate: (searchParams?.fromDate as string) || '',
            toDate: (searchParams?.toDate as string) || '',
            mode: urlModes
        }
    });

    const allOrIndividualValue = watch('allOrIndividual');
    const fromDateValue = watch('fromDate');

    const watchedType = watch('type') || [];
    const watchedDepartment = watch('department') || [];
    const watchedDesignation = watch('designation') || [];

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupTypeIds = useMemo(() => watchedType.map(Number).filter(Boolean), [watchedType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    const { data: groupTypesData } = useReportGroupTypes();
    const { data: departmentsData } = useReportDepartments(groupTypeIds.join(','));
    const { data: designationsData } = useReportDesignations(groupTypeIds.join(','), deptIds.join(','));
    const { data: employeesData } = useReportEmployeesByDeptAndDesignation(deptIds.join(','), desigIds.join(','));

    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const firstName = (emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '').trim();
                const middleName = (emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '').trim();
                const lastName = (emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '').trim();

                const employeeName =
                    [firstName, middleName, lastName].filter(Boolean).join(' ') ||
                    emp.value ||
                    emp.employeeName ||
                    'Unknown Employee';

                const employeeCode =
                    emp.HRME_EmployeeCode ||
                    emp.hrmE_EmployeeCode ||
                    emp.employeeCode ||
                    id.toString();

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            console.log('form data', data);

            // Determine comma-separated employee IDs or single ID
            let hrmeIds = '0';
            if (data.allOrIndividual === 'Individual') {
                hrmeIds = data.employee || '0';
            } else if (data.allOrIndividual === 'All') {
                const allIds = employeesDataTransformed.map((emp: any) => emp.id).join(',');
                hrmeIds = allIds || '0';
            }

            const payload = {
                fromdate: data.fromDate ? data.fromDate.split('T')[0] : '',
                todate: data.toDate ? data.toDate.split('T')[0] : '',
                multiplehrmeid: hrmeIds,
                type: 'yearly',
            };

            const response = await getEmployeeYearlyReport(payload, searchParams);

            if (response.success) {
                // Update search params in URL
                const params = new URLSearchParams(searchParams);
                params.set('fromDate', data.fromDate);
                params.set('toDate', data.toDate);
                params.set('employee', hrmeIds);
                params.set('allOrIndividual', data.allOrIndividual);

                // Clear existing multi-select params
                params.delete('type');
                params.delete('department');
                params.delete('designation');
                params.delete('mode');

                data.type.forEach(t => params.append('type', t));
                data.department.forEach(d => params.append('department', d));
                data.designation.forEach(d => params.append('designation', d));
                if (data.mode) {
                    data.mode.forEach(m => params.append('mode', m));
                }

                router.push(`${pathname}?${params.toString()}`);

                toast.success(response.message || 'Report generated successfully');

                // Update cache with new params
                const newSearchParams: any = {};
                params.forEach((value, key) => {
                    if (['type', 'department', 'designation', 'mode'].includes(key)) {
                        if (!newSearchParams[key]) newSearchParams[key] = [];
                        newSearchParams[key].push(value);
                    } else {
                        newSearchParams[key] = value;
                    }
                });
                queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT, newSearchParams], response);

                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employee: '',
            fromDate: '',
            toDate: '',
            mode: []
        }, {
            keepDefaultValues: false,
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsValid: false
        });
        setTimeout(() => {
            clearErrors();
            router.push(pathname);
        }, 0);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='rounded-lg bg-white p-6 shadow'>
                        <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-3'>
                            {/* Type */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Type <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='type'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypesDataTransformed.map((gt: any) => ({
                                                label: gt.name,
                                                value: String(gt.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder='Select Types'
                                            className={`w-full ${errors.type ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                        />
                                    )}
                                />
                                {errors.type && <FormError>{errors.type.message}</FormError>}
                            </div>

                            {/* Department */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Department <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentsDataTransformed.map((dept: any) => ({
                                                label: dept.name,
                                                value: String(dept.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder='Select Departments'
                                            className={`w-full ${errors.department ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                        />
                                    )}
                                />
                                {errors.department && <FormError>{errors.department.message}</FormError>}
                            </div>

                            {/* Designation */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Designation <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationsDataTransformed.map((desg: any) => ({
                                                label: desg.name,
                                                value: String(desg.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder='Select Designations'
                                            className={`w-full ${errors.designation ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                        />
                                    )}
                                />
                                {errors.designation && <FormError>{errors.designation.message}</FormError>}
                            </div>

                            {/* All/Individual */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    All / Individual <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='allOrIndividual'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.allOrIndividual ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All</SelectItem>
                                                <SelectItem value='Individual'>Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                            </div>

                            {/* Employee - Only show when Individual is selected */}
                            {allOrIndividualValue === 'Individual' && (
                                <div className='col-span-1'>
                                    <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Employee <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='employee'
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.employee ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder='Select Employee' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employeesDataTransformed.map((emp: any) => (
                                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                                            {emp.employeeName} - [{emp.employeeCode}]
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.employee && <FormError>{errors.employee.message}</FormError>}
                                </div>
                            )}

                            {/* From Date */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    From Date <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='fromDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                    const nextMonthDate = addMonths(date, 1);
                                                    const nextYear = nextMonthDate.getFullYear();
                                                    const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
                                                    const nextDay = String(nextMonthDate.getDate()).padStart(2, '0');
                                                    // setValue('toDate', `${nextYear}-${nextMonth}-${nextDay}`);
                                                } else {
                                                    field.onChange('');
                                                    setValue('toDate', '');
                                                }
                                            }}
                                            placeholder='From date'
                                            className={errors.fromDate ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                            </div>

                            {/* To Date */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    To Date <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='toDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                } else {
                                                    field.onChange('');
                                                }
                                            }}
                                            placeholder='To date'
                                            className={errors.toDate ? 'border-red-500' : ''}
                                            disabled={
                                                fromDateObject
                                                    ? [
                                                          { before: fromDateObject },
                                                          { after: today }
                                                      ]
                                                    : [{ after: today }]
                                            }
                                        />
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>

                            {/* Mode */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Mode</Label>
                                <Controller
                                    name='mode'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={[
                                                { label: 'Date Of Joining', value: 'Date Of Joining' },
                                                { label: 'Show Holiday Punch', value: 'Show Holiday Punch' },
                                                { label: 'Total working Day', value: 'Total working Day' }
                                            ]}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder='Select Mode'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
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
                        loadingText='Searching...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Search
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
