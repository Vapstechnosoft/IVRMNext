'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { type ITCCancelSearch, tcCancelColumns } from './_components/columns';

export default function StudentTCCancelPage() {
    const [data, setData] = useState<ITCCancelSearch[]>([]);
    const [selectedTC, setSelectedTC] = useState<ITCCancelSearch | null>(null);

    const handleSearch = () => {
        setData([
            { id: 1, tcAppNo: 'TC-2023-001', studentName: 'John Doe', class: 'X', tcDate: '2023-10-01' },
            { id: 2, tcAppNo: 'TC-2023-002', studentName: 'Jane Smith', class: 'X', tcDate: '2023-10-05' }
        ]);
        setSelectedTC(null);
    };

    const handleSelect = (tc: ITCCancelSearch) => {
        setSelectedTC(tc);
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
                    title='Cancel Student TC'
                    description='Search for applied TCs to cancel'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <div className='flex items-end gap-4'>
                        <div className='flex-1 space-y-2'>
                            <label htmlFor='tc-cancel-search' className='font-medium text-sm'>
                                Search by TC No / Name
                            </label>
                            <input
                                id='tc-cancel-search'
                                className='flex h-10 w-full rounded-md border bg-background px-3'
                                placeholder='Enter TC No or Name'
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            <Search className='mr-2 h-4 w-4' /> Search
                        </Button>
                    </div>
                </CollapsibleSection>

                {data.length > 0 && !selectedTC && (
                    <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <GenericDataTable<ITCCancelSearch>
                            {...tableProps}
                            columns={tcCancelColumns(handleSelect)}
                            isLoading={false}
                            showViewOptions={false}
                            noDataTitle='No Active TCs Found'
                        />
                    </CollapsibleSection>
                )}

                {selectedTC && (
                    <CollapsibleSection
                        title={`Confirm Cancel TC: ${selectedTC.tcAppNo}`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg'>
                        <div className='space-y-4 p-4'>
                            <p>
                                Are you sure you want to cancel the Transfer Certificate application for{' '}
                                <strong>{selectedTC.studentName}</strong>?
                            </p>

                            <div className='space-y-2'>
                                <label htmlFor='tc-cancel-reason' className='font-medium text-sm'>
                                    Reason for Cancellation
                                </label>
                                <textarea id='tc-cancel-reason' className='flex h-20 w-full rounded-md border bg-background px-3 py-2' />
                            </div>

                            <div className='flex gap-4'>
                                <Button variant='destructive'>Confirm Cancellation</Button>
                                <Button variant='outline' onClick={() => setSelectedTC(null)}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
