'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterHostel } from '@/hooks/hostel/useMasterHostel';
import { Plus, X } from 'lucide-react';
import { use, useEffect } from 'react';
import AddMasterHostelForm from './_components/add-form';
import UpdateMasterHostelForm from './_components/update-form';
import { masterHostelColumns, IHostelDisplay } from './_components/columns';
import { ICountry, IEmployee, IFacility, IHostel, IMess, IState } from '@/server/hostel/master-hostel/server-action';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// -------------------------
// MAIN PAGE
// -------------------------
export default function MasterHostelPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { hostelList, countries, states, facilities, messes, employees, isLoading, refetch } = useMasterHostel();

    return (
        <FormProvider<IHostelDisplay>>
            <PageContent
                hostelList={hostelList as IHostelDisplay[]}
                countries={countries}
                states={states}
                facilities={facilities}
                messes={messes}
                employees={employees}
                isLoading={isLoading}
                refetch={refetch}
            />
        </FormProvider>
    );
}

// -------------------------
// PAGE CONTENT
// -------------------------
function PageContent({
    hostelList,
    countries,
    states,
    facilities,
    messes,
    employees,
    isLoading,
    refetch
}: {
    hostelList: IHostelDisplay[];
    countries: ICountry[];
    states: IState[];
    facilities: IFacility[];
    messes: IMess[];
    employees: IEmployee[];
    isLoading: boolean;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<IHostelDisplay>();
    const tableProps = useDataTableProps({ data: hostelList, total: hostelList.length });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Hostel
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IHostelDisplay>
                        {...tableProps}
                        columns={masterHostelColumns}
                        isLoading={isLoading}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading hostels...'
                        noDataTitle='No Hostels Found'
                        noDataDescription='Get started by creating your first hostel'
                    />
                </CollapsibleSection>

                {/* Forms & Modals */}
                <FormSections
                    onSuccess={refetch}
                    countries={countries}
                    states={states}
                    facilities={facilities}
                    messes={messes}
                    employees={employees}
                />
            </div>
        </div>
    );
}

// -------------------------
// FORM SECTIONS
// -------------------------
function FormSections({
    onSuccess,
    countries,
    states,
    facilities,
    messes,
    employees
}: {
    onSuccess: () => void;
    countries: ICountry[];
    states: IState[];
    facilities: IFacility[];
    messes: IMess[];
    employees: IEmployee[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isFacilityViewOpen,
        isWardenViewOpen,
        isDocumentViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeFacilityView,
        closeWardenView,
        closeDocumentView,
        addFormRef,
        editFormRef
    } = useFormContext<IHostelDisplay>();

    // For Toggle Form, we can reuse 'toggle-form.tsx' from another module or create one.
    // Given the task explicitly asks for Add/Edit/View, and "Activate/Deactivate" is an action.
    // I haven't created a toggle-form.tsx for hostel.
    // I'll create a simple ToggleMasterHostelForm inline or skip if 'generic' toggle exists?
    // I'll just rely on a standard implementation or implement one quickly if needed.
    // Wait, the "Toggle" usually needs a confirmation dialog. 
    // I can import `ToggleFormWrapper` from `@/components/ui/form/toggle-form-wrapper` directly!
    // And call the server action from there.

    const { deleteHostel } = require('@/server/hostel/master-hostel/server-action'); // Late require or import at top
    // Better import at top, but to avoid conflicts I'll use standard import.

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Master Hostel'
                        description='Create a new hostel record'
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
                            <AddMasterHostelForm
                                onSuccess={() => { closeAddForm(); onSuccess(); }}
                                countries={countries}
                                states={states}
                                facilities={facilities}
                                messes={messes}
                                employees={employees}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Hostel'
                        description='Modify hostel details'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateMasterHostelForm
                                rowData={selectedRow}
                                onSuccess={() => { closeEditForm(); onSuccess(); }}
                                countries={countries}
                                states={states}
                                facilities={facilities}
                                messes={messes}
                                employees={employees}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form (Simulated inline or using Wrapper) */}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterHostelForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={onSuccess}
                />
            )}

            {/* View Modals */}
            <ViewFacilitiesModal
                isOpen={isFacilityViewOpen}
                onClose={closeFacilityView}
                hostel={selectedRow}
            />
            <ViewWardensModal
                isOpen={isWardenViewOpen}
                onClose={closeWardenView}
                hostel={selectedRow}
            />
            <ViewDocumentsModal
                isOpen={isDocumentViewOpen}
                onClose={closeDocumentView}
                hostel={selectedRow}
            />
        </>
    );
}

// Inline Toggle Form for simplicity
import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { deleteHostel } from '@/server/hostel/master-hostel/server-action';
import { toast } from 'sonner';
import { ViewDocumentsModal, ViewFacilitiesModal, ViewWardensModal } from './_components/view-modals';

function ToggleMasterHostelForm({ rowData, onClose, onSuccess }: { rowData: IHostelDisplay, onClose: () => void, onSuccess: () => void }) {
    const onConfirm = async () => {
        try {
            const result = await deleteHostel(rowData.hlmH_Id);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            onClose();
        }
    };

    return (
        <ToggleFormWrapper
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            title={rowData.hlmH_ActiveFlag ? 'Deactivate Hostel' : 'Activate Hostel'}
            description={`Are you sure you want to ${rowData.hlmH_ActiveFlag ? 'deactivate' : 'activate'} ${rowData.hlmH_Name}?`}
        />
    );
}
