'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useFeeOpeningBalanceList, useFeeOpeningPDAList, useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import AddFeeOpeningBalanceForm from './_components/add-form';
import DeleteOpeningBalanceForm from './_components/delete-form';

import type { IFeeConcessionStudentConcessionGrid, OpeningBalanceRow } from '@/types/fees/transactions/transactions';
import { openingBalanceColumns } from './_components/columns';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    total?: number;
}

export default function FeeOpeningBalancePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'Fee' | 'PDA'>('Fee');

    const { data: academicYearData, isLoading: loadingYears } = useopeningacademicyerdropdowndatafee();

    const apiSearchParams = searchParams ? Object.fromEntries(searchParams.entries()) : {};

    const {
        data: feeResponse,
        isLoading: feeLoading,
        refetch: refetchFee
    } = useFeeOpeningBalanceList(selectedAsmayId || 0, apiSearchParams as any);

    const {
        data: pdaResponse,
        isLoading: pdaLoading,
        refetch: refetchPDA
    } = useFeeOpeningPDAList(selectedAsmayId || 0, apiSearchParams as any);

    const feeData: OpeningBalanceRow[] = (feeResponse as ApiResponse<OpeningBalanceRow[]>)?.data ?? [];
    const pdaData: OpeningBalanceRow[] = (pdaResponse as ApiResponse<OpeningBalanceRow[]>)?.data ?? [];

    const totalFeeRecords = (feeResponse as ApiResponse<OpeningBalanceRow[]>)?.total ?? 0;
    const totalPdaRecords = (pdaResponse as ApiResponse<OpeningBalanceRow[]>)?.total ?? 0;
    const totalRecords = activeTab === 'Fee' ? totalFeeRecords : totalPdaRecords;

    const isLoading = activeTab === 'Fee' ? feeLoading : pdaLoading;
    const tableData: OpeningBalanceRow[] = activeTab === 'Fee' ? feeData : pdaData;

    const refetchAll = () => {
        if (activeTab === 'Fee') refetchFee();
        else refetchPDA();
    };

    return (
        <FormProvider<OpeningBalanceRow>>
            <PageContent
                selectedAsmayId={selectedAsmayId}
                setSelectedAsmayId={setSelectedAsmayId}
                academicYearData={academicYearData}
                loadingYears={loadingYears}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tableData={tableData}
                totalRecords={totalRecords}
                isLoading={isLoading}
                refetchAll={refetchAll}
                searchParams={searchParams}
                router={router}
                pathname={pathname}
            />
        </FormProvider>
    );
}

function PageContent({
    selectedAsmayId,
    setSelectedAsmayId,
    academicYearData,
    loadingYears,
    activeTab,
    setActiveTab,
    tableData,
    totalRecords,
    isLoading,
    refetchAll,
    searchParams,
    router,
    pathname
}: {
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    academicYearData: any;
    loadingYears: boolean;
    activeTab: 'Fee' | 'PDA';
    setActiveTab: (tab: 'Fee' | 'PDA') => void;
    tableData: OpeningBalanceRow[];
    totalRecords: number;
    isLoading: boolean;
    refetchAll: () => void;
    searchParams: ReturnType<typeof useSearchParams>;
    router: ReturnType<typeof useRouter>;
    pathname: string;
}) {
    const { openAddForm } = useFormContext<OpeningBalanceRow>();

    // This hook must receive router + searchParams to update URL on page/size change
    const tableProps = useDataTableProps({
        data: tableData,
        totalItems: totalRecords,
        searchParams,
        router,
        pathname
    });

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container mx-auto space-y-6 p-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>{/* <Heading title='Fee Amount Entries' description='' /> */}</div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Fee Concession
                    </Button>
                </div>

                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='rounded-xl border bg-white shadow-xl'>
                    <GenericDataTable<IFeeConcessionStudentConcessionGrid>
                        {...tableProps}
                        columns={openingBalanceColumns}
                        isLoading={isLoading}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage={`Loading ${activeTab} Opening Balances...`}
                        noDataTitle={`No ${activeTab} Opening Balance Records Found`}
                        noDataDescription='No records exist for the selected academic year.'
                        totalItems={totalRecords}
                    />
                </CollapsibleSection>

                <FormSections refetch={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, isDeleteFormOpen, selectedRow, closeAddForm, closeDeleteForm, addFormRef } = useFormContext<OpeningBalanceRow>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Opening Balance'
                        description='Enter opening balance for students'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-2xl'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>

                            <AddFeeOpeningBalanceForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDeleteFormOpen && selectedRow && (
                <DeleteOpeningBalanceForm
                    rowData={selectedRow}
                    onClose={closeDeleteForm}
                    onSuccess={() => {
                        closeDeleteForm();
                        refetch();
                    }}
                />
            )}
        </>
    );
}
