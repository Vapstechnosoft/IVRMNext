// Refactored by automation script on 2025-10-28T15:40:35.848Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/filters.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';

interface Row {
    slNo: number;
    companyOrDept?: string;
    employeeName?: string;
    absentDate?: string;
    unauthorizedLeaveCount?: number;
}

export default function UnauthorizedLeaveCountReportPage() {
    const [mode, setMode] = useState<'Company Wise' | 'Department Wise'>('Company Wise');
    const [detailLevel, setDetailLevel] = useState<'Only Count' | 'Overall Details'>('Only Count');
    const [rangeMode, setRangeMode] = useState<'Month Wise' | 'Date Wise'>('Month Wise');
    const [companyQuery, setCompanyQuery] = useState('');
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('2025');
    const [month, setMonth] = useState('January');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [rows, setRows] = useState<Row[]>([]);

    const columns = useMemo(() => {
        if (detailLevel === 'Overall Details') {
            return [
                { accessorKey: 'slNo', header: 'Sl.No' },
                { accessorKey: 'employeeName', header: 'Employee Name' },
                { accessorKey: 'absentDate', header: 'Absent Date' }
            ];
        }
        return [
            { accessorKey: 'slNo', header: 'Sl.No' },
            { accessorKey: 'companyOrDept', header: mode === 'Company Wise' ? 'Company Name' : 'Department Name' },
            { accessorKey: 'unauthorizedLeaveCount', header: 'Unauthorized Leave Count' }
        ];
    }, [mode, detailLevel]) as any;

    const handleReport = () => {
        if (detailLevel === 'Only Count') {
            setRows([{ slNo: 1, companyOrDept: mode === 'Company Wise' ? 'VKS' : 'Hardware and Network', unauthorizedLeaveCount: 100 }]);
        } else {
            setRows([
                { slNo: 1, employeeName: 'Sarath Kumar A J', absentDate: '2025-01-05' },
                { slNo: 2, employeeName: 'Priyanka Ashok Shilke', absentDate: '2025-01-12' }
            ]);
        }
    };

    const handleClear = () => {
        setMode('Company Wise');
        setDetailLevel('Only Count');
        setRangeMode('Month Wise');
        setCompanyQuery('');
        setSelectedCompanies([]);
        setDepartment('');
        setYear('2025');
        setMonth('January');
        setFromDate('');
        setToDate('');
        setRows([]);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Unauthorized Leave Count Report' />
                    </div>
                </div>

                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 gap-4'>
                        <div className='flex flex-wrap items-center gap-6'>
                            <label className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={mode === 'Company Wise'} onChange={() => setMode('Company Wise')} /> Company
                                Wise
                            </label>
                            <label className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={mode === 'Department Wise'} onChange={() => setMode('Department Wise')} />{' '}
                                Department Wise
                            </label>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {mode === 'Company Wise' ? (
                                <div>
                                    <label className='font-medium text-sm'>Company Name</label>
                                    <div className='rounded-md border p-2'>
                                        <InputText
                                            placeholder='search here...'
                                            value={companyQuery}
                                            onChange={(e) => setCompanyQuery(e.target.value)}
                                        />
                                        <div className='mt-2 max-h-40 space-y-1 overflow-y-auto'>
                                            {['All', 'Vaps Knowledge Services Pvt Ltd', 'Vaps Infotech Pvt Ltd', 'Unnathi Marketing']
                                                .filter((c) => c.toLowerCase().includes(companyQuery.toLowerCase()))
                                                .map((c) => (
                                                    <label key={c} className='flex items-center gap-2 text-sm'>
                                                        <input
                                                            type='checkbox'
                                                            checked={selectedCompanies.includes(c)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedCompanies([...selectedCompanies, c]);
                                                                else setSelectedCompanies(selectedCompanies.filter((x) => x !== c));
                                                            }}
                                                        />
                                                        <span>{c}</span>
                                                    </label>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className='font-medium text-sm'>Department Name</label>
                                    <Select value={department} onValueChange={setDepartment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Department' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='All'>All</SelectItem>
                                            <SelectItem value='Hardware and Network'>Hardware and Network</SelectItem>
                                            <SelectItem value='Human Resource'>Human Resource</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className='flex items-center gap-6'>
                                <label className='flex items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        checked={detailLevel === 'Only Count'}
                                        onChange={() => setDetailLevel('Only Count')}
                                    />{' '}
                                    Only Count
                                </label>
                                <label className='flex items-center gap-2 text-sm'>
                                    <input
                                        type='radio'
                                        checked={detailLevel === 'Overall Details'}
                                        onChange={() => setDetailLevel('Overall Details')}
                                    />{' '}
                                    Overall Details
                                </label>
                            </div>
                        </div>

                        <div className='flex items-center gap-6'>
                            <label className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={rangeMode === 'Month Wise'} onChange={() => setRangeMode('Month Wise')} />{' '}
                                Month Wise
                            </label>
                            <label className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={rangeMode === 'Date Wise'} onChange={() => setRangeMode('Date Wise')} /> Date
                                Wise
                            </label>
                        </div>

                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-3'>
                            <div>
                                <label className='font-medium text-sm'>Year</label>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['2023', '2024', '2025'].map((y) => (
                                            <SelectItem key={y} value={y}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {rangeMode === 'Month Wise' ? (
                                <div>
                                    <label className='font-medium text-sm'>Month</label>
                                    <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                            ].map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className='grid grid-cols-2 gap-2'>
                                    <div>
                                        <label className='font-medium text-sm'>From Date</label>
                                        <InputText type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className='font-medium text-sm'>To Date</label>
                                        <InputText type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                                    </div>
                                </div>
                            )}

                            <div className='flex gap-2 md:col-span-3'>
                                <Button onClick={handleReport}>Report</Button>
                                <Button variant='destructive' onClick={handleClear}>
                                    Cancel
                                </Button>
                                <Button variant='outline' disabled>
                                    Print
                                </Button>
                                <Button variant='outline' disabled>
                                    Excel
                                </Button>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title='Unauthorized Leave Report List'
                    description=''
                    defaultOpen={rows.length > 0}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={rows} columns={columns} totalItems={rows.length} />
                </CollapsibleSection>
            </div>
        </div>
    );
}
