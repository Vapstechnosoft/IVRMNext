'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { useMasterRoom } from '@/hooks/hostel/useMasterRoom';
import { deleteRoom, IFacility, IHostel, IRoomDisplay } from '@/server/hostel/master-room/server-action';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { toast } from 'sonner';
import AddMasterRoomForm from './_components/add-form';
import { masterRoomColumns } from './_components/columns';
import UpdateMasterRoomForm from './_components/update-form';
import { ViewFacilitiesModal } from './_components/view-modals';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// -------------------------
// MAIN PAGE
// -------------------------
export default function MasterRoomPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { roomList, hostels, facilities, isLoading, refetch } = useMasterRoom();

    return (
        <FormProvider<IRoomDisplay>>
            <PageContent
                roomList={roomList}
                hostels={hostels}
                facilities={facilities}
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
    roomList,
    hostels,
    facilities,
    isLoading,
    refetch
}: {
    roomList: IRoomDisplay[];
    hostels: IHostel[];
    facilities: IFacility[];
    isLoading: boolean;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<IRoomDisplay>();
    const tableProps = useDataTableProps({ data: roomList, total: roomList.length });

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
                        Add Room
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IRoomDisplay>
                        {...tableProps}
                        columns={masterRoomColumns}
                        isLoading={isLoading}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading rooms...'
                        noDataTitle='No Rooms Found'
                        noDataDescription='Get started by creating your first room'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections
                    onSuccess={refetch}
                    hostels={hostels}
                    facilities={facilities}
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
    hostels,
    facilities
}: {
    onSuccess: () => void;
    hostels: IHostel[];
    facilities: IFacility[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isFacilityViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeFacilityView,
        addFormRef,
        editFormRef
    } = useFormContext<IRoomDisplay>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Master Room'
                        description='Create a new room'
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
                            <AddMasterRoomForm
                                onSuccess={() => { closeAddForm(); onSuccess(); }}
                                hostels={hostels}
                                facilities={facilities}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Room'
                        description='Modify room details'
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
                            <UpdateMasterRoomForm
                                rowData={selectedRow}
                                onSuccess={() => { closeEditForm(); onSuccess(); }}
                                hostels={hostels}
                                facilities={facilities}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterRoomForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={onSuccess}
                />
            )}
        </>
    );
}

function ToggleMasterRoomForm({ rowData, onClose, onSuccess }: { rowData: IRoomDisplay, onClose: () => void, onSuccess: () => void }) {
    const onConfirm = async () => {
        try {
            const result = await deleteRoom(rowData.hrmrM_Id);
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
            title={rowData.hrmrM_ActiveFlag ? 'Deactivate Room' : 'Activate Room'}
            description={`Are you sure you want to ${rowData.hrmrM_ActiveFlag ? 'deactivate' : 'activate'} Room ${rowData.hrmrM_RoomNo}?`}
        />
    );
}
