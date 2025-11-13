'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ESIReportFilters {
    groupType: string;
    department: string;
    designation: string;
    month: string;
    year: string;
}

interface ESIReportFiltersProps {
    filters: ESIReportFilters;
    groupTypes: Array<{ id: number; groupType: string }>;
    availableDepartments: Array<{ id: number; departmentName: string }>;
    availableDesignations: Array<{ id: number; designationName: string }>;
    onFilterChange: (filters: ESIReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function ESIReportFilters({
    filters,
    groupTypes,
    availableDepartments,
    availableDesignations,
    onFilterChange,
    onSearch,
    onCancel
}: ESIReportFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleFilterChange = (key: keyof ESIReportFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = 'All';
            newFilters.designation = 'All';
        } else if (key === 'department') {
            newFilters.designation = 'All';
        }

        onFilterChange(newFilters);
    };

    return (
        <CollapsibleSection
            title='ESI REPORT'
            description='Configure filters to generate ESI contribution analysis'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
                {/* Filter Section - Row 1: Cascading Dropdowns */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Group Type Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Group Type: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.groupType} onValueChange={(value) => handleFilterChange('groupType', value)}>
                            <SelectTrigger>
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
                        <span className='font-medium text-foreground text-sm'>
                            Department: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                            <SelectTrigger>
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
                        <span className='font-medium text-foreground text-sm'>
                            Designation: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.designation} onValueChange={(value) => handleFilterChange('designation', value)}>
                            <SelectTrigger>
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

                {/* Filter Section - Row 2: Month and Year */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Month Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                            <SelectTrigger>
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
                        <span className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {currentYear &&
                                    Array.from({ length: 5 }, (_, i) => {
                                        const year = currentYear - 2 + i;
                                        return (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 pt-4'>
                    <Button onClick={onSearch}>
                        <Search className='mr-2 h-4 w-4' />
                        SEARCH
                    </Button>
                    <Button variant='outline' onClick={onCancel}>
                        <X className='mr-2 h-4 w-4' />
                        CANCEL
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}
