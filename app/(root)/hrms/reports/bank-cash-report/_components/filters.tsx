'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Department, Designation, GroupType } from './columns';

// Report filters
export interface BankCashReportFilters {
    selectedTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    paymentMode: 'Bank' | 'Cash';
    month: string;
    year: string;
}

interface BankCashReportFiltersProps {
    filters: BankCashReportFilters;
    groupTypes: GroupType[];
    departments: Department[];
    designations: Designation[];
    onCheckboxChange: (category: 'selectedTypes' | 'selectedDepartments' | 'selectedDesignations', value: string, checked: boolean) => void;
    onSelectAllChange: (
        category: 'selectedTypes' | 'selectedDepartments' | 'selectedDesignations',
        checked: boolean,
        allOptions: string[]
    ) => void;
    onFilterChange: (key: keyof BankCashReportFilters, value: any) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function BankCashReportFilters({
    filters,
    groupTypes,
    departments,
    designations,
    onCheckboxChange,
    onSelectAllChange,
    onFilterChange,
    onSearch,
    onCancel
}: BankCashReportFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <CollapsibleSection
            title='BANK/CASH REPORT CONFIGURATION'
            description='Configure filters to generate bank and cash payment reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
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
                                    checked={filters.selectedTypes.length === groupTypes.length}
                                    onCheckedChange={(checked) =>
                                        onSelectAllChange(
                                            'selectedTypes',
                                            checked as boolean,
                                            groupTypes.map((g) => g.groupType)
                                        )
                                    }
                                />
                                <label htmlFor='all-groups' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {groupTypes.map((groupType) => (
                                <div key={groupType.id} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`group-${groupType.id}`}
                                        checked={filters.selectedTypes.includes(groupType.groupType)}
                                        onCheckedChange={(checked) =>
                                            onCheckboxChange('selectedTypes', groupType.groupType, checked as boolean)
                                        }
                                    />
                                    <label htmlFor={`group-${groupType.id}`} className='cursor-pointer text-sm'>
                                        {groupType.groupType}
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
                                    checked={filters.selectedDepartments.length === departments.length}
                                    onCheckedChange={(checked) =>
                                        onSelectAllChange(
                                            'selectedDepartments',
                                            checked as boolean,
                                            departments.map((d) => d.departmentName)
                                        )
                                    }
                                />
                                <label htmlFor='all-departments' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {departments.map((department) => (
                                <div key={department.id} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`dept-${department.id}`}
                                        checked={filters.selectedDepartments.includes(department.departmentName)}
                                        onCheckedChange={(checked) =>
                                            onCheckboxChange('selectedDepartments', department.departmentName, checked as boolean)
                                        }
                                    />
                                    <label htmlFor={`dept-${department.id}`} className='cursor-pointer text-sm'>
                                        {department.departmentName}
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
                                    checked={filters.selectedDesignations.length === designations.length}
                                    onCheckedChange={(checked) =>
                                        onSelectAllChange(
                                            'selectedDesignations',
                                            checked as boolean,
                                            designations.map((d) => d.designationName)
                                        )
                                    }
                                />
                                <label htmlFor='all-designations' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-32 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {designations.map((designation) => (
                                <div key={designation.id} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`desig-${designation.id}`}
                                        checked={filters.selectedDesignations.includes(designation.designationName)}
                                        onCheckedChange={(checked) =>
                                            onCheckboxChange('selectedDesignations', designation.designationName, checked as boolean)
                                        }
                                    />
                                    <label htmlFor={`desig-${designation.id}`} className='cursor-pointer text-sm'>
                                        {designation.designationName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Filters */}
                <div className='flex items-center justify-center gap-6 pt-4'>
                    {/* Payment Mode */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Payment Mode: <span className='text-red-500'>*</span>
                        </span>
                        <Select
                            value={filters.paymentMode}
                            onValueChange={(value) => onFilterChange('paymentMode', value as 'Bank' | 'Cash')}>
                            <SelectTrigger className='w-40'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Bank'>Bank</SelectItem>
                                <SelectItem value='Cash'>Cash</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Month Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.month} onValueChange={(value) => onFilterChange('month', value)}>
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
                        <Select value={filters.year} onValueChange={(value) => onFilterChange('year', value)}>
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
                    <Button variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                        CANCEL
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}
