'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeeConcessionStudentConcessionGrid, useconcessionacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddFeeOpeningBalanceForm from './_components/add-form';
import DeleteOpeningBalanceForm from './_components/delete-form';

import type { IFeeConcessionStudentConcessionGrid } from '@/types/fees/transactions/transactions';
import { concessionColumns } from './_components/columns';

export default function FeeConcessionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [MI_ID] = useState<number>(30); // Change dynamically if needed
    const [selectedAsmaY_Id, setSelectedAsmaY_Id] = useState<number | null>(null);
    const [asmcL_Id] = useState<number>(0);

    // Fetch academic years
    const { data: academicYearResponse, isLoading: loadingYears } = useconcessionacademicyerdropdowndatafee(MI_ID);
    const academicYears = academicYearResponse?.data || [];

    // Auto-select first academic year on load if none selected
    useEffect(() => {
        if (!loadingYears && academicYears.length > 0 && !selectedAsmaY_Id) {
            const latestYear = academicYears[0]; // or sort to get current/latest
            setSelectedAsmaY_Id(latestYear.asmaY_Id);
        }
    }, [academicYears, loadingYears, selectedAsmaY_Id]);

    const apiSearchParams = searchParams ? Object.fromEntries(searchParams.entries()) : {};

    // Fetch grid data based on selected academic year
    const {
        data: response,
        isLoading,
        refetch,
        refetchAll
    } = useFeeConcessionStudentConcessionGrid(MI_ID, selectedAsmaY_Id || 0, asmcL_Id, apiSearchParams as any);

    const tableData: IFeeConcessionStudentConcessionGrid[] = response?.data ?? [];
    const totalRecords = response?.total ?? 0;

    const handleAcademicYearChange = (value: string) => {
        const newAsmaY_Id = Number.parseInt(value, 10);
        setSelectedAsmaY_Id(newAsmaY_Id);
    };

    return (
        <FormProvider<IFeeConcessionStudentConcessionGrid>>
            <PageContent
                academicYears={academicYears}
                loadingYears={loadingYears}
                selectedAsmaY_Id={selectedAsmaY_Id}
                onAcademicYearChange={handleAcademicYearChange}
                tableData={tableData}
                totalRecords={totalRecords}
                isLoading={isLoading || loadingYears}
                refetchAll={refetchAll ?? refetch}
                searchParams={searchParams}
                router={router}
                pathname={pathname}
            />
        </FormProvider>
    );
}

function PageContent({
    academicYears,
    loadingYears,
    selectedAsmaY_Id,
    onAcademicYearChange,
    tableData,
    totalRecords,
    isLoading,
    refetchAll,
    searchParams,
    router,
    pathname
}: {
    academicYears: any[];
    loadingYears: boolean;
    selectedAsmaY_Id: number | null;
    onAcademicYearChange: (value: string) => void;
    tableData: IFeeConcessionStudentConcessionGrid[];
    totalRecords: number;
    isLoading: boolean;
    refetchAll: () => void;
    searchParams: ReturnType<typeof useSearchParams>;
    router: ReturnType<typeof useRouter>;
    pathname: string;
}) {
    const { openAddForm } = useFormContext<IFeeConcessionStudentConcessionGrid>();

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
                {/* Header with Academic Year Dropdown + Add Button */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        {/* Academic Year Dropdown */}
                        <div className='flex min-w-[240px] flex-col gap-2'>
                            <Label className='font-medium'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedAsmaY_Id?.toString() || ''} onValueChange={onAcademicYearChange} disabled={loadingYears}>
                                <SelectTrigger className='h-12'>
                                    <SelectValue placeholder={loadingYears ? 'Loading...' : 'Select Academic Year'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((ay: any) => (
                                        <SelectItem key={ay.asmaY_Id} value={String(ay.asmaY_Id)}>
                                            {ay.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex items-center gap-4'>
                        {/* Add Button */}
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='mt-8 w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg' // mt-8 to align with select
                        >
                            <Plus className='mr-2 h-4 w-4' />
                            Add Fee Concession
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='rounded-xl border bg-white shadow-xl'>
                    <GenericDataTable<IFeeConcessionStudentConcessionGrid>
                        {...tableProps}
                        columns={concessionColumns}
                        isLoading={isLoading}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading concessions...'
                        noDataTitle='No Concession Records Found'
                        noDataDescription='No records exist for the selected filters.'
                        totalItems={totalRecords}
                    />
                </CollapsibleSection>

                <FormSections refetch={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const { isAddFormOpen, isDeleteFormOpen, selectedRow, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<IFeeConcessionStudentConcessionGrid>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Concession'
                        description='Apply concession to student'
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
