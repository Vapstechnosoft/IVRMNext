'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';
import EventsStudentSRKVSForm from './_components/srkvs-form';
import { eventsStudentSRKVSColumns } from './_components/columns';
import { IEventsStudentSRKVSData } from '@/types/sports/events-student-srkvs';

export default function EventsStudentSRKVSPage() {
    const methods = useForm();
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const { gridData } = useEventsStudentSRKVS();
    // Verify if gridData.data is the wrapper { success, data: [] } or just the array
    const dataList = gridData.data?.data || (Array.isArray(gridData.data) ? gridData.data : []) || [];
    console.log("Page - Data List for Table:", dataList);
    const tableProps = {
        data: dataList,
        totalItems: dataList.length,
        success: gridData.data?.success,
        errorMessage: gridData.data?.message
    };

    const handleCloseForm = () => {
        setIsAddFormOpen(false);
    };

    return (
        <FormProvider {...methods}>
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    {/* Header Action */}
                    <div className='flex justify-end'>
                        {!isAddFormOpen && (
                            <Button
                                type='button'
                                onClick={() => setIsAddFormOpen(true)}
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Plus className='h-4 w-4' />
                                Add SRKVS Mapping
                            </Button>
                        )}
                    </div>

                    {/* Add Form Section */}
                    {isAddFormOpen && (
                        <div className='relative mb-8'>
                            <CollapsibleSection
                                title='Events Student SRKVS'
                                defaultOpen={true}
                                variant='default'
                                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                                <div className='relative'>
                                    <Button
                                        type='button'
                                        onClick={handleCloseForm}
                                        variant='ghost'
                                        size='sm'
                                        className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                        <X className='h-4 w-4 text-destructive' /> Close
                                    </Button>
                                    <EventsStudentSRKVSForm onSuccess={handleCloseForm} />
                                </div>
                            </CollapsibleSection>
                        </div>
                    )}

                    {/* Data Table Section */}
                    <CollapsibleSection
                        title='Events Student SRKVS List'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IEventsStudentSRKVSData>
                            {...tableProps}
                            data={dataList}
                            columns={eventsStudentSRKVSColumns}
                            isLoading={gridData.isLoading}
                            error={gridData.error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading records...'
                            noDataTitle='No Records Found'
                            noDataDescription='Start by adding a new SRKVS mapping'
                            errorTitle='Error Loading Records'
                        />
                    </CollapsibleSection>
                </div>
            </div>
        </FormProvider>
    );
}
