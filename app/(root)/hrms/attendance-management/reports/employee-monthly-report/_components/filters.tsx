'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { employeeMonthlyReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type EmployeeMonthlyReportFilters = z.infer<typeof employeeMonthlyReportFilterSchema>;

interface EmployeeMonthlyReportFiltersProps {
    filters: EmployeeMonthlyReportFilters;
    branches: string[];
    departments: string[];
    designations: string[];
    groupTypes?: Array<{ label: string; value: string }>;
    employees?: Array<{ label: string; value: string }>;
    onFilterChange: (filters: EmployeeMonthlyReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeMonthlyReportFilters({
    filters,
    branches,
    departments,
    designations,
    groupTypes = [],
    employees = [],
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: EmployeeMonthlyReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<EmployeeMonthlyReportFilters>({
        resolver: zodResolver(employeeMonthlyReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    // Watch the allOrIndividual field to reactively show/hide employee dropdown
    const allOrIndividualValue = watch('allOrIndividual') || filters.allOrIndividual;
    const employeeNameValue = watch('employeeName') || filters.employeeName || '';
    const reportOptionsValue = watch('reportOptions') || filters.reportOptions || [];

    // Sync form when filters prop changes from parent
    useEffect(() => {
        setValue('allOrIndividual', filters.allOrIndividual, { shouldDirty: false, shouldValidate: false });
        setValue('type', filters.type || [], { shouldDirty: false, shouldValidate: false });
        setValue('department', filters.department || [], { shouldDirty: false, shouldValidate: false });
        setValue('designation', filters.designation || [], { shouldDirty: false, shouldValidate: false });
        setValue('employeeName', filters.employeeName || '', { shouldDirty: false, shouldValidate: false });
        setValue('fromDate', filters.fromDate || '', { shouldDirty: false, shouldValidate: false });
        setValue('toDate', filters.toDate || '', { shouldDirty: false, shouldValidate: false });
        setValue('reportOptions', filters.reportOptions || [], { shouldDirty: false, shouldValidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.allOrIndividual,
        filters.type?.join(','),
        filters.department?.join(','),
        filters.designation?.join(','),
        filters.employeeName,
        filters.fromDate,
        filters.toDate,
        filters.reportOptions?.join(',')
    ]);

    const handleFilterChange = (key: keyof EmployeeMonthlyReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const handleReportOptionToggle = (
        option: 'Total Working Days' | 'Show Holiday Punch' | 'Format One' | 'Date Of Joining' | 'Total Absent Days'
    ) => {
        const currentOptions = reportOptionsValue;
        const newOptions = currentOptions.includes(option) ? currentOptions.filter((o) => o !== option) : [...currentOptions, option];
        handleFilterChange('reportOptions', newOptions);
    };

    const onSubmit = (data: EmployeeMonthlyReportFilters) => {
        onFilterChange(data);
        onSearch();
    };

    const reportOptionsList: Array<{
        label: string;
        value: 'Total Working Days' | 'Show Holiday Punch' | 'Format One' | 'Date Of Joining' | 'Total Absent Days';
    }> = [
        { label: 'Total Working Days', value: 'Total Working Days' },
        { label: 'Show Holiday Punch', value: 'Show Holiday Punch' },
        { label: 'Format One', value: 'Format One' },
        { label: 'Date Of Joining', value: 'Date Of Joining' },
        { label: 'Total Absent Days', value: 'Total Absent Days' }
    ];

    return (
        <CollapsibleSection
            title='EMPLOYEE MONTHLY REPORT'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='type'>
                            Type <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            options={
                                groupTypes.length > 0
                                    ? groupTypes
                                    : [
                                          { label: 'Teaching', value: 'Teaching' },
                                          { label: 'Non Teaching', value: 'Non Teaching' },
                                          { label: 'Administrative', value: 'Administrative' }
                                      ]
                            }
                            onValueChange={(values) => handleFilterChange('type', values)}
                            defaultValue={filters.type || []}
                            placeholder='Select Types'
                            className={`w-full ${errors.type ? 'border-red-500' : ''}`}
                            maxHeight={240}
                        />
                        {errors.type && <FormError>{errors.type.message}</FormError>}
                    </div>
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='department'>
                            Department <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            options={departments.map((d) => ({ label: d, value: d }))}
                            onValueChange={(values) => handleFilterChange('department', values)}
                            defaultValue={filters.department || []}
                            placeholder='Select Departments'
                            className={`w-full ${errors.department ? 'border-red-500' : ''}`}
                            maxHeight={240}
                        />
                        {errors.department && <FormError>{errors.department.message}</FormError>}
                    </div>
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='designation'>
                            Designation <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            options={designations.map((d) => ({ label: d, value: d }))}
                            onValueChange={(values) => handleFilterChange('designation', values)}
                            defaultValue={filters.designation || []}
                            placeholder='Select Designations'
                            className={`w-full ${errors.designation ? 'border-red-500' : ''}`}
                            maxHeight={240}
                        />
                        {errors.designation && <FormError>{errors.designation.message}</FormError>}
                    </div>

                    <div className='md:col-span-3'>
                        <label className='mb-2 block font-medium text-sm'>
                            Employee <span className='text-red-500'>*</span>
                        </label>
                        <RadioGroup
                            value={allOrIndividualValue}
                            onValueChange={(value) => handleFilterChange('allOrIndividual', value as 'All' | 'Individual')}
                            className='flex flex-row gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='All' id='all' />
                                <Label htmlFor='all' className='cursor-pointer'>
                                    All
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='Individual' id='individual' />
                                <Label htmlFor='individual' className='cursor-pointer'>
                                    Individual
                                </Label>
                            </div>
                        </RadioGroup>
                        {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                    </div>

                    {/* Employee Dropdown - Only show when Individual is selected */}
                    {allOrIndividualValue === 'Individual' && (
                        <div className='md:col-span-3'>
                            <label htmlFor='employee-select' className='font-medium text-sm'>
                                Employee <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={employeeNameValue || undefined}
                                onValueChange={(value) => handleFilterChange('employeeName', value)}>
                                <SelectTrigger id='employee-select' className={errors.employeeName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.length > 0 ? (
                                        employees.map((emp) => (
                                            <SelectItem key={emp.value} value={emp.value}>
                                                {emp.label}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value='EMP001'>John Doe (EMP001)</SelectItem>
                                            <SelectItem value='EMP002'>Jane Smith (EMP002)</SelectItem>
                                            <SelectItem value='EMP003'>Bob Johnson (EMP003)</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.employeeName && <FormError>{errors.employeeName.message}</FormError>}
                        </div>
                    )}

                    <div className='md:col-span-3'>
                        <label htmlFor='from-date-input' className='font-medium text-sm'>
                            From Date <span className='text-red-500'>*</span>
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id='from-date-input'
                                    variant='outline'
                                    className={cn(
                                        'mt-0 w-full justify-start text-left font-normal',
                                        !filters.fromDate && 'text-muted-foreground',
                                        errors.fromDate && 'border-red-500'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.fromDate ? format(new Date(filters.fromDate), 'dd-MM-yyyy') : 'Enter date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <CalendarYear
                                    mode='single'
                                    selected={filters.fromDate ? new Date(filters.fromDate) : undefined}
                                    onDayClick={(day) => {
                                        if (day) {
                                            const dateStr = format(day, 'yyyy-MM-dd');
                                            handleFilterChange('fromDate', dateStr);
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                    </div>
                    <div className='md:col-span-3'>
                        <label htmlFor='to-date-input' className='font-medium text-sm'>
                            To Date <span className='text-red-500'>*</span>
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id='to-date-input'
                                    variant='outline'
                                    className={cn(
                                        'mt-0 w-full justify-start text-left font-normal',
                                        !filters.toDate && 'text-muted-foreground',
                                        errors.toDate && 'border-red-500'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.toDate ? format(new Date(filters.toDate), 'dd-MM-yyyy') : 'Enter date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <CalendarYear
                                    mode='single'
                                    selected={filters.toDate ? new Date(filters.toDate) : undefined}
                                    onDayClick={(day) => {
                                        if (day) {
                                            const dateStr = format(day, 'yyyy-MM-dd');
                                            handleFilterChange('toDate', dateStr);
                                        }
                                    }}
                                    fromDate={filters.fromDate ? new Date(filters.fromDate) : undefined}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                    </div>

                    {/* Report Options Checkboxes */}
                    <div className='md:col-span-12'>
                        <label className='mb-2 block font-medium text-sm'>Report Options</label>
                        <div className='flex flex-wrap gap-4'>
                            {reportOptionsList.map((option) => (
                                <div key={option.value} className='flex items-center space-x-2'>
                                    <Checkbox
                                        id={option.value}
                                        checked={reportOptionsValue.includes(option.value)}
                                        onCheckedChange={() => handleReportOptionToggle(option.value)}
                                    />
                                    <Label htmlFor={option.value} className='cursor-pointer font-normal text-sm'>
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='flex items-end gap-2 md:col-span-12'>
                        <Button type='submit' variant='default'>
                            <RefreshCw className='mr-2 h-4 w-4' /> REPORT
                        </Button>
                        <Button type='button' variant='outline' onClick={onCancel}>
                            <X className='mr-2 h-4 w-4' /> CANCEL
                        </Button>
                    </div>
                </div>
            </form>
        </CollapsibleSection>
    );
}
