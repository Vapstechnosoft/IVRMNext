'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeInOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type EmployeeInOutReportFilters = z.infer<typeof employeeInOutReportFilterSchema>;

interface EmployeeInOutReportFiltersProps {
    filters: EmployeeInOutReportFilters;
    branches: string[];
    departments: string[];
    designations: string[];
    onFilterChange: (filters: EmployeeInOutReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeInOutReportFilters({
    filters,
    branches,
    departments,
    designations,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
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
            title='EMPLOYEE IN/OUT REPORT'
            description='Configure filters to generate employee attendance in/out reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='branch'>
                        Branch
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('branch', value)}>
                        <SelectTrigger id='branch'>
                            <SelectValue placeholder='Select Branch' />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='type'>
                        Type
                    </label>
                    <MultiSelect
                        options={[
                            { label: 'Permanent', value: 'Permanent' },
                            { label: 'Contract', value: 'Contract' }
                        ]}
                        onValueChange={(values) => handleFilterChange('type', values)}
                        defaultValue={filters.type || []}
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
                    <div className='md:col-span-3'>
                        <label className='font-medium text-sm' htmlFor='codeOrName'>
                            Code / Name <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={filters.codeOrName}
                            onValueChange={(value) => handleFilterChange('codeOrName', value as 'Code' | 'Name')}>
                            <SelectTrigger id='codeOrName' className={errors.codeOrName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Code'>Code</SelectItem>
                                <SelectItem value='Name'>Name</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.codeOrName && <FormError>{errors.codeOrName.message}</FormError>}
                    </div>
                )}
                {filters.allOrIndividual === 'Individual' && (
                    <div className='md:col-span-6'>
                        <label className='font-medium text-sm' htmlFor='query'>
                            Employee {filters.codeOrName === 'Code' ? 'Code' : 'Name'} <span className='text-red-500'>*</span>
                        </label>
                        <InputText
                            id='query'
                            placeholder={`Enter Employee ${filters.codeOrName === 'Code' ? 'Code' : 'Name'}`}
                            value={filters.query || ''}
                            onChange={(e) => handleFilterChange('query', e.target.value)}
                            error={errors.query?.message}
                        />
                    </div>
                )}
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='timeInTimeOut'>
                        Time In / Time Out
                    </label>
                    <Select
                        value={filters.timeInTimeOut}
                        onValueChange={(value) => handleFilterChange('timeInTimeOut', value as 'Time In' | 'Time Out')}>
                        <SelectTrigger id='timeInTimeOut'>
                            <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Time In'>Time In</SelectItem>
                            <SelectItem value='Time Out'>Time Out</SelectItem>
                        </SelectContent>
                    </Select>
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
                {filters.allOrIndividual === 'Individual' && (
                    <div className='md:col-span-12'>
                        {errors.query && <FormError>{errors.query.message}</FormError>}
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
