'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterHoliday } from '@/hooks/hrms/attendance-management/useMasters';
import type { ApiSearchparams } from '@/types';
import type { ReportListItem } from '@/types/hrms/attendance-management/master-holiday';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import AddMasterHolidayForm from './_components/add-form';
import { type MasterHoliday, masterHolidayColumns } from './_components/columns';
import DeleteMasterHolidayForm from './_components/delete-form';
import UpdateMasterHolidayForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterHolidayPage(props: { searchParams: SearchParams }) {
    const rawSearchParams = use(props.searchParams);

    // Convert Next.js searchParams (string | string[]) to ApiSearchparams format
    // This matches how preadmission and other master modules handle it
    const searchParams: ApiSearchparams = useMemo(
        () => ({
            page:
                typeof rawSearchParams?.page === 'string'
                    ? Number.parseInt(rawSearchParams.page, 10)
                    : Array.isArray(rawSearchParams?.page)
                      ? Number.parseInt(rawSearchParams.page[0], 10)
                      : typeof rawSearchParams?.page === 'number'
                        ? rawSearchParams.page
                        : undefined,
            page_size:
                typeof rawSearchParams?.page_size === 'string'
                    ? Number.parseInt(rawSearchParams.page_size, 10)
                    : Array.isArray(rawSearchParams?.page_size)
                      ? Number.parseInt(rawSearchParams.page_size[0], 10)
                      : typeof rawSearchParams?.page_size === 'number'
                        ? rawSearchParams.page_size
                        : undefined,
            search_query:
                typeof rawSearchParams?.search_query === 'string'
                    ? rawSearchParams.search_query
                    : Array.isArray(rawSearchParams?.search_query)
                      ? rawSearchParams.search_query[0]
                      : undefined,
            search_column:
                typeof rawSearchParams?.search_column === 'string'
                    ? rawSearchParams.search_column
                    : Array.isArray(rawSearchParams?.search_column)
                      ? rawSearchParams.search_column[0]
                      : undefined,
            sort_column:
                typeof rawSearchParams?.sort_column === 'string'
                    ? rawSearchParams.sort_column
                    : Array.isArray(rawSearchParams?.sort_column)
                      ? rawSearchParams.sort_column[0]
                      : undefined,
            sort_direction:
                typeof rawSearchParams?.sort_direction === 'string'
                    ? rawSearchParams.sort_direction
                    : Array.isArray(rawSearchParams?.sort_direction)
                      ? rawSearchParams.sort_direction[0]
                      : undefined
        }),
        [rawSearchParams]
    );

    const { data: response, isLoading, error } = useMasterHoliday(searchParams);

    return (
        <FormProvider<MasterHoliday>>
            <MasterHolidayPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterHolidayPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<MasterHoliday>();

    // Transform API response to MasterHoliday format
    const transformedData = useMemo(() => {
        if (!response?.data?.report_list) {
            return [];
        }
        const reportList = response.data.report_list as ReportListItem[];
        return reportList.map(
            (item): MasterHoliday => ({
                id: item.FOMHWDD_Id,
                createdAt: new Date(),
                calendarYear: '', // Extract from API if available
                department: item.HRMD_DepartmentName,
                holidayType: item.FOHTWD_HolidayWDType,
                name: item.FOMHWDD_Name,
                selectedDays: [],
                fromDate: item.FOMHWDD_FromDate,
                toDate: item.FOMHWDD_ToDate,
                isActive: item.FOMHWD_ActiveFlg
            })
        );
    }, [response]);

    // Create a response object that useDataTableProps expects
    // useDataTableProps expects: { data: [...], total: number, success: boolean, message: string }
    // Note: total comes from response.total (server already extracted it from inner response)
    const tableResponse = useMemo(() => {
        const total = response?.total || 0;

        return {
            data: transformedData,
            total: total,
            success: response?.success ?? true,
            message: response?.message || ''
        };
    }, [transformedData, response]);

    const tableProps = useDataTableProps(tableResponse);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Holiday
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable<MasterHoliday>
                        {...tableProps}
                        columns={masterHolidayColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master holidays...'
                        noDataTitle='No Master Holidays Found'
                        noDataDescription='Get started by creating your first master holiday'
                        errorTitle='Error Loading Holidays'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections dropdownData={response?.data} />

                {/* Debug: Log response structure */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ display: 'none' }}>
                        {(() => {
                            return null;
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

function FormSections({ dropdownData }: { dropdownData: any }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<MasterHoliday>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
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
                            <AddMasterHolidayForm onSuccess={closeAddForm} dropdownData={dropdownData} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
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
                            <UpdateMasterHolidayForm selectedRow={selectedRow} onSuccess={closeEditForm} dropdownData={dropdownData} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && <DeleteMasterHolidayForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
