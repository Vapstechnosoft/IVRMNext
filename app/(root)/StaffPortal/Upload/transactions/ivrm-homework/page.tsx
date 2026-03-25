'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { HomeWorkUploadedList } from '@/hooks/upload/transactions/useHomeWork';
import type { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import AddHomeWorkForm from './_components/add-form';
import { homeWorkColumns } from './_components/columns';
import ToggleHomeWorkForm from './_components/toggle-form';
import UpdateHomeWorkForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function HomeWorkPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const { data: academicYears, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();

    const payload = {
        asmaY_Id: selectedYear
    };

    console.log('home work payload', selectedYear);

    const { data: response, isLoading, error, refetchAll } = HomeWorkUploadedList(selectedYear ?? 0, searchParams ?? {});

    console.log('home work response', response?.data ?? []);

    useEffect(() => {
        if (academicYears?.data && academicYears.data.length > 0 && !selectedYear) {
            setSelectedYear(academicYears.data[0].asmaY_Id);
        }
    }, [academicYears, selectedYear]);

    return (
        <FormProvider<IHomeWorkDetails>>
            <HomeWorkContent
                data={response}
                isLoading={isLoading}
                error={error}
                selectedYear={selectedYear ?? 0}
                setSelectedYear={setSelectedYear}
                academicYears={academicYears?.data || []}
                academicYearLoading={academicYearLoading}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function HomeWorkContent({
    data,
    isLoading,
    error,
    selectedYear,
    setSelectedYear,
    academicYears,
    academicYearLoading,
    refetchAll
}: {
    data: any;
    isLoading: boolean;
    error: any;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    academicYears: any[];
    academicYearLoading: boolean;
    refetchAll: () => void;
}) {
    const { openAddForm } = useFormContext<any>();

    const tableProps = useDataTableProps(data);
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-4 rounded-lg border bg-white px-5 py-4 shadow-sm'>
                        <Label className='whitespace-nowrap font-semibold'>
                            Academic Year <span className='text-red-600'>*</span>
                        </Label>
                        <Select
                            value={String(selectedYear)}
                            onValueChange={(value) => setSelectedYear(Number(value))}
                            disabled={academicYearLoading}>
                            <SelectTrigger className='w-64'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYearLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : academicYears.length > 0 ? (
                                    academicYears.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value='no-data' disabled>
                                        No years found
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add HomeWork
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Home work Upload'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IHomeWorkDetails>
                        {...tableProps}
                        columns={homeWorkColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading homework...'
                        noDataTitle='No HomeWork Found'
                        noDataDescription='Get started by creating your first homework entry'
                        errorTitle='Error Loading HomeWork'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections yearList={academicYears || []} classList={data?.classlist || []} onSuccess={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({
    onSuccess,
    yearList,
    classList
}: {
    onSuccess: () => void;
    yearList: any[];
    classList: any[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<any>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New HomeWork'
                        description='Fill in the details below to create a new homework entry'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddHomeWorkForm
                                onSuccess={() => {
                                    closeAddForm();
                                    onSuccess();
                                }}
                                classList={classList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit HomeWork'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateHomeWorkForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    onSuccess();
                                }}
                                classList={classList}
                                yearList={yearList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleHomeWorkForm
                    rowData={selectedRow}
                    onClose={() => {
                        closeToggleForm();
                        onSuccess();
                    }}
                />
            )}
        </>
    );
}
