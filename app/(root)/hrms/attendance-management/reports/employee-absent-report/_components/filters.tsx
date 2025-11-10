'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeAbsentReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';
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
        watch,
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
            title='EMPLOYEE ABSENT DETAIL REPORT'
            description='Configure filters to generate employee absent reports'
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
                    <InputText
                        id='fromDate'
                        type='date'
                        value={filters.fromDate}
                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                        error={errors.fromDate?.message}
                    />
                </div>

                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='toDate'>
                        To Date <span className='text-red-500'>*</span>
                    </label>
                    <InputText
                        id='toDate'
                        type='date'
                        value={filters.toDate}
                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                        error={errors.toDate?.message}
                        min={filters.fromDate || undefined}
                    />
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
                        <label className='font-medium text-sm' htmlFor='employee'>
                            Employee Name <span className='text-red-500'>*</span>
                        </label>
                        <Select onValueChange={(value) => handleFilterChange('employee', value)} value={filters.employee}>
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

