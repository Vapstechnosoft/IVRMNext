'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type BaseEntity } from '@/lib/localdb';

export interface GroupType extends BaseEntity {
    groupType: string;
    groupCode: string;
    order: number;
    isActive: boolean;
}

export interface Department extends BaseEntity {
    departmentName: string;
    internalTrainingHours: string;
    order: number;
    isActive: boolean;
}

export interface Designation extends BaseEntity {
    designationName: string;
    basicAmount: string;
    sanctionedSeats: string;
    displaySanctionedSeats: boolean;
    order: number;
    isActive: boolean;
}

export interface Employee extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    grossSalary: number;
    netSalary: number;
}

// Report filters
export interface SalaryCertificateFilters {
    groupType: string;
    department: string;
    designation: string;
    month: string;
    year: string;
    selectedEmployee: string;
}

interface SalaryCertificateFiltersProps {
    filters: SalaryCertificateFilters;
    groupTypes: GroupType[];
    availableDepartments: Department[];
    availableDesignations: Designation[];
    filteredEmployees: Employee[];
    onFilterChange: (key: keyof SalaryCertificateFilters, value: string) => void;
    onGenerate: () => void;
    onCancel: () => void;
}

export function SalaryCertificateFilters({
    filters,
    groupTypes,
    availableDepartments,
    availableDesignations,
    filteredEmployees,
    onFilterChange,
    onGenerate,
    onCancel
}: SalaryCertificateFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleInternalFilterChange = (key: keyof SalaryCertificateFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = 'All';
            newFilters.designation = 'All';
            newFilters.selectedEmployee = '';
        } else if (key === 'department') {
            newFilters.designation = 'All';
            newFilters.selectedEmployee = '';
        } else if (key === 'designation') {
            newFilters.selectedEmployee = '';
        }

        onFilterChange(key, value);
    };

    return (
        <CollapsibleSection
            title='SALARY CERTIFICATE'
            description='Generate employee salary certificates with detailed breakdown'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
                {/* Filter Section - Row 1: Cascading Dropdowns */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Group Type Filter */}
                    <div className='space-y-2'>
                        <label htmlFor='group-type-select' className='font-medium text-foreground text-sm'>
                            Group Type: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.groupType} onValueChange={(value) => handleInternalFilterChange('groupType', value)}>
                            <SelectTrigger id='group-type-select'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='All'>All</SelectItem>
                                {groupTypes.map((group) => (
                                    <SelectItem key={group.id} value={group.groupType}>
                                        {group.groupType}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department Filter */}
                    <div className='space-y-2'>
                        <label htmlFor='department-select' className='font-medium text-foreground text-sm'>
                            Department: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.department} onValueChange={(value) => handleInternalFilterChange('department', value)}>
                            <SelectTrigger id='department-select'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='All'>All</SelectItem>
                                {availableDepartments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.departmentName}>
                                        {dept.departmentName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Designation Filter */}
                    <div className='space-y-2'>
                        <label htmlFor='designation-select' className='font-medium text-foreground text-sm'>
                            Designation: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.designation} onValueChange={(value) => handleInternalFilterChange('designation', value)}>
                            <SelectTrigger id='designation-select'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='All'>All</SelectItem>
                                {availableDesignations.map((desig) => (
                                    <SelectItem key={desig.id} value={desig.designationName}>
                                        {desig.designationName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Filter Section - Row 2: Month, Year, Employee */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Month Filter */}
                    <div className='space-y-2'>
                        <label htmlFor='month-select' className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.month} onValueChange={(value) => handleInternalFilterChange('month', value)}>
                            <SelectTrigger id='month-select'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {[
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
                        <label htmlFor='year-select' className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.year} onValueChange={(value) => handleInternalFilterChange('year', value)}>
                            <SelectTrigger id='year-select'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {currentYear &&
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

                    {/* Employee Selection */}
                    <div className='space-y-2'>
                        <label htmlFor='employee-select' className='font-medium text-foreground text-sm'>
                            Employee: <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.selectedEmployee} onValueChange={(value) => handleInternalFilterChange('selectedEmployee', value)}>
                            <SelectTrigger id='employee-select'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredEmployees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                        {emp.employeeName} ({emp.employeeCode})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 pt-4'>
                    <Button onClick={onGenerate} className='bg-blue-600 hover:bg-blue-700'>
                        GENERATE SLIP
                    </Button>
                    <Button variant='outline' onClick={onCancel}>
                        CANCEL
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}

