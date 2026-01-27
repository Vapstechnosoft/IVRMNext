'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { useMasterFloor } from '@/hooks/hostel/useMasterFloor';
import { deleteFloor, IFloorDisplay, IFacility, IHostel } from '@/server/hostel/master-floor/server-action';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { toast } from 'sonner';
import AddMasterFloorForm from './_components/add-form';
import { masterFloorColumns } from './_components/columns';
import UpdateMasterFloorForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// -------------------------
// MAIN PAGE
// -------------------------
export default function MasterFloorPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { floorList, hostelList, facilityList, isLoading, refetch } = useMasterFloor();

    return (
        <FormProvider<IFloorDisplay>>
            <PageContent
                floorList={floorList}
                hostelList={hostelList}
                facilityList={facilityList}
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
    floorList,
    hostelList,
    facilityList,
    isLoading,
    refetch
}: {
    floorList: IFloorDisplay[];
    hostelList: IHostel[];
    facilityList: IFacility[];
    isLoading: boolean;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<IFloorDisplay>();
    const tableProps = useDataTableProps({ data: floorList, total: floorList.length });

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
                        Add Master Floor
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IFloorDisplay>
                        {...tableProps}
                        columns={masterFloorColumns}
                        isLoading={isLoading}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading floors...'
                        noDataTitle='No Floors Found'
                        noDataDescription='Get started by creating your first floor'
                    />
                </CollapsibleSection>

                {/* Forms & Modals */}
                <FormSections
                    onSuccess={refetch}
                    hostelList={hostelList}
                    facilityList={facilityList}
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
    hostelList,
    facilityList
}: {
    onSuccess: () => void;
    hostelList: IHostel[];
    facilityList: IFacility[];
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
    } = useFormContext<IFloorDisplay>();

    const onConfirmToggle = async () => {
        if (!selectedRow) return;
        try {
            const result = await deleteFloor(selectedRow.hlmF_Id);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            closeToggleForm();
        }
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Master Floor'
                        description='Create a new floor record'
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
                            <AddMasterFloorForm
                                onSuccess={() => { closeAddForm(); onSuccess(); }}
                                hostels={hostelList}
                                facilities={facilityList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Floor'
                        description='Modify floor details'
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
                            <UpdateMasterFloorForm
                                rowData={selectedRow}
                                onSuccess={() => { closeEditForm(); onSuccess(); }}
                                hostels={hostelList}
                                facilities={facilityList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleFormWrapper
                    isOpen={true}
                    onClose={closeToggleForm}
                    onConfirm={onConfirmToggle}
                    title={selectedRow.hrmF_ActiveFlag ? 'Deactivate Floor' : 'Activate Floor'}
                    description={`Are you sure you want to ${selectedRow.hrmF_ActiveFlag ? 'deactivate' : 'activate'} ${selectedRow.hrmF_FloorName}?`}
                />
            )}
        </>
    );
}
