'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { type IStudentAttendance, studentAttendanceColumns } from './_components/columns';

export default function StudentAttendancePage() {
    const [data, setData] = useState<IStudentAttendance[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = () => {
        // Mock fetching data
        setData([
            { id: 1, studentName: 'John Doe', rollNo: '101', admNo: 'A001', status: 'Present' },
            { id: 2, studentName: 'Jane Smith', rollNo: '102', admNo: 'A002', status: 'Absent' },
            { id: 3, studentName: 'Sameer', rollNo: '103', admNo: 'A003', status: 'Present' }
        ]);
        setSearched(true);
    };

    const tableProps = {
        data: data,
        totalItems: data.length,
        isLoading: false,
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Student Attendance Entry'
                    description='Select criteria to mark attendance'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <label htmlFor='sa-class' className='font-medium text-sm'>
                                Class
                            </label>
                            <select id='sa-class' className='flex h-10 w-full rounded-md border bg-background px-3'>
                                <option>Select Class</option>
                                <option>I</option>
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='sa-section' className='font-medium text-sm'>
                                Section
                            </label>
                            <select id='sa-section' className='flex h-10 w-full rounded-md border bg-background px-3'>
                                <option>Select Section</option>
                                <option>A</option>
                            </select>
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='sa-date' className='font-medium text-sm'>
                                Date
                            </label>
                            <input id='sa-date' type='date' className='flex h-10 w-full rounded-md border bg-background px-3' />
                        </div>
                        <div className='flex justify-end md:col-span-3'>
                            <Button onClick={handleSearch}>
                                <Search className='mr-2 h-4 w-4' /> Search
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {searched && (
                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<IStudentAttendance>
                            {...tableProps}
                            columns={studentAttendanceColumns}
                            isLoading={false}
                            showViewOptions={false}
                            loadingMessage='Loading students...'
                            noDataTitle='No Students Found'
                            noDataDescription='Try changing filters'
                        />
                        <div className='flex justify-end pt-4'>
                            <Button>Save Attendance</Button>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
