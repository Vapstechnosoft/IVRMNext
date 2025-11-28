'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { employeeLateInEarlyOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type EmployeeLateInEarlyOutReportFilters = z.infer<typeof employeeLateInEarlyOutReportFilterSchema>;

interface EmployeeLateInEarlyOutReportFiltersProps {
    filters: EmployeeLateInEarlyOutReportFilters;
    departments: string[];
    designations: string[];
    types: string[];
    groupTypes?: Array<{ label: string; value: string }>;
    employees?: Array<{ label: string; value: string }>;
    onFilterChange: (filters: EmployeeLateInEarlyOutReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeLateInEarlyOutReportFilters({
    filters,
    departments,
    designations,
    types,
    groupTypes = [],
    employees = [],
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: EmployeeLateInEarlyOutReportFiltersProps) {
    // Debug logging for props
    useEffect(() => {}, [groupTypes, employees, filters]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<EmployeeLateInEarlyOutReportFilters>({
        resolver: zodResolver(employeeLateInEarlyOutReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    // Watch the allOrIndividual and query fields to reactively show/hide employee dropdown
    // Use watch to get the current form value, which updates immediately when changed
    const allOrIndividualValue = watch('allOrIndividual') || filters.allOrIndividual;
    const queryValue = watch('query') || filters.query || '';

    // Sync form when filters prop changes from parent
    useEffect(() => {
        setValue('allOrIndividual', filters.allOrIndividual, { shouldDirty: false, shouldValidate: false });
        setValue('type', filters.type || [], { shouldDirty: false, shouldValidate: false });
        setValue('department', filters.department || [], { shouldDirty: false, shouldValidate: false });
        setValue('designation', filters.designation || [], { shouldDirty: false, shouldValidate: false });
        setValue('query', filters.query || '', { shouldDirty: false, shouldValidate: false });
        setValue('fromDate', filters.fromDate || '', { shouldDirty: false, shouldValidate: false });
        setValue('toDate', filters.toDate || '', { shouldDirty: false, shouldValidate: false });
        setValue('mode', filters.mode || 'Late By', { shouldDirty: false, shouldValidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.allOrIndividual,
        filters.type?.join(','),
        filters.department?.join(','),
        filters.designation?.join(','),
        filters.query,
        filters.fromDate,
        filters.toDate,
        filters.mode
    ]);

    const handleFilterChange = (key: keyof EmployeeLateInEarlyOutReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: EmployeeLateInEarlyOutReportFilters) => {
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
                    <div className='md:col-span-4'>
                        <label className='font-medium text-sm' htmlFor='type'>
                            Type <span className='text-red-500'>*</span>
                        </label>
                        {(() => {
                            const options = groupTypes.length > 0 ? groupTypes : types.map((t: string) => ({ label: t, value: t }));
                            return (
                                <MultiSelect
                                    options={options}
                                    onValueChange={(values) => handleFilterChange('type', values)}
                                    defaultValue={filters.type || []}
                                    placeholder='Select Types'
                                    className={`w-full ${errors.type ? 'border-red-500' : ''}`}
                                    maxHeight={240}
                                />
                            );
                        })()}
                        {errors.type && <FormError>{errors.type.message}</FormError>}
                    </div>
                    <div className='md:col-span-4'>
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
                    <div className='md:col-span-4'>
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
                            {(() => {
                                return (
                                    <Select value={queryValue || undefined} onValueChange={(value) => handleFilterChange('query', value)}>
                                        <SelectTrigger id='employee' className={errors.query ? 'border-red-500' : ''}>
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
                                                    <SelectItem value='EMP004'>Alice Williams (EMP004)</SelectItem>
                                                    <SelectItem value='EMP005'>Charlie Brown (EMP005)</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                );
                            })()}
                            {errors.query && <FormError>{errors.query.message}</FormError>}
                        </div>
                    )}

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
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='mode'>
                            Mode <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={filters.mode}
                            onValueChange={(value) => handleFilterChange('mode', value as 'Late By' | 'Early Out' | 'Late In Early Out')}>
                            <SelectTrigger id='mode' className={errors.mode ? 'border-red-500' : ''}>
                                <SelectValue placeholder='Select Mode' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Late By'>Late BY</SelectItem>
                                <SelectItem value='Early Out'>Early Out</SelectItem>
                                <SelectItem value='Late In Early Out'>Late In-Early Out</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.mode && <FormError>{errors.mode.message}</FormError>}
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
