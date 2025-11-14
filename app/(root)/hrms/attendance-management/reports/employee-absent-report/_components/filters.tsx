'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeAbsentReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type EmployeeAbsentReportFilters = z.infer<typeof employeeAbsentReportFilterSchema>;

interface EmployeeAbsentReportFiltersProps {
    filters: EmployeeAbsentReportFilters;
    types: string[];
    departments: string[];
    designations: string[];
    employees: string[];
    onFilterChange: (filters: EmployeeAbsentReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeAbsentReportFilters({
    filters,
    types,
    departments,
    designations,
    employees,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: EmployeeAbsentReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<EmployeeAbsentReportFilters>({
        resolver: zodResolver(employeeAbsentReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    const handleFilterChange = (key: keyof EmployeeAbsentReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: EmployeeAbsentReportFilters) => {
        onFilterChange(data);
        onSearch();
    };

    const typeOptions = types.map((t) => ({ label: t, value: t }));
    const departmentOptions = departments.map((d) => ({ label: d, value: d }));
    const designationOptions = designations.map((d) => ({ label: d, value: d }));

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
                        <MultiSelect
                            options={typeOptions}
                            onValueChange={(values) => handleFilterChange('type', values)}
                            defaultValue={filters.type}
                            placeholder='Select Types'
                            className='w-full'
                            maxHeight={240}
                        />
                        {errors.type && <FormError>{errors.type.message}</FormError>}
                    </div>

                    <div className='md:col-span-4'>
                        <label className='font-medium text-sm' htmlFor='department'>
                            Department <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            options={departmentOptions}
                            onValueChange={(values) => handleFilterChange('department', values)}
                            defaultValue={filters.department}
                            placeholder='Select Departments'
                            className='w-full'
                            maxHeight={240}
                        />
                        {errors.department && <FormError>{errors.department.message}</FormError>}
                    </div>

                    <div className='md:col-span-4'>
                        <label className='font-medium text-sm' htmlFor='designation'>
                            Designation <span className='text-red-500'>*</span>
                        </label>
                        <MultiSelect
                            options={designationOptions}
                            onValueChange={(values) => handleFilterChange('designation', values)}
                            defaultValue={filters.designation}
                            placeholder='Select Designations'
                            className='w-full'
                            maxHeight={240}
                        />
                        {errors.designation && <FormError>{errors.designation.message}</FormError>}
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

                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='allOrIndividual'>
                            All / Individual <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={filters.allOrIndividual}
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
                    {filters.allOrIndividual === 'Individual' && (
                        <div className='md:col-span-3'>
                            <label className='font-medium text-sm' htmlFor='employee'>
                                Employee <span className='text-red-500'>*</span>
                            </label>
                            <Select
                                value={filters.employee || undefined}
                                onValueChange={(value) => handleFilterChange('employee', value)}>
                                <SelectTrigger id='employee' className={errors.employee ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp} value={emp}>
                                            {emp}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employee && <FormError>{errors.employee.message}</FormError>}
                        </div>
                    )}

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
