'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LogRow } from './columns';
import { FileDown, Printer, RefreshCw } from 'lucide-react';

export interface LogReportFiltersState {
    type: string;
    department: string;
    designation: string;
    allOrIndividual: 'All' | 'Individual';
    codeOrName: 'Code' | 'Name';
    query: string;
    dateMode: 'Date' | 'Monthly' | 'From Date';
    date: string;
    month: string;
    fromDate: string;
    toDate: string;
    metric: 'Punch Time' | 'Late In' | 'Early Out';
}

interface LogReportFiltersProps {
    filters: LogReportFiltersState;
    data: LogRow[];
    onFilterChange: (filters: LogReportFiltersState) => void;
    onReport: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function LogReportFilters({
    filters,
    data,
    onFilterChange,
    onReport,
    onExport,
    onPrint
}: LogReportFiltersProps) {
    const departments = [...new Set(data.map((d) => d.department))];
    const designations = [...new Set(data.map((d) => d.designation))];

    return (
        <CollapsibleSection
            title='Employee Log Report Filters'
            description='Configure filters to generate employee log reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='type'>
                        Type
                    </label>
                    <Select
                        value={filters.type}
                        onValueChange={(value) => onFilterChange({ ...filters, type: value })}>
                        <SelectTrigger id='type'>
                            <SelectValue placeholder='Type' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Permanent'>Permanent</SelectItem>
                            <SelectItem value='Contract'>Contract</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='department'>
                        Department
                    </label>
                    <Select
                        value={filters.department}
                        onValueChange={(value) => onFilterChange({ ...filters, department: value })}>
                        <SelectTrigger id='department'>
                            <SelectValue placeholder='Department' />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((v) => (
                                <SelectItem key={v} value={v}>
                                    {v}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='designation'>
                        Designation
                    </label>
                    <Select
                        value={filters.designation}
                        onValueChange={(value) => onFilterChange({ ...filters, designation: value })}>
                        <SelectTrigger id='designation'>
                            <SelectValue placeholder='Designation' />
                        </SelectTrigger>
                        <SelectContent>
                            {designations.map((v) => (
                                <SelectItem key={v} value={v}>
                                    {v}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='flex items-center gap-4 pt-2 md:col-span-3'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.allOrIndividual === 'All'}
                            onCheckedChange={() => onFilterChange({ ...filters, allOrIndividual: 'All' })}
                        />
                        <span>All</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.allOrIndividual === 'Individual'}
                            onCheckedChange={() => onFilterChange({ ...filters, allOrIndividual: 'Individual' })}
                        />
                        <span>Individual</span>
                    </div>
                </div>

                <div className='flex gap-4 md:col-span-6'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.codeOrName === 'Code'}
                            onCheckedChange={() => onFilterChange({ ...filters, codeOrName: 'Code' })}
                        />
                        <span>Code</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.codeOrName === 'Name'}
                            onCheckedChange={() => onFilterChange({ ...filters, codeOrName: 'Name' })}
                        />
                        <span>Name</span>
                    </div>
                    <InputText
                        placeholder={filters.codeOrName === 'Code' ? 'Code' : 'Name'}
                        value={filters.query}
                        onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
                    />
                </div>

                <div className='flex items-center gap-4 md:col-span-12'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.dateMode === 'Date'}
                            onCheckedChange={() => onFilterChange({ ...filters, dateMode: 'Date' })}
                        />
                        <span>Date</span>
                    </div>
                    <InputText
                        type='date'
                        value={filters.date}
                        onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
                    />
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.dateMode === 'Monthly'}
                            onCheckedChange={() => onFilterChange({ ...filters, dateMode: 'Monthly' })}
                        />
                        <span>Monthly</span>
                    </div>
                    <Select
                        value={filters.month}
                        onValueChange={(value) => onFilterChange({ ...filters, month: value })}>
                        <SelectTrigger className='w-40'>
                            <SelectValue placeholder='--Select--' />
                        </SelectTrigger>
                        <SelectContent>
                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                                <SelectItem key={m} value={m}>
                                    {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.dateMode === 'From Date'}
                            onCheckedChange={() => onFilterChange({ ...filters, dateMode: 'From Date' })}
                        />
                        <span>From Date</span>
                    </div>
                    <InputText
                        type='date'
                        value={filters.fromDate}
                        onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
                    />
                    <span>To Date :</span>
                    <InputText
                        type='date'
                        value={filters.toDate}
                        onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
                    />
                </div>

                <div className='md:col-span-3'>
                    <label htmlFor='mode-select' className='font-medium text-sm'>
                        Mode
                    </label>
                    <Select
                        value={filters.metric}
                        onValueChange={(v) => onFilterChange({ ...filters, metric: v as 'Punch Time' | 'Late In' | 'Early Out' })}>
                        <SelectTrigger id='mode-select'>
                            <SelectValue placeholder='Mode' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Punch Time'>Punch Time</SelectItem>
                            <SelectItem value='Late In'>Late In</SelectItem>
                            <SelectItem value='Early Out'>Early Out</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex items-end gap-2 md:col-span-9'>
                    <Button onClick={onReport}>
                        <RefreshCw className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button variant='outline' onClick={onExport}>
                        <FileDown className='mr-2 h-4 w-4' /> Export to Excel
                    </Button>
                    <Button variant='outline' onClick={onPrint}>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}
