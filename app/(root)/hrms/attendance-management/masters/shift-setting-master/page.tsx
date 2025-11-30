'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { HRMSCollapsibleSection } from '../_components/hrms-collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useShiftSettingMaster } from '@/hooks/hrms/attendance-management/useMasters';
import type { ApiSearchparams } from '@/types';
import type { ShiftSettingMasterReportListItem } from '@/types/hrms/attendance-management/shift-setting-master';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import AddShiftSettingMasterForm from './_components/add-form';
import { type ShiftSetting, shiftSettingColumns } from './_components/columns';
import DeleteShiftSettingMasterForm from './_components/delete-form';
import UpdateShiftSettingMasterForm from './_components/update-form';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function ShiftSettingMasterPage(props: { searchParams: SearchParams }) {
    const rawSearchParams = use(props.searchParams);
    // Convert Next.js searchParams (string | string[]) to ApiSearchparams format
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
    const { data: response, isLoading, error } = useShiftSettingMaster(searchParams);
    return (
        <FormProvider<ShiftSetting>>
            <ShiftSettingMasterPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}
function ShiftSettingMasterPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ShiftSetting>();
    // Transform API response to ShiftSetting format
    const transformedData = useMemo(() => {
        if (!response?.data?.report_list) {
            return [];
        }
        const reportList = response.data.report_list as ShiftSettingMasterReportListItem[];
        // Map API response to ShiftSetting interface
        // TODO: Update field mapping based on actual API response structure
        return reportList.map((item) => ({
            id: item.id || 0,
            shiftName: item.shiftName || '',
            shiftStartTime: item.shiftStartTime || '',
            shiftEndTime: item.shiftEndTime || '',
            lunchStartTime: item.lunchStartTime || '',
            lunchEndTime: item.lunchEndTime || '',
            totalWorkingHours: item.totalWorkingHours || '',
            halfDayWorkingHours: item.halfDayWorkingHours || '',
            lunchHours: item.lunchHours || '',
            delayPerShift: item.delayPerShift || '',
            earlyPerShift: item.earlyPerShift || '',
            isActive: item.isActive ?? true
        })) as ShiftSetting[];
    }, [response]);
    // Create a response object that useDataTableProps expects
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
                        Add Shift Setting
                    </Button>
                </div>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable<ShiftSetting>
                        {...tableProps}
                        columns={shiftSettingColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading shift settings...'
                        noDataTitle='No Shift Settings Found'
                        noDataDescription='Get started by creating your first shift setting'
                        errorTitle='Error Loading Shift Settings'
                    />
                </CollapsibleSection>
                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}
function FormSections() {
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
    } = useFormContext<ShiftSetting>();
    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <HRMSCollapsibleSection
                        title='Add Shift Setting'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        closeButton={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <AddShiftSettingMasterForm onSuccess={closeAddForm} />
                    </HRMSCollapsibleSection>
                </div>
            )}
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <HRMSCollapsibleSection
                        title='Update Shift Setting'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'
                        closeButton={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <UpdateShiftSettingMasterForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                    </HRMSCollapsibleSection>
                </div>
            )}
            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && <DeleteShiftSettingMasterForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
