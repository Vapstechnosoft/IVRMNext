'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export interface LeaveReportFilters {
    company: string;
    isIndividual: boolean;
    employee: string;
    leave: string;
    fromDate: string;
    toDate: string;
    showEmployeeLeaveBalance: boolean;
}

interface LeaveReportFiltersProps {
    filters: LeaveReportFilters;
    onFilterChange: (key: keyof LeaveReportFilters, value: any) => void;
    onReport: () => void;
    onCancel: () => void;
}

export function LeaveReportFilters({ filters, onFilterChange, onReport, onCancel }: LeaveReportFiltersProps) {
    return (
        <CollapsibleSection
            title='LEAVE REPORT'
            description='Configure filters to generate leave report'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-4'>
                {/* Company Selection */}
                <div className='flex items-center gap-4'>
                    <span className='font-medium text-sm'>Company Name</span>
                    <Select value={filters.company} onValueChange={(value) => onFilterChange('company', value)}>
                        <SelectTrigger className='w-80'>
                            <SelectValue placeholder='Select or Search Company' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='ALL'>All</SelectItem>
                            <SelectItem value='VKS'>VKS</SelectItem>
                            <SelectItem value='Other Co'>Other Co</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Individual/All Selection */}
                <div className='flex items-center gap-6'>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={!filters.isIndividual}
                            onChange={() => onFilterChange('isIndividual', false)}
                        />
                        All
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.isIndividual}
                            onChange={() => onFilterChange('isIndividual', true)}
                        />
                        Individual
                    </label>
                </div>

                {/* Filter Fields */}
                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-3'>
                    <div>
                        <label htmlFor='employee-select' className='font-medium text-sm'>
                            Employee
                        </label>
                        <Select value={filters.employee} onValueChange={(value) => onFilterChange('employee', value)}>
                            <SelectTrigger id='employee-select'>
                                <SelectValue placeholder='Select or Search Employee' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='ALL'>All</SelectItem>
                                <SelectItem value='R Siddesh Kumar'>R Siddesh Kumar</SelectItem>
                                <SelectItem value='Benoy Yogesh Shetty'>Benoy Yogesh Shetty</SelectItem>
                                <SelectItem value='Shruthi NA'>Shruthi NA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor='leave-select' className='font-medium text-sm'>
                            Leave
                        </label>
                        <Select value={filters.leave} onValueChange={(value) => onFilterChange('leave', value)}>
                            <SelectTrigger id='leave-select'>
                                <SelectValue placeholder='All' />
                            </SelectTrigger>
                            <SelectContent>
                                {['All', 'Casual Leave', 'Sick Leave', 'Privilege Leave', 'Comp Off', 'Optional Leave'].map((l) => (
                                    <SelectItem key={l} value={l}>
                                        {l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid grid-cols-1 gap-2 md:col-span-1 md:grid-cols-2'>
                        <div>
                            <label htmlFor='from-date-input' className='font-medium text-sm'>
                                From Date
                            </label>
                            <InputText
                                id='from-date-input'
                                type='date'
                                value={filters.fromDate}
                                onChange={(e) => onFilterChange('fromDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor='to-date-input' className='font-medium text-sm'>
                                To Date
                            </label>
                            <InputText
                                id='to-date-input'
                                type='date'
                                value={filters.toDate}
                                onChange={(e) => onFilterChange('toDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Employee Leave Balance Checkbox */}
                    <div className='flex items-center gap-2 md:col-span-3'>
                        <Checkbox
                            id='empLeaveBalance'
                            checked={filters.showEmployeeLeaveBalance}
                            onCheckedChange={(checked) => onFilterChange('showEmployeeLeaveBalance', checked)}
                        />
                        <label htmlFor='empLeaveBalance' className='text-sm'>
                            Employee Leave Balance
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-2 md:col-span-3'>
                        <Button onClick={onReport}>Report</Button>
                        <Button variant='destructive' onClick={onCancel}>
                            <X className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
