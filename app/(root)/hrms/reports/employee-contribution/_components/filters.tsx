'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';

export interface ContributionReportFilters {
    groupType: number[];
    department: number[];
    designation: number[];
    contributionType: 'Earning' | 'Deduction';
    dateType: 'Month' | 'Between Dates';
    selectedMonth: string;
    selectedYear: string;
    fromDate: Date | null;
    toDate: Date | null;
    reportType: 'All' | 'Individual';
    selectedEmployees: number[];
    selectedEarningHead: number;
    selectedDeductionHead: number;
}

interface EmployeeContributionFiltersProps {
    filters: ContributionReportFilters;
    groupTypes: any[];
    departments: any[];
    designations: any[];
    months: any[];
    years: any[];
    employees: any[];
    earningHeads: any[];
    deductionHeads: any[];
    onFilterChange: (key: keyof ContributionReportFilters, value: any) => void;
    onSearch: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function EmployeeContributionFilters({
    filters,
    groupTypes,
    departments,
    designations,
    months,
    years,
    employees,
    earningHeads,
    deductionHeads,
    onFilterChange,
    onSearch,
    onCancel,
    isLoading = false
}: EmployeeContributionFiltersProps) {
    const handleInternalFilterChange = (key: keyof ContributionReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent changes
        if (key === 'groupType') {
            newFilters.department = [];
            newFilters.designation = [];
            newFilters.selectedEmployees = [];
        } else if (key === 'department') {
            newFilters.designation = [];
            newFilters.selectedEmployees = [];
        } else if (key === 'designation') {
            newFilters.selectedEmployees = [];
        } else if (key === 'reportType' && value === 'All') {
            newFilters.selectedEmployees = [];
        } else if (key === 'contributionType') {
            // Reset head selections when contribution type changes
            newFilters.selectedEarningHead = 0;
            newFilters.selectedDeductionHead = 0;
        }

        onFilterChange(key, value);
    };

    // Map months for display - filter out items with empty values or labels
    const monthOptions = months
        .filter((month) => month.IVRM_Month_Id != null && month.IVRM_Month_Name)
        .map((month) => ({
            label: month.IVRM_Month_Name.trim(),
            value: month.IVRM_Month_Id.toString()
        }))
        .filter((m) => m.label && m.value && m.value.trim() !== '');

    // Map years for display - filter out items with empty values or labels
    const yearOptions = years
        .filter((year) => year.HRMLY_LeaveYear != null && year.HRMLY_LeaveYear !== '')
        .map((year) => ({
            label: year.HRMLY_LeaveYear,
            value: year.HRMLY_LeaveYear
        }))
        .filter((y) => y.label && y.value && y.value.trim() !== '');

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
                        {isLoading ? (
                            <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                        ) : groupTypes.length === 0 ? (
                            <div className='text-muted-foreground text-sm'>No group types available</div>
                        ) : (
                            <MultiSelect
                                options={groupTypes
                                    .filter((group) => group.HRMGT_Id != null && group.HRMGT_EmployeeGroupType)
                                    .map((group) => ({
                                        label: group.HRMGT_EmployeeGroupType.trim(),
                                        value: group.HRMGT_Id.toString()
                                    }))}
                                defaultValue={filters.groupType.map((id) => id.toString())}
                                onValueChange={(values) =>
                                    handleInternalFilterChange(
                                        'groupType',
                                        values.map((v) => Number.parseInt(v))
                                    )
                                }
                                placeholder='Select Group Types'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>

                    {/* Department Filter */}
                    <div className='space-y-2'>
                        <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                            Department: <span className='text-red-500'>*</span>
                        </Label>
                        {isLoading ? (
                            <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                        ) : departments.length === 0 ? (
                            <div className='text-muted-foreground text-sm'>No departments available</div>
                        ) : (
                            <MultiSelect
                                options={departments
                                    .filter((dept) => dept.HRMD_Id != null && dept.HRMD_DepartmentName)
                                    .map((dept) => ({
                                        label: dept.HRMD_DepartmentName.trim(),
                                        value: dept.HRMD_Id.toString()
                                    }))}
                                defaultValue={filters.department.map((id) => id.toString())}
                                onValueChange={(values) =>
                                    handleInternalFilterChange(
                                        'department',
                                        values.map((v) => Number.parseInt(v))
                                    )
                                }
                                placeholder='Select Departments'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>

                    {/* Designation Filter */}
                    <div className='space-y-2'>
                        <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                            Designation: <span className='text-red-500'>*</span>
                        </Label>
                        {isLoading ? (
                            <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                        ) : designations.length === 0 ? (
                            <div className='text-muted-foreground text-sm'>No designations available</div>
                        ) : (
                            <MultiSelect
                                options={designations
                                    .filter((desig) => desig.HRMDES_Id != null && desig.HRMDES_DesignationName)
                                    .map((desig) => ({
                                        label: desig.HRMDES_DesignationName.trim(),
                                        value: desig.HRMDES_Id.toString()
                                    }))}
                                defaultValue={filters.designation.map((id) => id.toString())}
                                onValueChange={(values) =>
                                    handleInternalFilterChange(
                                        'designation',
                                        values.map((v) => Number.parseInt(v))
                                    )
                                }
                                placeholder='Select Designations'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>
                </div>

                {/* Filter Section - Row 2: Contribution Type and Head Selection */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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

                    {/* Earning Head - Only show when Earning is selected */}
                    {filters.contributionType === 'Earning' && (
                        <div className='space-y-2'>
                            <Label htmlFor='earningHead' className='font-medium text-foreground text-sm'>
                                Earning Head: <span className='text-red-500'>*</span>
                            </Label>
                            {isLoading ? (
                                <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                            ) : earningHeads.length === 0 ? (
                                <div className='text-muted-foreground text-sm'>No earning heads available</div>
                            ) : (
                                <Select
                                    value={filters.selectedEarningHead > 0 ? filters.selectedEarningHead.toString() : ''}
                                    onValueChange={(value) =>
                                        handleInternalFilterChange('selectedEarningHead', Number.parseInt(value) || 0)
                                    }>
                                    <SelectTrigger id='earningHead'>
                                        <SelectValue placeholder='Select Head' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {earningHeads
                                            .filter((head) => head.HRMED_Id != null && head.HRMED_Name)
                                            .map((head) => (
                                                <SelectItem key={head.HRMED_Id} value={head.HRMED_Id.toString()}>
                                                    {head.HRMED_Name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {/* Deduction Head - Only show when Deduction is selected */}
                    {filters.contributionType === 'Deduction' && (
                        <div className='space-y-2'>
                            <Label htmlFor='deductionHead' className='font-medium text-foreground text-sm'>
                                Deduction Head: <span className='text-red-500'>*</span>
                            </Label>
                            {isLoading ? (
                                <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                            ) : deductionHeads.length === 0 ? (
                                <div className='text-muted-foreground text-sm'>No deduction heads available</div>
                            ) : (
                                <Select
                                    value={filters.selectedDeductionHead > 0 ? filters.selectedDeductionHead.toString() : ''}
                                    onValueChange={(value) =>
                                        handleInternalFilterChange('selectedDeductionHead', Number.parseInt(value) || 0)
                                    }>
                                    <SelectTrigger id='deductionHead'>
                                        <SelectValue placeholder='Select Head' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deductionHeads
                                            .filter((head) => head.HRMED_Id != null && head.HRMED_Name)
                                            .map((head) => (
                                                <SelectItem key={head.HRMED_Id} value={head.HRMED_Id.toString()}>
                                                    {head.HRMED_Name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                </div>

                {/* Filter Section - Row 3: Date Type and Report Type Selection */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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

                {/* Employee Selection - Only show when Individual is selected */}
                {filters.reportType === 'Individual' && (
                    <div className='space-y-2'>
                        <Label htmlFor='employees' className='font-medium text-foreground text-sm'>
                            Employee: <span className='text-red-500'>*</span>
                        </Label>
                        {isLoading ? (
                            <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                        ) : employees.length === 0 ? (
                            <div className='text-muted-foreground text-sm'>No employees available. Please apply filters first.</div>
                        ) : (
                            <MultiSelect
                                options={employees
                                    .filter((emp) => emp.HRME_Id != null && (emp.HRME_EmployeeFirstName || emp.HRME_EmployeeCode))
                                    .map((emp) => ({
                                        label: emp.HRME_EmployeeFirstName
                                            ? `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim() ||
                                              emp.HRME_EmployeeCode
                                            : emp.HRME_EmployeeCode || '',
                                        value: emp.HRME_Id.toString()
                                    }))}
                                defaultValue={filters.selectedEmployees.map((id) => id.toString())}
                                onValueChange={(values) =>
                                    handleInternalFilterChange(
                                        'selectedEmployees',
                                        values.map((v) => Number.parseInt(v))
                                    )
                                }
                                placeholder='Select Employees'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>
                )}

                {/* Conditional Date Selection */}
                {filters.dateType === 'Month' ? (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='month' className='font-medium text-foreground text-sm'>
                                Month
                            </Label>
                            {isLoading ? (
                                <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                            ) : monthOptions.length === 0 ? (
                                <div className='text-muted-foreground text-sm'>No months available</div>
                            ) : (
                                <Select
                                    value={filters.selectedMonth}
                                    onValueChange={(value) => handleInternalFilterChange('selectedMonth', value)}>
                                    <SelectTrigger id='month'>
                                        <SelectValue placeholder='Select Month' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthOptions.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='year' className='font-medium text-foreground text-sm'>
                                Year
                            </Label>
                            {isLoading ? (
                                <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                            ) : yearOptions.length === 0 ? (
                                <div className='text-muted-foreground text-sm'>No years available</div>
                            ) : (
                                <Select
                                    value={filters.selectedYear}
                                    onValueChange={(value) => handleInternalFilterChange('selectedYear', value)}>
                                    <SelectTrigger id='year'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year.value} value={year.value}>
                                                {year.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !filters.fromDate && 'text-muted-foreground'
                                        )}>
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
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !filters.toDate && 'text-muted-foreground'
                                        )}>
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
