'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
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
    employeeFirstName: string;
    employeeMiddleName?: string;
    employeeLastName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    employmentType?: 'Permanent' | 'Probationary' | 'Contract' | 'Temporary';
    gender?: 'Male' | 'Female' | 'Other';
}

// Report filters
export interface OfferLetterFilters {
    type: string;
    department: string;
    designation: string;
    selectedEmployee: string;
    currentDate: Date;
    reportType: 'Experience Certificate' | 'Offer Letter';
}

interface EmployeeOfferLetterFiltersProps {
    filters: OfferLetterFilters;
    groupTypes: GroupType[];
    departments: Department[];
    designations: Designation[];
    filteredEmployees: Employee[];
    onFilterChange: (key: keyof OfferLetterFilters, value: any) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function EmployeeOfferLetterFilters({
    filters,
    groupTypes,
    departments,
    designations,
    filteredEmployees,
    onFilterChange,
    onSearch,
    onCancel
}: EmployeeOfferLetterFiltersProps) {
    const handleInternalFilterChange = (key: keyof OfferLetterFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'type') {
            newFilters.department = '';
            newFilters.designation = '';
            newFilters.selectedEmployee = '';
        } else if (key === 'department') {
            newFilters.designation = '';
            newFilters.selectedEmployee = '';
        } else if (key === 'designation') {
            newFilters.selectedEmployee = '';
        }

        onFilterChange(key, value);
    };

    return (
        <CollapsibleSection
            title='EMPLOYEE OFFER AND EXPERIENCE REPORT'
            description='Configure filters to generate offer letters and experience certificates'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        {/* Type Selection */}
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                Type: <span className='text-red-500'>*</span>
                            </span>
                            <Select value={filters.type} onValueChange={(value) => handleInternalFilterChange('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {groupTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.groupType}>
                                            {type.groupType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Department Selection */}
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                Department: <span className='text-red-500'>*</span>
                            </span>
                            <Select value={filters.department} onValueChange={(value) => handleInternalFilterChange('department', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.departmentName}>
                                            {dept.departmentName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Designation Selection */}
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                Designation: <span className='text-red-500'>*</span>
                            </span>
                            <Select value={filters.designation} onValueChange={(value) => handleInternalFilterChange('designation', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map((desig) => (
                                        <SelectItem key={desig.id} value={desig.designationName}>
                                            {desig.designationName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Employee Selection */}
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                Employee: <span className='text-red-500'>*</span>
                            </span>
                            <Select
                                value={filters.selectedEmployee}
                                onValueChange={(value) => handleInternalFilterChange('selectedEmployee', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select or search Employee' />
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

                    {/* Right Column */}
                    <div className='space-y-4'>
                        {/* Current Date */}
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                Current Date: <span className='text-red-500'>*</span>
                            </span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !filters.currentDate && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.currentDate ? format(filters.currentDate, 'dd-MM-yyyy') : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <CalendarYear
                                        mode='single'
                                        selected={filters.currentDate}
                                        onDayClick={(day) => handleInternalFilterChange('currentDate', day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Report Type Radio Buttons */}
                        <div className='space-y-3'>
                            <span className='font-medium text-foreground text-sm'>Report Type:</span>
                            <RadioGroup
                                value={filters.reportType}
                                onValueChange={(value) => handleInternalFilterChange('reportType', value as 'Experience Certificate' | 'Offer Letter')}
                                className='space-y-3'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Experience Certificate' id='experience-certificate' />
                                    <label htmlFor='experience-certificate' className='cursor-pointer text-sm'>
                                        Experience Certificate
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Offer Letter' id='offer-letter' />
                                    <label htmlFor='offer-letter' className='cursor-pointer text-sm'>
                                        Offer Letter
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>
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

