'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface FilterOptions {
    groupTypes: string[];
    departments: string[];
    designations: string[];
}

export interface MonthEndFilters {
    selectedGroupTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    month: string;
    year: string;
    ieName: string;
}

interface HRMSMonthEndFiltersProps {
    filters: MonthEndFilters;
    filterOptions: FilterOptions;
    onFilterChange: (filters: MonthEndFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onCheckboxChange: (
        category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations',
        value: string,
        checked: boolean
    ) => void;
    onSelectAllChange: (category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations', checked: boolean) => void;
}

export function HRMSMonthEndFilters({
    filters,
    filterOptions,
    onFilterChange,
    onSearch,
    onCancel,
    onCheckboxChange,
    onSelectAllChange
}: HRMSMonthEndFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleSelectChange = (key: keyof MonthEndFilters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
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
                                onCheckedChange={(checked) => onSelectAllChange('selectedGroupTypes', checked as boolean)}
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
                                    onCheckedChange={(checked) => onCheckboxChange('selectedGroupTypes', groupType, checked as boolean)}
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
                                onCheckedChange={(checked) => onSelectAllChange('selectedDepartments', checked as boolean)}
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
                                    onCheckedChange={(checked) => onCheckboxChange('selectedDepartments', department, checked as boolean)}
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
                                onCheckedChange={(checked) => onSelectAllChange('selectedDesignations', checked as boolean)}
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
                                    onCheckedChange={(checked) => onCheckboxChange('selectedDesignations', designation, checked as boolean)}
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
                    <Select value={filters.month} onValueChange={(value) => handleSelectChange('month', value)}>
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
                    <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
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

                {/* IE Name Filter */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>
                        IE Name: <span className='text-red-500'>*</span>
                    </span>
                    <InputText
                        placeholder='Enter name'
                        value={filters.ieName}
                        onChange={(e) => handleSelectChange('ieName', e.target.value)}
                        className='w-60'
                    />
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
        </CollapsibleSection>
    );
}
