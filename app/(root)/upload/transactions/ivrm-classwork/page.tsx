'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { ClassWorkUploadedList } from '@/hooks/upload/transactions/useClassWork';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import AddClassWorkForm from './_components/add-form';
import { classWorkColumns } from './_components/columns';
import ToggleClassWorkForm from './_components/toggle-form';
import UpdateClassWorkForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ClassWorkPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [selectedYear, setSelectedYear] = useState<number>(0);

    const { data: academicYears, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();


    const payload = {
        asmaY_Id: selectedYear
    };

    const { data: response, isLoading, error, refetchAll } = ClassWorkUploadedList(payload, searchParams ?? {});


    useEffect(() => {
        if (academicYears?.data && academicYears.data.length > 0 && !selectedYear) {
            setSelectedYear(academicYears.data[0].asmaY_Id);
        }
    }, [academicYears, selectedYear]);


    return (
        <FormProvider<IClassWorkDetails>>
            <ClassWorkContent
                data={response}
                isLoading={isLoading}
                error={error}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                academicYears={academicYears?.data || []}
                academicYearLoading={academicYearLoading}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function ClassWorkContent({
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
                        Add ClassWork
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Class work Upload'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClassWorkDetails>
                        {...tableProps}
                        columns={classWorkColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading classwork...'
                        noDataTitle='No ClassWork Found'
                        noDataDescription='Get started by creating your first classwork entry'
                        errorTitle='Error Loading ClassWork'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections yearList={data?.yearlist || []} classList={data?.classlist || []} onSuccess={refetchAll} />
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
                        title='Add New ClassWork'
                        description='Fill in the details below to create a new classwork entry'
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
                            <AddClassWorkForm
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
                        title='Edit ClassWork'
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
                            <UpdateClassWorkForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    onSuccess();
                                }}
                                classList={[]}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleClassWorkForm
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
