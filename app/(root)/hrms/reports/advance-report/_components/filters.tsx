'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Filter options
export interface FilterOptions {
    groupTypes: string[];
    departments: string[];
    designations: string[];
}

// Report filters
export interface AdvanceFilters {
    selectedGroupTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    month: string;
    year: string;
}

interface AdvanceReportFiltersProps {
    filters: AdvanceFilters;
    filterOptions: FilterOptions;
    onFilterChange: (filters: AdvanceFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function AdvanceReportFilters({
    filters,
    filterOptions,
    onFilterChange,
    onSearch,
    onCancel
}: AdvanceReportFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleCheckboxChange = (
        category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations',
        value: string,
        checked: boolean
    ) => {
        onFilterChange({
            ...filters,
            [category]: checked ? [...filters[category], value] : filters[category].filter((item) => item !== value)
        });
    };

    const handleSelectAllChange = (category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations', checked: boolean) => {
        let allOptions: string[] = [];

        switch (category) {
            case 'selectedGroupTypes':
                allOptions = filterOptions.groupTypes;
                break;
            case 'selectedDepartments':
                allOptions = filterOptions.departments;
                break;
            case 'selectedDesignations':
                allOptions = filterOptions.designations;
                break;
        }

        onFilterChange({
            ...filters,
            [category]: checked ? allOptions : []
        });
    };

    const handleFilterChange = (key: keyof AdvanceFilters, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value
        });
    };

    return (
        <div className='space-y-4 rounded-lg border bg-card p-4'>
            <div className='flex items-center gap-2 font-semibold text-foreground text-lg'>
                <FileText className='h-5 w-5' />
                EMPLOYEE ADVANCE REPORT
            </div>

            {/* Filter Sections */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {/* Group Type Section */}
                <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium text-foreground text-sm'>Group Type:</span>
                        <span className='text-red-500'>*</span>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id='all-groups'
                                checked={filters.selectedGroupTypes.length === filterOptions.groupTypes.length}
                                onCheckedChange={(checked) => handleSelectAllChange('selectedGroupTypes', checked as boolean)}
                            />
                            <label htmlFor='all-groups' className='cursor-pointer text-sm'>
                                All
                            </label>
                        </div>
                    </div>
                    <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                        {filterOptions.groupTypes.map((groupType) => (
                            <div key={groupType} className='flex items-center gap-2'>
                                <Checkbox
                                    id={`group-${groupType}`}
                                    checked={filters.selectedGroupTypes.includes(groupType)}
                                    onCheckedChange={(checked) => handleCheckboxChange('selectedGroupTypes', groupType, checked as boolean)}
                                />
                                <label htmlFor={`group-${groupType}`} className='cursor-pointer text-sm'>
                                    {groupType}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Section */}
                <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium text-foreground text-sm'>Department:</span>
                        <span className='text-red-500'>*</span>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id='all-departments'
                                checked={filters.selectedDepartments.length === filterOptions.departments.length}
                                onCheckedChange={(checked) => handleSelectAllChange('selectedDepartments', checked as boolean)}
                            />
                            <label htmlFor='all-departments' className='cursor-pointer text-sm'>
                                All
                            </label>
                        </div>
                    </div>
                    <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                        {filterOptions.departments.map((department) => (
                            <div key={department} className='flex items-center gap-2'>
                                <Checkbox
                                    id={`dept-${department}`}
                                    checked={filters.selectedDepartments.includes(department)}
                                    onCheckedChange={(checked) => handleCheckboxChange('selectedDepartments', department, checked as boolean)}
                                />
                                <label htmlFor={`dept-${department}`} className='cursor-pointer text-sm'>
                                    {department}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Designation Section */}
                <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium text-foreground text-sm'>Designation:</span>
                        <span className='text-red-500'>*</span>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id='all-designations'
                                checked={filters.selectedDesignations.length === filterOptions.designations.length}
                                onCheckedChange={(checked) => handleSelectAllChange('selectedDesignations', checked as boolean)}
                            />
                            <label htmlFor='all-designations' className='cursor-pointer text-sm'>
                                All
                            </label>
                        </div>
                    </div>
                    <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                        {filterOptions.designations.map((designation) => (
                            <div key={designation} className='flex items-center gap-2'>
                                <Checkbox
                                    id={`desig-${designation}`}
                                    checked={filters.selectedDesignations.includes(designation)}
                                    onCheckedChange={(checked) => handleCheckboxChange('selectedDesignations', designation, checked as boolean)}
                                />
                                <label htmlFor={`desig-${designation}`} className='cursor-pointer text-sm'>
                                    {designation}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Filters */}
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
                        <SelectTrigger className='w-32'>
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
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
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
    );
}

