'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWrittenTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-written-test-schedule';
import type { IWrittenTestSchedule } from '@/types/admission/preadmission/transactions/written-test-schedule';
import { format } from 'date-fns';
import { FileSpreadsheet, Plus, Search, X } from 'lucide-react';
import React from 'react';
import * as XLSX from 'xlsx';
import WrittenTestScheduleForm from './_components/add-form';
import { writtenTestScheduleColumns } from './_components/columns';
import StudentListModal from './_components/student-list-modal';

export default function WrittenTestSchedulePage() {
    return (
        <FormProvider<IWrittenTestSchedule>>
            <WrittenTestScheduleContent />
        </FormProvider>
    );
}

function WrittenTestScheduleContent() {
    const { data: response, isLoading, error, refetch } = useWrittenTestScheduleDetails();
    const {
        openAddForm,
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        selectedRow,
        isDetailsViewOpen,
        closeDetailsView
    } = useFormContext<IWrittenTestSchedule>();

    const mappedScheduleData = React.useMemo(() => {
        if (!response?.writtenTestSchedule) return [];
        return response.writtenTestSchedule.map((schedule: any) => {
            // Find the count for this schedule in the studentDetails array
            const countObj = response.studentDetails?.find(
                (sd: any) => sd.pawts_id === schedule.pawtS_Id || sd.pawtS_Id === schedule.pawtS_Id
            );
            return {
                ...schedule,
                count: countObj?.count || 0
            };
        });
    }, [response]);

    const handleExportExcel = () => {
        if (!mappedScheduleData || mappedScheduleData.length === 0) return;

        const exportData = mappedScheduleData.map((item, index) => ({
            'Sl.No': index + 1,
            'Schedule Name': item.pawtS_ScheduleName || '',
            'Student Count': item.count || 0,
            'Schedule Date': item.pawtS_ScheduleDate ? format(new Date(item.pawtS_ScheduleDate), 'dd-MM-yyyy') : '',
            'Time From': item.pawtS_ScheduleTime || '',
            'Time To': item.pawtS_ScheduleTimeTo || '',
            Remarks: item.pawtS_Remarks || 'N/A'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        XLSX.utils.book_append_sheet(wb, ws, 'WrittenTestSchedule');
        XLSX.writeFile(wb, `Written_Test_Schedule_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    };

    const tableProps = {
        data: mappedScheduleData,
        totalItems: mappedScheduleData.length,
        success: true
    };
    return (
        <div className='container space-y-4 py-6'>
            <div className='no-print flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='font-bold text-3xl text-blue-800 tracking-tight'>Written Test/Aptitude Schedule</h1>
                    <p className='text-muted-foreground'>Manage and schedule written tests for preadmission students.</p>
                </div>
                <Button
                    onClick={openAddForm}
                    disabled={isAddFormOpen || isEditFormOpen}
                    className='shadow-lg transition-all hover:shadow-xl'>
                    <Plus className='mr-2 h-4 w-4' /> Add Written Test Schedule
                </Button>
            </div>

            {/* Add/Edit Form Section */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Schedule'
                        description='Define a new written test schedule and assign students.'
                        defaultOpen={true}
                        variant='outline'
                        rightElement={
                            <Button variant='ghost' size='sm' onClick={closeAddForm}>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                        }>
                        <WrittenTestScheduleForm
                            onSuccess={() => {
                                closeAddForm();
                                refetch();
                            }}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Schedule'
                        description={`Updating schedule: ${selectedRow.pawtS_ScheduleName}`}
                        defaultOpen={true}
                        variant='outline'
                        rightElement={
                            <Button variant='ghost' size='sm' onClick={closeEditForm}>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                        }>
                        <WrittenTestScheduleForm
                            onSuccess={() => {
                                closeEditForm();
                                refetch();
                            }}
                            initialData={selectedRow}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Data Table Section */}
            <CollapsibleSection title='Existing Schedules' defaultOpen={true} className='shadow-md'>
                <div className='flex flex-col'>
                    {/* Toolbar Row 1 */}
                    <div className='no-print flex items-center justify-between border-b bg-slate-50 px-4 py-2'>
                        <span className='font-bold text-blue-800 text-xs uppercase'>Written Test Scheduled List</span>
                        <div className='flex items-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='printBrake' defaultChecked />
                                <Label htmlFor='printBrake' className='font-bold text-[10px]'>
                                    Print Page Brake
                                </Label>
                            </div>
                            <div className='flex items-center gap-2 border-l pl-4'>
                                {/* <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-slate-700"
                                    onClick={() => window.print()}
                                    title="Print Schedule"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button> */}
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 text-green-700'
                                    onClick={handleExportExcel}
                                    title='Export to Excel'>
                                    <FileSpreadsheet className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar Row 2 */}
                    <div className='no-print flex items-center justify-between border-b bg-white px-4 py-2'>
                        <div className='flex items-center gap-12'>
                            <div className='flex items-center gap-2 font-bold text-[10px] uppercase'>
                                Grid Records :{' '}
                                <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-500 px-1 text-white'>
                                    {response?.writtenTestSchedule?.length || 0}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-center gap-8'>
                            <div className='relative'>
                                <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3 w-3 text-slate-400' />
                                <Input placeholder='search here...' className='h-7 w-48 border-slate-300 bg-slate-50 pl-8 text-[10px]' />
                            </div>
                        </div>
                    </div>

                    <div className='printable-content [&_tbody_tr:nth-child(even)]:bg-slate-50/50 [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th]:border-slate-200 [&_thead_tr_th]:border-r [&_thead_tr_th]:py-3 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-black [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black'>
                        <GenericDataTable<IWrittenTestSchedule>
                            {...tableProps}
                            columns={writtenTestScheduleColumns}
                            isLoading={isLoading}
                            error={error}
                            isSearchRequired={false}
                            noDataTitle='No Schedules Found'
                            noDataDescription='Create your first written test schedule to see it here.'
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* Modals */}
            {isDetailsViewOpen && selectedRow && (
                <StudentListModal rowData={selectedRow} isOpen={isDetailsViewOpen} onClose={closeDetailsView} />
            )}
        </div>
    );
}
