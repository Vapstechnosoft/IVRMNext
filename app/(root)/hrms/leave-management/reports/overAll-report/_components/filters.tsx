'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export interface OverallReportFilters {
    status: 'Applied' | 'Approved' | 'Requested' | 'Rejected' | 'PartialApproved';
    groupBy: 'Employee Wise' | 'Leave Wise';
    employee: string;
    fromDate: string;
    toDate: string;
}

interface OverallReportFiltersProps {
    filters: OverallReportFilters;
    onFilterChange: (key: keyof OverallReportFilters, value: any) => void;
    onReport: () => void;
    onCancel: () => void;
}

export function OverallReportFilters({ filters, onFilterChange, onReport, onCancel }: OverallReportFiltersProps) {
    return (
        <CollapsibleSection
            title='VKS OVERALL REPORT'
            description='Configure filters to generate overall leave report'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-4'>
                {/* Status Selection */}
                <div className='flex flex-wrap items-center gap-6'>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.status === 'Applied'}
                            onChange={() => onFilterChange('status', 'Applied')}
                        />
                        Applied
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.status === 'Approved'}
                            onChange={() => onFilterChange('status', 'Approved')}
                        />
                        Approved
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.status === 'Requested'}
                            onChange={() => onFilterChange('status', 'Requested')}
                        />
                        Requested
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.status === 'Rejected'}
                            onChange={() => onFilterChange('status', 'Rejected')}
                        />
                        Rejected
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.status === 'PartialApproved'}
                            onChange={() => onFilterChange('status', 'PartialApproved')}
                        />
                        Partial Approved
                    </label>
                </div>

                {/* Group By Selection */}
                <div className='flex items-center gap-6'>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.groupBy === 'Employee Wise'}
                            onChange={() => onFilterChange('groupBy', 'Employee Wise')}
                        />
                        Employee Wise
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.groupBy === 'Leave Wise'}
                            onChange={() => onFilterChange('groupBy', 'Leave Wise')}
                        />
                        Leave Wise
                    </label>
                </div>

                {/* Filter Fields */}
                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-3'>
                    <div className='md:col-span-1'>
                        <label htmlFor='employee-select' className='font-medium text-sm'>
                            Employee
                        </label>
                        <Select value={filters.employee} onValueChange={(value) => onFilterChange('employee', value)}>
                            <SelectTrigger id='employee-select'>
                                <SelectValue placeholder='Select or search employee' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='ALL'>All</SelectItem>
                                <SelectItem value='Steffi Halian'>Steffi Halian</SelectItem>
                                <SelectItem value='Shruthi NA'>Shruthi NA</SelectItem>
                                <SelectItem value='Bindhushree N'>Bindhushree N</SelectItem>
                                <SelectItem value='Chaithra NS'>Chaithra NS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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

                    {/* Action Buttons */}
                    <div className='mt-2 flex gap-2 md:col-span-3'>
                        <Button onClick={onReport}>Report</Button>
                        <Button variant='destructive' onClick={onCancel}>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button variant='outline' disabled>
                            Export to Excel
                        </Button>
                        <Button variant='outline' disabled>
                            Print
                        </Button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
