'use client';

import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useOralTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { oralTestScheduleColumns } from './_components/columns';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet, Search, Loader2, Plus, X } from 'lucide-react';
import OralTestScheduleForm from './_components/add-form';
import StudentListModal from './_components/student-list-modal';
import ParticipantsModal from './_components/participants-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

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
        openAddForm, isAddFormOpen, closeAddForm, addFormRef,
        isEditFormOpen, closeEditForm, editFormRef, selectedRow,
        isDetailsViewOpen, closeDetailsView,
        isMappedviewOpen, closeMappedview,
        isToggleFormOpen, closeToggleForm
    } = useFormContext<IOralTestSchedule>();

    const tableProps = useDataTableProps(response, { dataKey: 'oralTestSchedule' });

    return (
        <div className="container space-y-4 py-6">
            <div className="flex items-center justify-between no-print">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-blue-800">Oral Test/Interaction Schedule</h1>
                    <p className="text-muted-foreground">Manage and schedule oral tests for preadmission students.</p>
                </div>
                <Button
                    onClick={openAddForm}
                    disabled={isAddFormOpen || isEditFormOpen}
                    className="shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Schedule
                </Button>
            </div>

            {/* Add/Edit Form Section */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title="Add New Schedule"
                        description="Define a new oral test schedule and assign students."
                        defaultOpen={true}
                        variant="outline"
                        rightElement={
                            <Button variant="ghost" size="sm" onClick={closeAddForm}>
                                <X className="h-4 w-4 mr-1" /> Close
                            </Button>
                        }
                    >
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
                        title="Edit Schedule"
                        description={`Updating schedule: ${selectedRow.paotS_ScheduleName}`}
                        defaultOpen={true}
                        variant="outline"
                        rightElement={
                            <Button variant="ghost" size="sm" onClick={closeEditForm}>
                                <X className="h-4 w-4 mr-1" /> Close
                            </Button>
                        }
                    >
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
            <CollapsibleSection
                title="Existing Schedules"
                defaultOpen={true}
                className="shadow-md"
            >
                <div className="flex flex-col">
                    {/* Toolbar Row 1 */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b no-print">
                        <span className="text-blue-800 font-bold text-xs uppercase">Oral Test\Interaction Scheduled List</span>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="onlyScheduled" />
                                <Label htmlFor="onlyScheduled" className="text-[10px] font-bold">Only Scheduled List</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="printBrake" defaultChecked />
                                <Label htmlFor="printBrake" className="text-[10px] font-bold">Print Page Brake</Label>
                            </div>
                            <div className="flex items-center gap-2 border-l pl-4">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-700">
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700">
                                    <FileSpreadsheet className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar Row 2 */}
                    <div className="flex items-center justify-between px-4 py-2 bg-white border-b no-print">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                Grid Records : <span className="bg-slate-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{response?.oralTestSchedule?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                Scheduled Students: <span className="bg-slate-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {response?.oralTestSchedule?.reduce((acc: number, curr: any) => acc + (curr.ocount || 0), 0) || 0}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <RadioGroup defaultValue="12" className="flex items-center gap-4">
                                <div className="flex items-center space-x-1.5">
                                    <RadioGroupItem value="12" id="r1" className="h-3 w-3" />
                                    <Label htmlFor="r1" className="text-[10px] font-bold">12 Hours</Label>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <RadioGroupItem value="24" id="r2" className="h-3 w-3" />
                                    <Label htmlFor="r2" className="text-[10px] font-bold">24 Hours</Label>
                                </div>
                            </RadioGroup>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                <Input
                                    placeholder="search here..."
                                    className="h-7 w-48 pl-8 text-[10px] bg-slate-50 border-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="[&_thead_tr_th]:text-black [&_thead_tr_th]:font-bold [&_thead_tr_th]:py-3 [&_thead_tr_th]:border-r [&_thead_tr_th]:border-slate-200 [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black [&_tbody_tr:nth-child(even)]:bg-slate-50/50">
                        <GenericDataTable<IOralTestSchedule>
                            {...tableProps}
                            columns={oralTestScheduleColumns}
                            isLoading={isLoading}
                            error={error}
                            isSearchRequired={false}
                            noDataTitle="No Schedules Found"
                            noDataDescription="Create your first oral test schedule to see it here."
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* Modals */}
            {isDetailsViewOpen && selectedRow && (
                <StudentListModal
                    rowData={selectedRow}
                    isOpen={isDetailsViewOpen}
                    onClose={closeDetailsView}
                />
            )}

            {isMappedviewOpen && selectedRow && (
                <ParticipantsModal
                    rowData={selectedRow}
                    isOpen={isMappedviewOpen}
                    onClose={closeMappedview}
                />
            )}

            {/* Remarks Modal - reused ToggleForm for this */}
            {isToggleFormOpen && selectedRow && (
                <StudentListModal
                    rowData={selectedRow}
                    isOpen={isToggleFormOpen}
                    onClose={closeToggleForm}
                    isRemarks={true}
                />
            )}
        </div>
    );
}
