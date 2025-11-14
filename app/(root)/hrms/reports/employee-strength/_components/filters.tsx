'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';

export interface StrengthReportFilters {
    groupType: string;
    department: string;
    designation: string;
    employeeCategories: {
        allEmployee: boolean;
        departmentWise: boolean;
        leftEmployee: boolean;
    };
    fromDate: Date | null;
    toDate: Date | null;
}

interface EmployeeStrengthFiltersProps {
    filters: StrengthReportFilters;
    groupTypes: Array<{ id: number; groupType: string }>;
    availableDepartments: Array<{ id: number; departmentName: string }>;
    availableDesignations: Array<{ id: number; designationName: string }>;
    onFilterChange: (key: keyof Omit<StrengthReportFilters, 'employeeCategories' | 'fromDate' | 'toDate'>, value: string) => void;
    onCategoryChange: (category: keyof StrengthReportFilters['employeeCategories'], checked: boolean) => void;
    onDateChange: (key: 'fromDate' | 'toDate', date: Date | null) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeStrengthFilters({
    filters,
    groupTypes,
    availableDepartments,
    availableDesignations,
    onFilterChange,
    onCategoryChange,
    onDateChange,
    onSearch,
    onCancel,
    onExport: _onExport,
    onPrint: _onPrint
}: EmployeeStrengthFiltersProps) {
    return (
        <CollapsibleSection
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
                        <Select value={filters.groupType} onValueChange={(value) => onFilterChange('groupType', value)}>
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
                        <Select value={filters.department} onValueChange={(value) => onFilterChange('department', value)}>
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
                        <Select value={filters.designation} onValueChange={(value) => onFilterChange('designation', value)}>
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

                {/* Filter Section - Row 2: Employee Categories */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='employeeCategoryAll'
                            checked={filters.employeeCategories.allEmployee}
                            onCheckedChange={(checked) => onCategoryChange('allEmployee', !!checked)}
                        />
                        <Label htmlFor='employeeCategoryAll' className='cursor-pointer'>
                            All Employee
                        </Label>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='employeeCategoryDeptWise'
                            checked={filters.employeeCategories.departmentWise}
                            onCheckedChange={(checked) => onCategoryChange('departmentWise', !!checked)}
                        />
                        <Label htmlFor='employeeCategoryDeptWise' className='cursor-pointer'>
                            Department wise
                        </Label>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='employeeCategoryLeft'
                            checked={filters.employeeCategories.leftEmployee}
                            onCheckedChange={(checked) => onCategoryChange('leftEmployee', !!checked)}
                        />
                        <Label htmlFor='employeeCategoryLeft' className='cursor-pointer'>
                            Left Employee
                        </Label>
                    </div>
                </div>

                {/* Date Range Selection */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>From :</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !filters.fromDate && 'text-muted-foreground'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : <span>17-09-2025</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <DatePickerWithYear
                                    mode='single'
                                    selected={filters.fromDate || undefined}
                                    onDayClick={(day) => onDateChange('fromDate', day)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>To :</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !filters.toDate && 'text-muted-foreground'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : <span>17-09-2025</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <DatePickerWithYear
                                    mode='single'
                                    selected={filters.toDate || undefined}
                                    onDayClick={(day) => onDateChange('toDate', day)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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
