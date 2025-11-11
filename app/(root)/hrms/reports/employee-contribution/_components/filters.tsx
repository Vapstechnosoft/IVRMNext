'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GroupType, Department, Designation } from './columns';

export interface ContributionReportFilters {
    groupType: string;
    department: string;
    designation: string;
    contributionType: 'Earning' | 'Deduction';
    dateType: 'Month' | 'Between Dates';
    selectedMonth: string;
    selectedYear: string;
    fromDate: Date | null;
    toDate: Date | null;
    reportType: 'All' | 'Individual';
}

interface EmployeeContributionFiltersProps {
    filters: ContributionReportFilters;
    groupTypes: GroupType[];
    availableDepartments: Department[];
    availableDesignations: Designation[];
    onFilterChange: (key: keyof ContributionReportFilters, value: any) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function EmployeeContributionFilters({
    filters,
    groupTypes,
    availableDepartments,
    availableDesignations,
    onFilterChange,
    onSearch,
    onCancel
}: EmployeeContributionFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleInternalFilterChange = (key: keyof ContributionReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = 'All';
            newFilters.designation = 'All';
        } else if (key === 'department') {
            newFilters.designation = 'All';
        }

        onFilterChange(key, value);
    };

    return (
        <CollapsibleSection
            title='EMPLOYEE CONTRIBUTION REPORT'
            description='Configure filters to generate employee contribution analysis'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
                {/* Filter Section - Row 1: Cascading Dropdowns */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Group Type Filter */}
                    <div className='space-y-2'>
                        <Label htmlFor='groupType' className='font-medium text-foreground text-sm'>
                            Group Type: <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={filters.groupType} onValueChange={(value) => handleInternalFilterChange('groupType', value)}>
                            <SelectTrigger id='groupType'>
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
                        <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                            Department: <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={filters.department} onValueChange={(value) => handleInternalFilterChange('department', value)}>
                            <SelectTrigger id='department'>
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
                        <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                            Designation: <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={filters.designation} onValueChange={(value) => handleInternalFilterChange('designation', value)}>
                            <SelectTrigger id='designation'>
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

                {/* Filter Section - Row 2: Radio Button Groups */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Earning/Deduction Selection */}
                    <div className='space-y-3'>
                        <span className='font-medium text-foreground text-sm'>Contribution Type:</span>
                        <div className='flex items-center gap-6'>
                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                <input
                                    type='radio'
                                    name='contributionType'
                                    value='Earning'
                                    checked={filters.contributionType === 'Earning'}
                                    onChange={(e) => handleInternalFilterChange('contributionType', e.target.value)}
                                    className='text-primary focus:ring-primary'
                                />
                                Earning <span className='text-red-500'>*</span>
                            </label>
                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                <input
                                    type='radio'
                                    name='contributionType'
                                    value='Deduction'
                                    checked={filters.contributionType === 'Deduction'}
                                    onChange={(e) => handleInternalFilterChange('contributionType', e.target.value)}
                                    className='text-primary focus:ring-primary'
                                />
                                Deduction <span className='text-red-500'>*</span>
                            </label>
                        </div>
                    </div>

                    {/* Date Type Selection */}
                    <div className='space-y-3'>
                        <span className='font-medium text-foreground text-sm'>Date Range:</span>
                        <div className='flex items-center gap-6'>
                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                <input
                                    type='radio'
                                    name='dateType'
                                    value='Month'
                                    checked={filters.dateType === 'Month'}
                                    onChange={(e) => handleInternalFilterChange('dateType', e.target.value)}
                                    className='text-primary focus:ring-primary'
                                />
                                Month <span className='text-red-500'>*</span>
                            </label>
                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                <input
                                    type='radio'
                                    name='dateType'
                                    value='Between Dates'
                                    checked={filters.dateType === 'Between Dates'}
                                    onChange={(e) => handleInternalFilterChange('dateType', e.target.value)}
                                    className='text-primary focus:ring-primary'
                                />
                                Between Dates <span className='text-red-500'>*</span>
                            </label>
                        </div>
                    </div>

                    {/* Report Type Selection */}
                    <div className='space-y-3'>
                        <span className='font-medium text-foreground text-sm'>Report Type:</span>
                        <div className='flex items-center gap-6'>
                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                <input
                                    type='radio'
                                    name='reportType'
                                    value='All'
                                    checked={filters.reportType === 'All'}
                                    onChange={(e) => handleInternalFilterChange('reportType', e.target.value)}
                                    className='text-primary focus:ring-primary'
                                />
                                All <span className='text-red-500'>*</span>
                            </label>
                            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                                <input
                                    type='radio'
                                    name='reportType'
                                    value='Individual'
                                    checked={filters.reportType === 'Individual'}
                                    onChange={(e) => handleInternalFilterChange('reportType', e.target.value)}
                                    className='text-primary focus:ring-primary'
                                />
                                Individual <span className='text-red-500'>*</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Conditional Date Selection */}
                {filters.dateType === 'Month' ? (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='month' className='font-medium text-foreground text-sm'>
                                Month
                            </Label>
                            <Select value={filters.selectedMonth} onValueChange={(value) => handleInternalFilterChange('selectedMonth', value)}>
                                <SelectTrigger id='month'>
                                    <SelectValue placeholder='Select Month' />
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
                        <div className='space-y-2'>
                            <Label htmlFor='year' className='font-medium text-foreground text-sm'>
                                Year
                            </Label>
                            <Select value={filters.selectedYear} onValueChange={(value) => handleInternalFilterChange('selectedYear', value)}>
                                <SelectTrigger id='year'>
                                    <SelectValue placeholder='Select Year' />
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
                ) : (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>From Date</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn('w-full justify-start text-left font-normal', !filters.fromDate && 'text-muted-foreground')}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <CalendarYear
                                        mode='single'
                                        selected={filters.fromDate || undefined}
                                        onDayClick={(day) => handleInternalFilterChange('fromDate', day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>To Date</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn('w-full justify-start text-left font-normal', !filters.toDate && 'text-muted-foreground')}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <CalendarYear
                                        mode='single'
                                        selected={filters.toDate || undefined}
                                        onDayClick={(day) => handleInternalFilterChange('toDate', day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className='flex gap-2 pt-4'>
                    <Button onClick={onSearch}>
                        <Search className='mr-2 h-4 w-4' />
                        SEARCH
                    </Button>
                    <Button variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                        CANCEL
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}

