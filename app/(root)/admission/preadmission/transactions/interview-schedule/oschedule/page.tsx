'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOralTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import type { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { FileSpreadsheet, Plus, Printer, Search, X } from 'lucide-react';
import OralTestScheduleForm from './_components/add-form';
import { oralTestScheduleColumns } from './_components/columns';
import ParticipantsModal from './_components/participants-modal';
import StudentListModal from './_components/student-list-modal';

export default function OralTestSchedulePage() {
    return (
        <FormProvider<IOralTestSchedule>>
            <OralTestScheduleContent />
        </FormProvider>
    );
}

function OralTestScheduleContent() {
    const { data: response, isLoading, error, refetch } = useOralTestScheduleDetails() as any;
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
        closeDetailsView,
        isMappedviewOpen,
        closeMappedview,
        isToggleFormOpen,
        closeToggleForm
    } = useFormContext<IOralTestSchedule>();

    const tableProps = useDataTableProps(response, { dataKey: 'oralTestSchedule' });

    return (
        <div className='container space-y-4 py-6'>
            <div className='no-print flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='font-bold text-3xl text-blue-800 tracking-tight'>Oral Test/Interaction Schedule</h1>
                    <p className='text-muted-foreground'>Manage and schedule oral tests for preadmission students.</p>
                </div>
                <Button
                    onClick={openAddForm}
                    disabled={isAddFormOpen || isEditFormOpen}
                    className='shadow-lg transition-all hover:shadow-xl'>
                    <Plus className='mr-2 h-4 w-4' /> Add Schedule
                </Button>
            </div>

            {/* Add/Edit Form Section */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Schedule'
                        description='Define a new oral test schedule and assign students.'
                        defaultOpen={true}
                        variant='outline'
                        rightElement={
                            <Button variant='ghost' size='sm' onClick={closeAddForm}>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                        }>
                        <OralTestScheduleForm
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
                        description={`Updating schedule: ${selectedRow.paotS_ScheduleName}`}
                        defaultOpen={true}
                        variant='outline'
                        rightElement={
                            <Button variant='ghost' size='sm' onClick={closeEditForm}>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                        }>
                        <OralTestScheduleForm
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
                        <span className='font-bold text-blue-800 text-xs uppercase'>Oral Test\Interaction Scheduled List</span>
                        <div className='flex items-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='onlyScheduled' />
                                <Label htmlFor='onlyScheduled' className='font-bold text-[10px]'>
                                    Only Scheduled List
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='printBrake' defaultChecked />
                                <Label htmlFor='printBrake' className='font-bold text-[10px]'>
                                    Print Page Brake
                                </Label>
                            </div>
                            <div className='flex items-center gap-2 border-l pl-4'>
                                <Button variant='ghost' size='icon' className='h-6 w-6 text-slate-700'>
                                    <Printer className='h-4 w-4' />
                                </Button>
                                <Button variant='ghost' size='icon' className='h-6 w-6 text-green-700'>
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
                                    {response?.oralTestSchedule?.length || 0}
                                </span>
                            </div>
                            <div className='flex items-center gap-2 font-bold text-[10px] uppercase'>
                                Scheduled Students:{' '}
                                <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-500 px-1 text-white'>
                                    {response?.oralTestSchedule?.length || 0}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-center gap-8'>
                            <RadioGroup defaultValue='12' className='flex items-center gap-4'>
                                <div className='flex items-center space-x-1.5'>
                                    <RadioGroupItem value='12' id='r1' className='h-3 w-3' />
                                    <Label htmlFor='r1' className='font-bold text-[10px]'>
                                        12 Hours
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-1.5'>
                                    <RadioGroupItem value='24' id='r2' className='h-3 w-3' />
                                    <Label htmlFor='r2' className='font-bold text-[10px]'>
                                        24 Hours
                                    </Label>
                                </div>
                            </RadioGroup>

                            <div className='relative'>
                                <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3 w-3 text-slate-400' />
                                <Input placeholder='search here...' className='h-7 w-48 border-slate-300 bg-slate-50 pl-8 text-[10px]' />
                            </div>
                        </div>
                    </div>

                    <div className='[&_tbody_tr:nth-child(even)]:bg-slate-50/50 [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th]:border-slate-200 [&_thead_tr_th]:border-r [&_thead_tr_th]:py-3 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-black [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black'>
                        <GenericDataTable<IOralTestSchedule>
                            {...tableProps}
                            columns={oralTestScheduleColumns}
                            isLoading={isLoading}
                            error={error}
                            isSearchRequired={false}
                            noDataTitle='No Schedules Found'
                            noDataDescription='Create your first oral test schedule to see it here.'
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* Modals */}
            {isDetailsViewOpen && selectedRow && (
                <StudentListModal rowData={selectedRow} isOpen={isDetailsViewOpen} onClose={closeDetailsView} />
            )}

            {isMappedviewOpen && selectedRow && (
                <ParticipantsModal rowData={selectedRow} isOpen={isMappedviewOpen} onClose={closeMappedview} />
            )}

            {/* Remarks Modal - reused ToggleForm for this */}
            {isToggleFormOpen && selectedRow && (
                <StudentListModal rowData={selectedRow} isOpen={isToggleFormOpen} onClose={closeToggleForm} isRemarks={true} />
            )}
        </div>
    );
}
