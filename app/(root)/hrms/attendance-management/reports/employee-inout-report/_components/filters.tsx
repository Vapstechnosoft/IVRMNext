'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeInOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, FileDown, Printer, RefreshCw, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import type { z } from 'zod';

export type EmployeeInOutReportFilters = z.infer<typeof employeeInOutReportFilterSchema>;

interface EmployeeInOutReportFiltersProps {
    filters: EmployeeInOutReportFilters;
    branches: string[];
    departments: Array<{ label: string; value: string }>;
    designations: Array<{ label: string; value: string }>;
    groupTypes?: Array<{ label: string; value: string }>;
    employees?: Array<{ label: string; value: string }>;
    onFilterChange: (filters: EmployeeInOutReportFilters) => void;
    onTypeChange?: (types: string[]) => void;
    onDepartmentChange?: (departments: string[]) => void;
    onDesignationChange?: (designations: string[]) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
    isLoadingDepartments?: boolean;
    isLoadingDesignations?: boolean;
    isLoadingEmployees?: boolean;
}

export function EmployeeInOutReportFilters({
    filters,
    branches: _branches,
    departments = [],
    designations = [],
    groupTypes = [],
    employees = [],
    onFilterChange,
    onTypeChange,
    onDepartmentChange,
    onDesignationChange,
    onSearch,
    onCancel,
    onExport: _onExport,
    onPrint: _onPrint,
    isLoadingDepartments = false,
    isLoadingDesignations = false,
    isLoadingEmployees = false
}: EmployeeInOutReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<EmployeeInOutReportFilters>({
        resolver: zodResolver(employeeInOutReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    // Watch the allOrIndividual and query fields to reactively show/hide employee dropdown
    // Use watch to get the current form value, which updates immediately when changed
    const allOrIndividualValue = watch('allOrIndividual') || filters.allOrIndividual;
    const queryValue = watch('query') || filters.query || '';
    
    // Watch form values for MultiSelect defaultValue to prevent reset issues
    const typeValue = watch('type') || filters.type || [];
    const departmentValue = watch('department') || filters.department || [];
    const designationValue = watch('designation') || filters.designation || [];

    // Sync form when filters prop changes from parent
    useEffect(() => {
        setValue('allOrIndividual', filters.allOrIndividual, { shouldDirty: false, shouldValidate: false });
        setValue('type', filters.type || [], { shouldDirty: false, shouldValidate: false });
        setValue('department', filters.department || [], { shouldDirty: false, shouldValidate: false });
        setValue('designation', filters.designation || [], { shouldDirty: false, shouldValidate: false });
        setValue('query', filters.query || '', { shouldDirty: false, shouldValidate: false });
        setValue('fromDate', filters.fromDate || '', { shouldDirty: false, shouldValidate: false });
        setValue('toDate', filters.toDate || '', { shouldDirty: false, shouldValidate: false });
        setValue('timeInTimeOut', filters.timeInTimeOut, { shouldDirty: false, shouldValidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.allOrIndividual, filters.type?.join(','), filters.department?.join(','), filters.designation?.join(','), filters.query, filters.fromDate, filters.toDate, filters.timeInTimeOut]);

    const handleFilterChange = (key: keyof EmployeeInOutReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: EmployeeInOutReportFilters) => {
        onFilterChange(data);
        onSearch();
    };

    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='type'>
                            Type
                        </label>
                        <MultiSelect
                            key={`type-${groupTypes.length}`}
                            options={groupTypes}
                            onValueChange={(values) => {
                                handleFilterChange('type', values);
                                // Clear dependent dropdowns when type changes
                                handleFilterChange('department', []);
                                handleFilterChange('designation', []);
                                handleFilterChange('query', '');
                                // Trigger cascading load - use setTimeout to prevent immediate re-render
                                setTimeout(() => {
                                    onTypeChange?.(values);
                                }, 0);
                            }}
                            defaultValue={Array.isArray(typeValue) ? typeValue.map(String) : []}
                            placeholder='Select Types'
                            className='w-full'
                            maxHeight={240}
                        />
                    </div>
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='department'>
                            Department <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            key={`dept-${departments.length}`}
                            options={departments}
                            onValueChange={(values) => {
                                handleFilterChange('department', values);
                                // Clear dependent dropdowns when department changes
                                handleFilterChange('designation', []);
                                handleFilterChange('query', '');
                                // Trigger cascading load - use setTimeout to prevent immediate re-render
                                setTimeout(() => {
                                    onDepartmentChange?.(values);
                                }, 0);
                            }}
                            defaultValue={Array.isArray(departmentValue) ? departmentValue.map(String) : []}
                            placeholder={isLoadingDepartments ? 'Loading...' : departments.length === 0 ? 'No departments available' : 'Select Departments'}
                            className={`w-full ${errors.department ? 'border-red-500' : ''}`}
                            maxHeight={240}
                            disabled={isLoadingDepartments || (typeValue?.length === 0 && groupTypes.length > 0)}
                        />
                        {errors.department && <FormError>{errors.department.message}</FormError>}
                    </div>
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='designation'>
                            Designation <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            key={`desg-${designations.length}`}
                            options={designations}
                            onValueChange={(values) => {
                                handleFilterChange('designation', values);
                                // Clear employee when designation changes
                                handleFilterChange('query', '');
                                // Trigger cascading load - use setTimeout to prevent immediate re-render
                                setTimeout(() => {
                                    onDesignationChange?.(values);
                                }, 0);
                            }}
                            defaultValue={Array.isArray(designationValue) ? designationValue.map(String) : []}
                            placeholder={isLoadingDesignations ? 'Loading...' : designations.length === 0 ? 'No designations available' : 'Select Designations'}
                            className={`w-full ${errors.designation ? 'border-red-500' : ''}`}
                            maxHeight={240}
                            disabled={isLoadingDesignations || (departmentValue?.length === 0 && departments.length > 0)}
                        />
                        {errors.designation && <FormError>{errors.designation.message}</FormError>}
                    </div>

                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='allOrIndividual'>
                            All / Individual <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={allOrIndividualValue}
                            onValueChange={(value) => handleFilterChange('allOrIndividual', value as 'All' | 'Individual')}>
                            <SelectTrigger id='allOrIndividual' className={errors.allOrIndividual ? 'border-red-500' : ''}>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='All'>All</SelectItem>
                                <SelectItem value='Individual'>Individual</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                    </div>
                    {/* Employee Dropdown - Only show when Individual is selected */}
                    {allOrIndividualValue === 'Individual' && (
                        <div className='md:col-span-3'>
                            <label className='font-medium text-sm' htmlFor='employee'>
                                Employee <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={queryValue || undefined}
                                onValueChange={(value) => handleFilterChange('query', value)}
                                disabled={isLoadingEmployees || employees.length === 0}>
                                <SelectTrigger id='employee' className={errors.query ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={isLoadingEmployees ? 'Loading...' : employees.length === 0 ? 'No employees available' : '--Select--'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingEmployees ? (
                                        <SelectItem value='loading' disabled>Loading...</SelectItem>
                                    ) : employees.length > 0 ? (
                                        employees.map((emp) => (
                                            <SelectItem key={emp.value} value={emp.value}>
                                                {emp.label}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value='no-data' disabled>No employees available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.query && <FormError>{errors.query.message}</FormError>}
                        </div>
                    )}
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='timeInTimeOut'>
                            Time In / Time Out
                        </label>
                        <Select
                            value={filters.timeInTimeOut}
                            onValueChange={(value) => handleFilterChange('timeInTimeOut', value as 'Time In' | 'Time Out' | 'In Out')}>
                            <SelectTrigger id='timeInTimeOut'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Time In'>Time In</SelectItem>
                                <SelectItem value='Time Out'>Time Out</SelectItem>
                                <SelectItem value='In Out'>In Out</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='fromDate'>
                            From Date <span className='text-red-500'>*</span>
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id='fromDate'
                                    variant='outline'
                                    className={cn(
                                        'mt-0 w-full justify-start text-left font-normal',
                                        !filters.fromDate && 'text-muted-foreground',
                                        errors.fromDate && 'border-red-500'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.fromDate ? format(new Date(filters.fromDate), 'dd-MM-yyyy') : 'Select date'}
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
                        <label className='font-medium text-sm' htmlFor='toDate'>
                            To Date <span className='text-red-500'>*</span>
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id='toDate'
                                    variant='outline'
                                    className={cn(
                                        'mt-0 w-full justify-start text-left font-normal',
                                        !filters.toDate && 'text-muted-foreground',
                                        errors.toDate && 'border-red-500'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.toDate ? format(new Date(filters.toDate), 'dd-MM-yyyy') : 'Select date'}
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
