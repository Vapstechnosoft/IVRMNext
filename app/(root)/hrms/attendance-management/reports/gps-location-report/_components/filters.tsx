'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { gpsLocationReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type GPSLocationReportFilters = z.infer<typeof gpsLocationReportFilterSchema>;

interface GPSLocationReportFiltersProps {
    filters: GPSLocationReportFilters;
    employees: string[];
    onFilterChange: (filters: GPSLocationReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function GPSLocationReportFilters({
    filters,
    employees,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: GPSLocationReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<GPSLocationReportFilters>({
        resolver: zodResolver(gpsLocationReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    const handleFilterChange = (key: keyof GPSLocationReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: GPSLocationReportFilters) => {
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
                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                    <div className='md:col-span-4'>
                        <label htmlFor='filter-type-select' className='font-medium text-sm'>
                            Filter Type <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={filters.filterType}
                            onValueChange={(value) => handleFilterChange('filterType', value as 'Between Date' | 'Employee Wise')}>
                            <SelectTrigger id='filter-type-select' className={errors.filterType ? 'border-red-500' : ''}>
                                <SelectValue placeholder='Select Filter Type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Between Date'>Between Date</SelectItem>
                                <SelectItem value='Employee Wise'>Employee Wise</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.filterType && <FormError>{errors.filterType.message}</FormError>}
                    </div>
                    {filters.filterType === 'Between Date' && (
                        <>
                            <div className='md:col-span-4'>
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
                            <div className='md:col-span-4'>
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
                        </>
                    )}
                    {filters.filterType === 'Employee Wise' && (
                        <div className='md:col-span-4'>
                            <label htmlFor='employee-select' className='font-medium text-sm'>
                                Employee <span className='text-red-500'>*</span>
                            </label>
                            <Select value={filters.employee || undefined} onValueChange={(value) => handleFilterChange('employee', value)}>
                                <SelectTrigger id='employee-select' className={errors.employee ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
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
