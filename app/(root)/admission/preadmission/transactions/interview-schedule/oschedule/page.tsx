'use client';

import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useOralTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { oralTestScheduleColumns } from './_components/columns';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import OralTestScheduleForm from './_components/add-form';
import StudentListModal from './_components/student-list-modal';
import ParticipantsModal from './_components/participants-modal';

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
            <div className="flex items-center justify-between">
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
                <div className="[&_table_tbody_tr:nth-child(even)]:bg-slate-50/50">
                    <GenericDataTable<IOralTestSchedule>
                        {...tableProps}
                        columns={oralTestScheduleColumns}
                        isLoading={isLoading}
                        error={error}
                        noDataTitle="No Schedules Found"
                        noDataDescription="Create your first oral test schedule to see it here."
                    />
                </div>
            </CollapsibleSection>

            {/* Modals */}
            {isDetailsViewOpen && selectedRow && (
                <StudentListModal 
                    paotsId={selectedRow.paotS_Id} 
                    isOpen={isDetailsViewOpen} 
                    onClose={closeDetailsView} 
                    scheduleName={selectedRow.paotS_ScheduleName}
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
                    paotsId={selectedRow.paotS_Id} 
                    isOpen={isToggleFormOpen} 
                    onClose={closeToggleForm} 
                    scheduleName={selectedRow.paotS_ScheduleName}
                    isRemarks={true}
                />
            )}
        </div>
    );
}
