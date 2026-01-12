'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookRegister } from '@/hooks/library/useBookRegister';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { use, useState } from 'react';
import { useForm } from 'react-hook-form';
import BookRegisterForm from './_components/BookRegisterForm';
import { BookRegisterColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function BookRegisterPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useBookRegister(searchParams);
    const [view, setView] = useState<'entry' | 'list'>('entry');
    const [selectedRow, setSelectedRow] = useState<BookRegisterPayload | undefined>(undefined);

    const methods = useForm(); // Dummy form provider if needed specifically for something, but usually not for the page itself in this pattern.
    // Actually, BookRegisterForm has its own provider.
    // But CollapsibleSection might expect to be inside one? No, usually not.
    // However, GenericDataTable often uses useDataTableProps which might need data.

    const tableProps = useDataTableProps(response);

    const handleSuccess = () => {
        setView('list');
        setSelectedRow(undefined);
        refetchAll();
    };

    const handleEdit = (data: BookRegisterPayload) => {
        setSelectedRow(data);
        setView('entry');
    };

    return (
        <div className='container min-h-screen space-y-4 p-1'>
            <CollapsibleSection
                title='Book Register: Entry'
                isOpen={view === 'entry'}
                onToggle={() => setView(view === 'entry' ? 'list' : 'entry')}
                defaultOpen={true}>
                <BookRegisterForm initialData={selectedRow} onSuccess={handleSuccess} />
            </CollapsibleSection>

            <CollapsibleSection
                title='Book Register: List'
                isOpen={view === 'list'}
                onToggle={() => setView(view === 'list' ? 'entry' : 'list')}>
                <GenericDataTable<BookRegisterPayload>
                    {...tableProps}
                    columns={BookRegisterColumns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading books...'
                    noDataTitle='No Books Found'
                    noDataDescription='Get started by adding your first book'
                    errorTitle='Error Loading Books'
                />
            </CollapsibleSection>
        </div>
    );
}
