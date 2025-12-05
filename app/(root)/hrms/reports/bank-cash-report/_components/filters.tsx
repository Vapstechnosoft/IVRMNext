'use client';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
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
    groupTypes: Array<{ id: number; groupType: string }>;
    departments: Array<{ id: number; departmentName: string }>;
    designations: Array<{ id: number; designationName: string }>;
    months: any[];
    years: any[];
    onFilterChange: (filters: BankCashReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}
export function BankCashReportFilters({
    filters,
    groupTypes,
    departments,
    designations,
    months,
    years,
    onFilterChange,
    onSearch,
    onCancel,
    isLoading = false
}: BankCashReportFiltersProps) {
    const handleInternalFilterChange = (key: keyof BankCashReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        onFilterChange(newFilters);
    };
    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
                {/* Filter Sections */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Group Type Section */}
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
                                    .filter((group) => group.id != null && group.groupType)
                                    .map((group) => ({
                                        label: group.groupType,
                                        value: group.id.toString()
                                    }))}
                                defaultValue={filters.selectedTypes}
                                onValueChange={(values) => handleInternalFilterChange('selectedTypes', values)}
                                placeholder='Select Group Types'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>
                    {/* Department Section */}
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
                                    .filter((dept) => dept.id != null && dept.departmentName)
                                    .map((dept) => ({
                                        label: dept.departmentName,
                                        value: dept.id.toString()
                                    }))}
                                defaultValue={filters.selectedDepartments}
                                onValueChange={(values) => handleInternalFilterChange('selectedDepartments', values)}
                                placeholder='Select Departments'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>
                    {/* Designation Section */}
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
                                    .filter((desig) => desig.id != null && desig.designationName)
                                    .map((desig) => ({
                                        label: desig.designationName,
                                        value: desig.id.toString()
                                    }))}
                                defaultValue={filters.selectedDesignations}
                                onValueChange={(values) => handleInternalFilterChange('selectedDesignations', values)}
                                placeholder='Select Designations'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    </div>
                </div>
                {/* Additional Filters */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Payment Mode */}
                    <div className='space-y-2'>
                        <Label htmlFor='paymentMode' className='font-medium text-foreground text-sm'>
                            Payment Mode: <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            value={filters.paymentMode}
                            onValueChange={(value) => handleInternalFilterChange('paymentMode', value as 'Bank' | 'Cash')}>
                            <SelectTrigger>
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
                        <Label htmlFor='month' className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </Label>
                        {isLoading ? (
                            <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                        ) : months.length === 0 ? (
                            <div className='text-muted-foreground text-sm'>No months available</div>
                        ) : (
                            <Select value={filters.month} onValueChange={(value) => handleInternalFilterChange('month', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Month' />
                                </SelectTrigger>
                                <SelectContent>
                                    {months
                                        .filter((month) => month.IVRM_Month_Id != null && month.IVRM_Month_Name)
                                        .map((month) => (
                                            <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name.trim()}>
                                                {month.IVRM_Month_Name.trim()}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {/* Year Filter */}
                    <div className='space-y-2'>
                        <Label htmlFor='year' className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </Label>
                        {isLoading ? (
                            <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                        ) : years.length === 0 ? (
                            <div className='text-muted-foreground text-sm'>No years available</div>
                        ) : (
                            <Select value={filters.year} onValueChange={(value) => handleInternalFilterChange('year', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years
                                        .filter((year) => year.HRMLY_Id != null && year.HRMLY_LeaveYear)
                                        .map((year) => (
                                            <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                                {year.HRMLY_LeaveYear}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}
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
