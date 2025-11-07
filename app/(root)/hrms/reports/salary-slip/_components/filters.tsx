'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table/data-table';
import type { EmployeeSalarySlipDisplay } from './columns';
import { getSalarySlipColumns } from './columns';
import { FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SalarySlipFilters {
    groupType: number[];
    department: number[];
    designation: number[];
    month: string;
    year: string;
    slipPerPage: string;
    options: {
        lopDays: boolean;
        leaveDetails: boolean;
        panCardNo: boolean;
        bankDetails: boolean;
    };
}

interface SalarySlipFiltersProps {
    filters: SalarySlipFilters;
    groupTypes: any[];
    departments: any[];
    designations: any[];
    months: any[];
    years: any[];
    employees: EmployeeSalarySlipDisplay[];
    filteredEmployees: EmployeeSalarySlipDisplay[];
    searchTerm: string;
    selectedCount: number;
    isLoading: boolean;
    onFilterChange: (filters: SalarySlipFilters) => void;
    onSearchChange: (searchTerm: string) => void;
    onOptionChange: (option: keyof SalarySlipFilters['options'], checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onSelectEmployee: (employeeId: number, checked: boolean) => void;
    onGenerateSlip: () => void;
    onCancel: () => void;
}

export function SalarySlipFilters({
    filters,
    groupTypes,
    departments,
    designations,
    months,
    years,
    employees,
    filteredEmployees,
    searchTerm,
    selectedCount,
    isLoading,
    onFilterChange,
    onSearchChange,
    onOptionChange,
    onSelectAll,
    onSelectEmployee,
    onGenerateSlip,
    onCancel
}: SalarySlipFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const columns = getSalarySlipColumns({ onSelectAll, onSelectEmployee });

    return (
        <CollapsibleSection
            title='Salary Slip Configuration'
            description='Configure filters and options for salary slip generation'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Filter Section - Row 1 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {/* Group Type Filter */}
                <div className='space-y-2'>
                    <Label>Group Type</Label>
                    <MultiSelect
                        options={groupTypes.map((gt) => ({
                            label: gt.HRMGT_EmployeeGroupType,
                            value: gt.HRMGT_Id.toString()
                        }))}
                        defaultValue={filters.groupType.map((id) => id.toString())}
                        onValueChange={(values) =>
                            onFilterChange({
                                ...filters,
                                groupType: values.map((v) => Number.parseInt(v))
                            })
                        }
                        placeholder='Select group types'
                    />
                </div>

                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label>Department</Label>
                    <MultiSelect
                        options={departments.map((dept) => ({
                            label: dept.HRMD_DepartmentName,
                            value: dept.HRMD_Id.toString()
                        }))}
                        defaultValue={filters.department.map((id) => id.toString())}
                        onValueChange={(values) =>
                            onFilterChange({
                                ...filters,
                                department: values.map((v) => Number.parseInt(v))
                            })
                        }
                        placeholder='Select departments'
                    />
                </div>

                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label>Designation</Label>
                    <MultiSelect
                        options={designations.map((desg) => ({
                            label: desg.HRMDES_DesignationName,
                            value: desg.HRMDES_Id.toString()
                        }))}
                        defaultValue={filters.designation.map((id) => id.toString())}
                        onValueChange={(values) =>
                            onFilterChange({
                                ...filters,
                                designation: values.map((v) => Number.parseInt(v))
                            })
                        }
                        placeholder='Select designations'
                    />
                </div>
            </div>

            {/* Filter Section - Row 2 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {/* Month Filter */}
                <div className='space-y-2'>
                    <label htmlFor='month-select' className='font-medium text-foreground text-sm'>
                        Month
                    </label>
                    <Select value={filters.month} onValueChange={(value) => onFilterChange({ ...filters, month: value })}>
                        <SelectTrigger id='month-select'>
                            <SelectValue placeholder='Select month' />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month: any, index: number) => (
                                <SelectItem
                                    key={`month-${index}-${month.monthId || month.monthName || index}`}
                                    value={month.monthName || month.monthId?.toString() || ''}>
                                    {month.monthName || month.monthId}
                                </SelectItem>
                            ))}
                            {months.length === 0 &&
                                ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                                    (month, index) => (
                                        <SelectItem key={`fallback-month-${index}`} value={month}>
                                            {month}
                                        </SelectItem>
                                    )
                                )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Year Filter */}
                <div className='space-y-2'>
                    <label htmlFor='year-select' className='font-medium text-foreground text-sm'>
                        Year
                    </label>
                    <Select value={filters.year} onValueChange={(value) => onFilterChange({ ...filters, year: value })}>
                        <SelectTrigger id='year-select'>
                            <SelectValue placeholder='Select year' />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year: any, index: number) => (
                                <SelectItem
                                    key={`year-${index}-${year.yearId || year.yearName || index}`}
                                    value={year.yearName || year.yearId?.toString() || ''}>
                                    {year.yearName || year.yearId}
                                </SelectItem>
                            ))}
                            {years.length === 0 && currentYear &&
                                Array.from({ length: 5 }, (_, i) => {
                                    const year = currentYear - 2 + i;
                                    return (
                                        <SelectItem key={`fallback-year-${year}`} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    );
                                })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Slip/page Filter */}
                <div className='space-y-2'>
                    <Label>Slip/page</Label>
                    <Select value={filters.slipPerPage} onValueChange={(value) => onFilterChange({ ...filters, slipPerPage: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key='slip-per-page-1' value='1'>
                                1 slip per page
                            </SelectItem>
                            <SelectItem key='slip-per-page-2' value='2'>
                                2 slips per page
                            </SelectItem>
                            <SelectItem key='slip-per-page-3' value='3'>
                                3 slips per page
                            </SelectItem>
                            <SelectItem key='slip-per-page-4' value='4'>
                                4 slips per page
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Options Section */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div className='flex cursor-pointer items-center gap-2 text-sm'>
                    <Checkbox id='lop-days-checkbox' checked={filters.options.lopDays} onCheckedChange={(checked) => onOptionChange('lopDays', !!checked)} />
                    <Label htmlFor='lop-days-checkbox'>LOP Days</Label>
                </div>
                <div className='flex cursor-pointer items-center gap-2 text-sm'>
                    <Checkbox
                        id='leave-details-checkbox'
                        checked={filters.options.leaveDetails}
                        onCheckedChange={(checked) => onOptionChange('leaveDetails', !!checked)}
                    />
                    <Label htmlFor='leave-details-checkbox'>Leave Details</Label>
                </div>
                <div className='flex cursor-pointer items-center gap-2 text-sm'>
                    <Checkbox id='pan-card-checkbox' checked={filters.options.panCardNo} onCheckedChange={(checked) => onOptionChange('panCardNo', !!checked)} />
                    <Label htmlFor='pan-card-checkbox'>Pan Card No.</Label>
                </div>
                <div className='flex cursor-pointer items-center gap-2 text-sm'>
                    <Checkbox
                        id='bank-details-checkbox'
                        checked={filters.options.bankDetails}
                        onCheckedChange={(checked) => onOptionChange('bankDetails', !!checked)}
                    />
                    <Label htmlFor='bank-details-checkbox'>Bank Details</Label>
                </div>
            </div>

            {/* Employee Table with Search */}
            <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <div className='font-medium text-foreground text-sm'>Employee List ({filteredEmployees.length} employees)</div>
                    <div className='flex items-center gap-4'>
                        <Input placeholder='search here...' value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className='w-64' />
                        {selectedCount > 0 && <span className='text-muted-foreground text-sm'>{selectedCount} selected</span>}
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    isLoading={isLoading}
                    columns={columns}
                    data={filteredEmployees}
                    totalItems={filteredEmployees.length}
                    showViewOptions={true}
                    columnPinning={{ left: ['select', 'id'] }}
                />
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                <Button variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
                <Button onClick={onGenerateSlip} disabled={selectedCount === 0}>
                    <FileText className='mr-2 h-4 w-4' />
                    GENERATE SLIP
                </Button>
            </div>
        </CollapsibleSection>
    );
}

