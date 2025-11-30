'use client';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
export interface FilterOptions {
    groupTypes: Array<{ id: number; groupType: string }>;
    departments: Array<{ id: number; departmentName: string }>;
    designations: Array<{ id: number; designationName: string }>;
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
    months: Array<{ IVRM_Month_Id: number; IVRM_Month_Name: string; [key: string]: any }>;
    years: Array<{ HRMLY_Id: number; HRMLY_LeaveYear: string; [key: string]: any }>;
    onFilterChange: (filters: MonthEndFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}
export function HRMSMonthEndFilters({
    filters,
    filterOptions,
    months,
    years,
    onFilterChange,
    onSearch,
    onCancel,
    isLoading = false
}: HRMSMonthEndFiltersProps) {
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
                <div className='space-y-2'>
                    <Label htmlFor='group-type' className='font-medium text-foreground text-sm'>
                        Group Type: <span className='text-red-500'>*</span>
                    </Label>
                    {isLoading ? (
                        <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                    ) : filterOptions.groupTypes.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No group types available</div>
                    ) : (
                        <MultiSelect
                            options={filterOptions.groupTypes.map((gt) => ({
                                label: gt.groupType,
                                value: gt.groupType
                            }))}
                            defaultValue={filters.selectedGroupTypes}
                            onValueChange={(values) =>
                                onFilterChange({
                                    ...filters,
                                    selectedGroupTypes: values
                                })
                            }
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
                    ) : filterOptions.departments.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No departments available</div>
                    ) : (
                        <MultiSelect
                            options={filterOptions.departments.map((dept) => ({
                                label: dept.departmentName,
                                value: dept.departmentName
                            }))}
                            defaultValue={filters.selectedDepartments}
                            onValueChange={(values) =>
                                onFilterChange({
                                    ...filters,
                                    selectedDepartments: values
                                })
                            }
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
                    ) : filterOptions.designations.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No designations available</div>
                    ) : (
                        <MultiSelect
                            options={filterOptions.designations.map((desg) => ({
                                label: desg.designationName,
                                value: desg.designationName
                            }))}
                            defaultValue={filters.selectedDesignations}
                            onValueChange={(values) =>
                                onFilterChange({
                                    ...filters,
                                    selectedDesignations: values
                                })
                            }
                            placeholder='Select Designations'
                            className='w-full'
                            maxHeight={240}
                        />
                    )}
                </div>
            </div>
            {/* Additional Filters */}
            <div className='flex items-center justify-center gap-6 pt-4'>
                {/* Month Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='month' className='font-medium text-foreground text-sm'>
                        Month: <span className='text-red-500'>*</span>
                    </Label>
                    {isLoading ? (
                        <div className='h-10 w-40 animate-pulse rounded-md bg-muted' />
                    ) : months.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No months available</div>
                    ) : (
                        <Select value={filters.month} onValueChange={(value) => handleSelectChange('month', value)}>
                            <SelectTrigger id='month' className='w-40'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {months
                                    .filter((m) => m.IVRM_Month_Name && m.Is_Active)
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
                        <div className='h-10 w-32 animate-pulse rounded-md bg-muted' />
                    ) : years.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No years available</div>
                    ) : (
                        <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                            <SelectTrigger id='year' className='w-32'>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {years
                                    .filter((y) => y.HRMLY_LeaveYear && y.HRMLY_ActiveFlag)
                                    .map((year) => (
                                        <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                            {year.HRMLY_LeaveYear}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                {/* IE Name Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='ie-name' className='font-medium text-foreground text-sm'>
                        IE Name: <span className='text-red-500'>*</span>
                    </Label>
                    <InputText
                        id='ie-name'
                        placeholder='Enter name'
                        value={filters.ieName}
                        onChange={(e) => handleSelectChange('ieName', e.target.value)}
                        className='w-60'
                    />
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
        </CollapsibleSection>
    );
}
