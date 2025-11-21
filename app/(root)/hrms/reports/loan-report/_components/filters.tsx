'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EmployeeDropdown } from '@/types/hrms/reports/loan-report';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Report filters
export interface LoanFilters {
    reportScope: 'all' | 'individual';
    selectedGroupTypes: number[];
    selectedDepartments: number[];
    selectedDesignations: number[];
    selectedEmployee: string;
    month: string;
    year: string;
}

interface LoanReportFiltersProps {
    filters: LoanFilters;
    groupTypes: any[];
    departments: any[];
    designations: any[];
    months: any[];
    years: any[];
    employees: EmployeeDropdown[];
    isLoading: boolean;
    onFilterChange: (filters: LoanFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function LoanReportFilters({
    filters,
    groupTypes,
    departments,
    designations,
    months,
    years,
    employees,
    isLoading,
    onFilterChange,
    onSearch,
    onCancel
}: LoanReportFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleFilterChange = (key: keyof LoanFilters, value: any) => {
        onFilterChange({
            ...filters,
            [key]: value
        });
    };

    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Report Scope Selection */}
            <div className='flex justify-center'>
                <RadioGroup
                    value={filters.reportScope}
                    onValueChange={(value) => handleFilterChange('reportScope', value)}
                    className='flex gap-6'>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='all' id='all' />
                        <label htmlFor='all' className='cursor-pointer text-sm'>
                            All
                        </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='individual' id='individual' />
                        <label htmlFor='individual' className='cursor-pointer text-sm'>
                            Individual
                        </label>
                    </div>
                </RadioGroup>
            </div>

            {/* Filter Sections */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {/* Group Type Section */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>
                        Group Type: <span className='text-red-500'>*</span>
                    </span>
                    <MultiSelect
                        options={groupTypes.map((gt) => ({
                            label: gt.HRMGT_EmployeeGroupType,
                            value: gt.HRMGT_Id.toString()
                        }))}
                        defaultValue={filters.selectedGroupTypes.map((id) => id.toString())}
                        onValueChange={(values) => {
                            onFilterChange({
                                ...filters,
                                selectedGroupTypes: values.map((v) => Number.parseInt(v)),
                                selectedEmployee: '' // Reset employee when filters change
                            });
                        }}
                        placeholder='Select group types'
                    />
                </div>

                {/* Department Section */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>
                        Department: <span className='text-red-500'>*</span>
                    </span>
                    <MultiSelect
                        options={departments.map((dept) => ({
                            label: dept.HRMD_DepartmentName,
                            value: dept.HRMD_Id.toString()
                        }))}
                        defaultValue={filters.selectedDepartments.map((id) => id.toString())}
                        onValueChange={(values) => {
                            onFilterChange({
                                ...filters,
                                selectedDepartments: values.map((v) => Number.parseInt(v)),
                                selectedEmployee: '' // Reset employee when filters change
                            });
                        }}
                        placeholder='Select departments'
                    />
                </div>

                {/* Designation Section */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>
                        Designation: <span className='text-red-500'>*</span>
                    </span>
                    <MultiSelect
                        options={designations.map((desg) => ({
                            label: desg.HRMDES_DesignationName,
                            value: desg.HRMDES_Id.toString()
                        }))}
                        defaultValue={filters.selectedDesignations.map((id) => id.toString())}
                        onValueChange={(values) => {
                            onFilterChange({
                                ...filters,
                                selectedDesignations: values.map((v) => Number.parseInt(v)),
                                selectedEmployee: '' // Reset employee when filters change
                            });
                        }}
                        placeholder='Select designations'
                    />
                </div>
            </div>

            {/* Employee Selection - Only show when Individual is selected */}
            {filters.reportScope === 'individual' && (
                <div className='flex items-center justify-center pt-4'>
                    <div className='w-80 space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Employee: <span className='text-red-500'>*</span>
                        </span>
                        <Select
                            value={filters.selectedEmployee}
                            onValueChange={(value) => handleFilterChange('selectedEmployee', value)}
                            disabled={employees.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder={employees.length === 0 ? 'Select filters first' : 'Select Employee'} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.HRME_Id} value={emp.HRME_Id.toString()}>
                                        {`${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim()}{' '}
                                        ({emp.HRME_EmployeeCode})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Additional Filters - Only show when All is selected */}
            {filters.reportScope === 'all' && (
                <div className='flex items-center justify-center gap-6 pt-4'>
                    {/* Month Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                            <SelectTrigger className='w-40'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month: any) => (
                                    <SelectItem
                                        key={month.IVRM_Month_Id || month.IVRM_Month_Name}
                                        value={month.IVRM_Month_Name || month.IVRM_Month_Id?.toString() || ''}>
                                        {month.IVRM_Month_Name || month.IVRM_Month_Id}
                                    </SelectItem>
                                ))}
                                {months.length === 0 &&
                                    [
                                        'January',
                                        'February',
                                        'March',
                                        'April',
                                        'May',
                                        'June',
                                        'July',
                                        'August',
                                        'September',
                                        'October',
                                        'November',
                                        'December'
                                    ].map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {month}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger className='w-32'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year: any) => (
                                    <SelectItem
                                        key={year.HRMLY_Id || year.HRMLY_LeaveYear}
                                        value={year.HRMLY_LeaveYear || year.HRMLY_Id?.toString() || ''}>
                                        {year.HRMLY_LeaveYear || year.HRMLY_Id}
                                    </SelectItem>
                                ))}
                                {years.length === 0 &&
                                    currentYear &&
                                    Array.from({ length: 5 }, (_, i) => {
                                        const year = currentYear - 2 + i;
                                        return (
                                            <SelectItem key={`year-${year}`} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button onClick={onSearch} disabled={isLoading}>
                    <Search className='mr-2 h-4 w-4' />
                    SEARCH
                </Button>
                <Button variant='outline' onClick={onCancel} disabled={isLoading}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </CollapsibleSection>
    );
}
