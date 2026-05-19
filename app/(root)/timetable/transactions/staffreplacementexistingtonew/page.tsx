'use client';
//staff replacement existing to new
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { useStaffReplacementGridData } from '@/hooks/timetable/useTransactions';
import type { StaffReplacementGridData } from '@/types/timetable/Transaction/staffreplacementexistingtonew';
import { List } from 'lucide-react';
import { use, useEffect, useRef, useState } from 'react';
import { columns } from './_components/columns';
import StaffReplacementExistingToNewForm from './_components/form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StaffReplacementExistingToNewPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useStaffReplacementGridData(searchParams);
    // console.log('response', response);

    return (
        <FormProvider<StaffReplacementGridData>>
            <StaffReplacementPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function StaffReplacementPageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const [showForm, setShowForm] = useState(false);
    const formRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (showForm && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showForm]);

    const tableProps = useDataTableProps(response);

    return (
        <div className='container mx-auto min-h-screen max-w-7xl space-y-6 p-4'>
            {/* Header / Actions Area */}
            <div className='flex items-center justify-end'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={() => setShowForm(!showForm)}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-3'>
                    <div className='flex items-center'>
                        <List className='mr-2 h-4 w-4' />
                        Add Replacement
                    </div>
                </Button>
            </div>

            {/* Grid Area */}
            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<StaffReplacementGridData>
                    {...tableProps}
                    columns={columns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading data...'
                    noDataTitle='No Data Found'
                    noDataDescription='Add a new replacement to get started'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {/* Form Area - Conditionally Visible Below Grid */}
            {showForm && (
                <div ref={formRef} className='fade-in slide-in-from-top-4 animate-in duration-300'>
                    <StaffReplacementExistingToNewForm
                        onFetch={(data) => {
                            // console.log('Form submitted:', data);
                            refetchAll();
                            // Optional: Close form after success
                            // setShowForm(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}


