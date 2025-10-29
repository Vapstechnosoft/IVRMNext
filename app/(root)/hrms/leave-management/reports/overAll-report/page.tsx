// Refactored by automation script on 2025-10-28T15:40:35.842Z
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
    employee: string;
    leaveName: string;
    fromDate: string;
    toDate: string;
    status: 'Applied' | 'Approved' | 'Requested' | 'Rejected' | 'PartialApproved';
}

export default function LeaveOverallReportPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [status, setStatus] = useState<Row['status']>('Applied');
    const [groupBy, setGroupBy] = useState<'Employee Wise' | 'Leave Wise'>('Employee Wise');
    const [employee, setEmployee] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const columns = useMemo(
        () => [
            { accessorKey: 'employee', header: 'Employee' },
            { accessorKey: 'leaveName', header: 'Leave' },
            { accessorKey: 'fromDate', header: 'From Date' },
            { accessorKey: 'toDate', header: 'To Date' },
            { accessorKey: 'status', header: 'Status' }
        ],
        []
    );

    const handleReport = () => {
        // Demo rows; hook to API later
        setRows([
            { employee: 'Steffi Halian', leaveName: 'Sick Leave', fromDate: '2025-01-03', toDate: '2025-01-04', status },
            { employee: 'Shruthi NA', leaveName: 'Casual Leave', fromDate: '2025-02-10', toDate: '2025-02-11', status }
        ]);
    };

    const handleClear = () => {
        setStatus('Applied');
        setGroupBy('Employee Wise');
        setEmployee('');
        setFromDate('');
        setToDate('');
        setRows([]);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='VKS Overall Report' />
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
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={status === 'Applied'} onChange={() => setStatus('Applied')} /> Applied
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={status === 'Approved'} onChange={() => setStatus('Approved')} /> Approved
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={status === 'Requested'} onChange={() => setStatus('Requested')} /> Requested
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={status === 'Rejected'} onChange={() => setStatus('Rejected')} /> Rejected
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={status === 'PartialApproved'} onChange={() => setStatus('PartialApproved')} />{' '}
                                Partial Approved
                            </div>
                        </div>

                        <div className='flex items-center gap-6'>
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={groupBy === 'Employee Wise'} onChange={() => setGroupBy('Employee Wise')} />{' '}
                                Employee Wise
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={groupBy === 'Leave Wise'} onChange={() => setGroupBy('Leave Wise')} /> Leave
                                Wise
                            </div>
                        </div>

                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-3'>
                            <div className='md:col-span-1'>
                                <label className='font-medium text-sm'>Employee</label>
                                <Select value={employee} onValueChange={setEmployee}>
                                    <SelectTrigger>
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
                                <label className='font-medium text-sm'>From Date</label>
                                <InputText type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                            </div>
                            <div>
                                <label className='font-medium text-sm'>To Date</label>
                                <InputText type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                            </div>

                            <div className='mt-2 flex gap-2 md:col-span-3'>
                                <Button onClick={handleReport}>Report</Button>
                                <Button variant='destructive' onClick={handleClear}>
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

                <CollapsibleSection
                    title='Report Result'
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
