'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeYearlyReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type EmployeeYearlyReportFilters = z.infer<typeof employeeYearlyReportFilterSchema>;

interface EmployeeYearlyReportFiltersProps {
    filters: EmployeeYearlyReportFilters;
    employees: string[];
    types: string[];
    departments: string[];
    designations: string[];
    onFilterChange: (filters: EmployeeYearlyReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeYearlyReportFilters({
    filters,
    employees,
    types,
    departments,
    designations,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: EmployeeYearlyReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<EmployeeYearlyReportFilters>({
        resolver: zodResolver(employeeYearlyReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    const handleFilterChange = (key: keyof EmployeeYearlyReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: EmployeeYearlyReportFilters) => {
        onFilterChange(data);
        onSearch();
    };

    return (
        <CollapsibleSection
            title='EMPLOYEE YEARLY REPORT'
            description='Configure filters to generate yearly attendance reports for employees'
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
                        options={types.map((t) => ({ label: t, value: t }))}
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
                    <div className='md:col-span-6'>
                        <label htmlFor='employee-select' className='font-medium text-sm'>
                            Employee Name <span className='text-red-500'>*</span>
                        </label>
                        <Select onValueChange={(value) => handleFilterChange('employee', value)} value={filters.employee}>
                            <SelectTrigger id='employee-select' className={errors.employee ? 'border-red-500' : ''}>
                            <SelectValue placeholder='Select or Search Employee in list' />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((n) => (
                                <SelectItem key={n} value={n}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                        {errors.employee && <FormError>{errors.employee.message}</FormError>}
                </div>
                )}
                <div className='md:col-span-3'>
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
                <div className='md:col-span-3'>
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
                <div className='flex gap-2 md:col-span-12'>
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
