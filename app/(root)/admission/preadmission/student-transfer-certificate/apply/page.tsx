'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { type IStudentSearch, studentSearchColumns } from './_components/columns';

export default function StudentTCApplyPage() {
    const [data, setData] = useState<IStudentSearch[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<IStudentSearch | null>(null);

    const handleSearch = () => {
        setData([
            { id: 1, admNo: 'A001', studentName: 'John Doe', class: 'X', section: 'A' },
            { id: 2, admNo: 'A005', studentName: 'Alice', class: 'X', section: 'B' }
        ]);
        setSelectedStudent(null);
    };

    const handleSelect = (student: IStudentSearch) => {
        setSelectedStudent(student);
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
                    title='Student TC Application'
                    description='Search for a student to apply for TC'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <div className='flex items-end gap-4'>
                        <div className='flex-1 space-y-2'>
                            <label htmlFor='tc-apply-search' className='font-medium text-sm'>
                                Search by Admission No / Name
                            </label>
                            <input
                                id='tc-apply-search'
                                className='flex h-10 w-full rounded-md border bg-background px-3'
                                placeholder='Enter Adm No or Name'
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            <Search className='mr-2 h-4 w-4' /> Search
                        </Button>
                    </div>
                </CollapsibleSection>

                {data.length > 0 && !selectedStudent && (
                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<IStudentSearch>
                            {...tableProps}
                            columns={studentSearchColumns(handleSelect)}
                            isLoading={false}
                            showViewOptions={false}
                            loadingMessage='Searching...'
                        />
                    </CollapsibleSection>
                )}

                {selectedStudent && (
                    <CollapsibleSection
                        title={`Apply TC for ${selectedStudent.studentName}`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg'>
                        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <label htmlFor='tc-apply-reason' className='font-medium text-sm'>
                                    Reason for TC
                                </label>
                                <input id='tc-apply-reason' className='flex h-10 w-full rounded-md border bg-background px-3' />
                            </div>
                            <div className='space-y-2'>
                                <label htmlFor='tc-apply-date' className='font-medium text-sm'>
                                    TC Date
                                </label>
                                <input id='tc-apply-date' type='date' className='flex h-10 w-full rounded-md border bg-background px-3' />
                            </div>
                            <div className='space-y-2'>
                                <label htmlFor='tc-apply-remarks' className='font-medium text-sm'>
                                    Remarks
                                </label>
                                <textarea id='tc-apply-remarks' className='flex h-20 w-full rounded-md border bg-background px-3 py-2' />
                            </div>
                            <div className='col-span-full flex gap-4 pt-4'>
                                <Button>Submit Application</Button>
                                <Button variant='outline' onClick={() => setSelectedStudent(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
