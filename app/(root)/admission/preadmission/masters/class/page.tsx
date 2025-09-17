'use client';

import { Heading } from '@/components/layout/heading';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useMasterClass } from '@/hooks/admission/preadmission/useMasters';
import { Database, Plus, RefreshCw, X } from 'lucide-react';
import { use, useRef, useState } from 'react';
import { masterClassColumns } from './_components/columns';
import AddMasterClassForm from './_components/add-form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const handleAddClick = () => {
        setIsFormOpen(true);
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container p-1 space-y-4'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading
                            title='Master Class Management'
                            description='Manage and organize your master classes with advanced filtering and controls'
                        />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        size='lg'
                        className='transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit'>
                        <Plus className='h-4 w-4' />
                        Add Master Class
                    </Button>
                </div>

                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                    title='Master Classes Data'
                    description='View, search, and manage all master classes in the system'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <MasterClassTable searchParams={searchParams} />
                </CollapsibleSection>

                {/* Add Form Section - Conditionally Rendered */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title='Add New Master Class'
                            description='Fill in the details below to create a new master class'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='shadow-lg'
                            headerClassName=''>
                            <div className='relative'>
                                <Button
                                    onClick={handleFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <AddMasterClassForm onSuccess={handleFormClose} className='max-w-full' />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}

function MasterClassTable({ searchParams }: { searchParams: any }) {
    const { data: response, isLoading: loading, error } = useMasterClass(searchParams);

    const responseData = response?.data || [];
    const totalItems = response?.total || 0;

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <RefreshCw className='h-8 w-8 animate-spin text-primary' />
                <p className='text-sm text-muted-foreground'>Loading master classes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <Database className='h-6 w-6 text-destructive' />
                </div>
                <div className='text-center space-y-2'>
                    <h3 className='font-semibold text-destructive'>Error Loading Data</h3>
                    <p className='text-sm text-muted-foreground'>{error?.message || 'Failed to load master classes'}</p>
                </div>
            </div>
        );
    }

    if (!response?.success) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <div className='rounded-full bg-destructive/10 p-3'>
                    <Database className='h-6 w-6 text-destructive' />
                </div>
                <div className='text-center space-y-2'>
                    <h3 className='font-semibold text-destructive'>Request Failed</h3>
                    <p className='text-sm text-muted-foreground'>{response?.message || 'Failed to fetch master classes'}</p>
                </div>
            </div>
        );
    }

    if (responseData.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <div className='rounded-full bg-muted p-3'>
                    <Database className='h-6 w-6 text-muted-foreground' />
                </div>
                <div className='text-center space-y-2'>
                    <h3 className='font-semibold'>No Master Classes Found</h3>
                    <p className='text-sm text-muted-foreground'>Get started by creating your first master class</p>
                </div>
            </div>
        );
    }

    return (
        <div className='rounded-lg bg-card overflow-hidden'>
            <DataTable
                isLoading={false}
                columns={masterClassColumns}
                data={responseData}
                totalItems={totalItems}
                showViewOptions={true}
                columnPinning={{ right: ['actions'] }}
            />
        </div>
    );
}
