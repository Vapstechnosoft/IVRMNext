// Refactored by automation script on 2025-10-28T15:40:36.174Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/filters.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

interface InterviewRecord extends BaseEntity {
    candidateName: string;
    interviewRound: string;
    interviewType: string;
    interviewDate: string;
    interviewVenue: string;
    interviewFeedback: string;
    candidateStatus: 'Short Listed' | 'Selected' | 'Rejected' | 'In Progress';
}

export default function InterviewReportPage() {
    const db = createLocalCrud<InterviewRecord>('recruitment:interview-report');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [status, setStatus] = useState<'Upcoming' | 'InProgress' | 'Completed' | 'All'>('All');

    const data = useMemo(() => db.list(), []);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okFrom = fromDate ? new Date(r.interviewDate) >= new Date(fromDate) : true;
            const okTo = toDate ? new Date(r.interviewDate) <= new Date(toDate) : true;
            const okStatus =
                status === 'All'
                    ? true
                    : status === 'Upcoming'
                      ? new Date(r.interviewDate) > new Date()
                      : status === 'InProgress'
                        ? r.candidateStatus === 'In Progress'
                        : status === 'Completed';
            return okFrom && okTo && okStatus;
        });
    }, [data, fromDate, toDate, status]);

    const columns: ColumnDef<InterviewRecord>[] = [
        {
            id: 'sl',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL No.' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        { accessorKey: 'candidateName', header: ({ column }) => <DataTableColumnHeader column={column} title='Candidate Name' /> },
        { accessorKey: 'interviewRound', header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Round' /> },
        { accessorKey: 'interviewType', header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Type' /> },
        { accessorKey: 'interviewDate', header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Date' /> },
        { accessorKey: 'interviewVenue', header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Venue' /> },
        { accessorKey: 'interviewFeedback', header: ({ column }) => <DataTableColumnHeader column={column} title='Interview Feedback' /> },
        { accessorKey: 'candidateStatus', header: ({ column }) => <DataTableColumnHeader column={column} title='Candidate Status' /> }
    ];

    const handleReport = () => {
        /* no-op demo */
    };
    const handleExport = () => {
        /* export placeholder */
    };
    const handlePrint = () => window.print();

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Interview Report' description='' />
                    </div>
                </div>

                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                        <div className='space-y-2 md:col-span-3'>
                            <label className='font-medium text-sm'>From Date</label>
                            <InputText type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className='space-y-2 md:col-span-3'>
                            <label className='font-medium text-sm'>To Date</label>
                            <InputText type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div className='space-y-2 md:col-span-3'>
                            <label className='font-medium text-sm'>Status</label>
                            <Select onValueChange={(v) => setStatus(v as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='All' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='All'>All</SelectItem>
                                    <SelectItem value='Upcoming'>Upcoming</SelectItem>
                                    <SelectItem value='InProgress'>In Progress</SelectItem>
                                    <SelectItem value='Completed'>Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='flex justify-start gap-2 md:col-span-3 md:justify-end'>
                            <Button type='button' onClick={handleReport}>
                                <RefreshCw className='mr-2 h-4 w-4' />
                                Report
                            </Button>
                            <Button type='button' variant='outline' onClick={handleExport}>
                                <FileDown className='mr-2 h-4 w-4' />
                                Export to Excel
                            </Button>
                            <Button type='button' variant='outline' onClick={handlePrint}>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title='Grid View'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={false} columns={columns} data={filtered} totalItems={filtered.length} showViewOptions />
                </CollapsibleSection>
            </div>
        </div>
    );
}
