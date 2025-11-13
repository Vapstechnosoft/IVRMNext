'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gpsLocationReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';
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
            title='ATTENDANCE GPS LOCATION REPORT'
            description='Configure filters to generate GPS location attendance reports'
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
                                <InputText
                                    id='from-date-input'
                                    type='date'
                                    value={filters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                    error={errors.fromDate?.message}
                                />
                            </div>
                            <div className='md:col-span-4'>
                                <label htmlFor='to-date-input' className='font-medium text-sm'>
                                    To Date <span className='text-red-500'>*</span>
                                </label>
                                <InputText
                                    id='to-date-input'
                                    type='date'
                                    value={filters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                    error={errors.toDate?.message}
                                    min={filters.fromDate || undefined}
                                />
                            </div>
                        </>
                    )}
                    {filters.filterType === 'Employee Wise' && (
                        <div className='md:col-span-4'>
                            <label htmlFor='employee-select' className='font-medium text-sm'>
                                Employee Name <span className='text-red-500'>*</span>
                            </label>
                            <Select onValueChange={(value) => handleFilterChange('employee', value)} value={filters.employee}>
                                <SelectTrigger id='employee-select' className={errors.employee ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Search Employee Name here...' />
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
                    <div className='flex gap-2 pt-2 md:col-span-12'>
                        <Button type='submit'>
                            <RefreshCw className='mr-2 h-4 w-4' /> Report
                        </Button>
                        <Button type='button' variant='outline' onClick={onExport}>
                            <FileDown className='mr-2 h-4 w-4' /> Export to Excel
                        </Button>
                        <Button type='button' variant='outline' onClick={onPrint}>
                            <Printer className='mr-2 h-4 w-4' /> Print
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
