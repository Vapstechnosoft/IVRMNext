'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterHoliday } from '@/hooks/hrms/attendance-management/useMasters';
import type { ApiSearchparams } from '@/types';
import type { MasterHolidayGetDataResponseData, ReportListItem } from '@/types/hrms/attendance-management/master-holiday';
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
    // This matches how preadmission handles it
    const searchParams: ApiSearchparams = {
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
    };

    const { data: response, isLoading, error, refetch } = useMasterHoliday(searchParams);

    // Log when data changes
    console.log('📊 [PAGE] MasterHoliday data updated:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        reportListLength: (response?.data as unknown as MasterHolidayGetDataResponseData)?.report_list?.length || 0,
        total: response?.total,
        page: response?.page,
        page_size: response?.page_size,
        isLoading,
        hasError: !!error
    });

    return (
        <FormProvider<MasterHoliday>>
            <MasterHolidayPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function MasterHolidayPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch?: () => void;
}) {
    const { openAddForm } = useFormContext<MasterHoliday>();
    // API returns { success, message, data: { report_list, yeardropdown, ... }, total, page, page_size }
    // Map ReportListItem to MasterHoliday format for table display
    const mappedData = useMemo(() => {
        const reportList = response?.data?.report_list || [];
        console.log('🗺️ [PAGE] Mapping data:', {
            reportListLength: reportList.length,
            total: response?.total,
            mappedDataLength: reportList.length
        });
        return reportList.map((item: ReportListItem): MasterHoliday => {
            // Extract day code from name (e.g., "Monday" -> "MON")
            const dayName = item.FOMHWDD_Name || '';
            const dayCode = dayName.length >= 3 ? dayName.toUpperCase().substring(0, 3) : dayName.toUpperCase();

            return {
                id: Number(item.FOMHWDD_Id) || 0,
                calendarYear: new Date(item.FOMHWDD_FromDate).getFullYear().toString(),
                department: item.HRMD_DepartmentName || '',
                holidayType: item.FOHTWD_HolidayWDType || '',
                name: item.FOMHWDD_Name || '',
                selectedDays: [dayCode],
                fromDate: item.FOMHWDD_FromDate,
                toDate: item.FOMHWDD_ToDate,
                isActive: item.FOMHWD_ActiveFlg ?? true,
                createdAt: new Date()
            };
        });
    }, [response?.data?.report_list]);

    // Create a response-like object for useDataTableProps
    // It expects { data, total, success, message } structure
    const tableResponse = useMemo(() => {
        return {
            data: mappedData,
            total: response?.total || mappedData.length,
            success: response?.success ?? true,
            message: response?.message
        };
    }, [mappedData, response?.total, response?.success, response?.message]);

    const tableProps = useDataTableProps(tableResponse);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
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
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<MasterHoliday>
                        {...tableProps}
                        columns={masterHolidayColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master holiday...'
                        noDataTitle='No Master Holiday Found'
                        noDataDescription='Get started by creating your first master holiday'
                        errorTitle='Error Loading Master Holiday'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections dropdownData={response?.data} />
            </div>
        </div>
    );
}

function FormSections({ dropdownData }: { dropdownData?: MasterHolidayGetDataResponseData }) {
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
