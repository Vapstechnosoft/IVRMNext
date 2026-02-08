'use client';

import { EventsMappingColumns } from './columns';
import EventsMappingForm from './add-update-form';
import ToggleEventsMappingForm from './toggle-form';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IEventsMapping } from '@/types/alumni/master-coe';
import { Plus, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { getCOEMappingDetails, getViewRecords, getPageDetailsMap } from '@/server/alumni/master-coe';
import ViewDetailsDialog from '../view-details-dialog';

interface EventsMappingContentProps {
    initialData: any;
    isLoading?: boolean;
}

export default function EventsMappingContent({ initialData, isLoading = false }: EventsMappingContentProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDetailsViewOpen,
        selectedRow,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext<IEventsMapping>();

    const [mappingData, setMappingData] = useState<any[]>([]);
    const [loadingMappings, setLoadingMappings] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    const fetchMappings = useCallback(async () => {
        setLoadingMappings(true);
        try {
            const res = await getCOEMappingDetails();
            const data = (res as any).data || res;
            setMappingData(data.event_mapping_list || data.mapped_eventlist || []);
        } catch (error) {
            console.error('Failed to fetch mapping details');
        } finally {
            setLoadingMappings(false);
        }
    }, []);

    useEffect(() => {
        const data = initialData?.data || initialData;
        const initialMappings = data?.event_mapping_list || data?.mapped_eventlist || [];
        if (initialMappings.length > 0) {
            setMappingData(initialMappings);
        } else {
            fetchMappings();
        }
    }, [fetchMappings, initialData]);

    const handleOpenDetails = useCallback(async (row: IEventsMapping) => {
        const coeeId = row.coeE_Id || (row as any).COEE_Id;
        if (!coeeId) return;
        setViewLoading(true);
        try {
            const res = await getViewRecords(coeeId);
            const details = res?.data || res || {};
            setViewData(details);
        } catch (error) {
            console.warn('getViewRecords failed, trying fallback to getPageDetailsMap');
            try {
                // Fallback to legacy endpoint if the new one fails (e.g. backend circular ref)
                const res = await getPageDetailsMap(coeeId);
                const details = (res as any).event_mapping_list || (res as any).view_records || (res as any).data || [];
                setViewData(details);
            } catch (fallbackError) {
                console.error('Failed to fetch record details', fallbackError);
                setViewData([]); // Clear data on failure
            }
        } finally {
            setViewLoading(false);
        }
    }, []);

    return (
        <div className='space-y-6'>
            <div className='flex justify-end'>
                <Button
                    onClick={openAddForm}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                >
                    <Plus className='mr-2 h-4 w-4' /> Map New Event
                </Button>
            </div>

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Map New Event' defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={closeAddForm}
                                className='absolute right-0 -top-12 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <EventsMappingForm
                                initialData={initialData}
                                onSuccess={() => {
                                    fetchMappings();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Event Mapping' defaultOpen={true}>
                        <div className='relative'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={closeEditForm}
                                className='absolute right-0 -top-12 text-destructive hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4' /> Close
                            </Button>
                            <EventsMappingForm
                                initialData={initialData}
                                editData={selectedRow}
                                onSuccess={() => {
                                    fetchMappings();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <CollapsibleSection
                title='Mapped Events List'
                defaultOpen={true}
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
            >
                <GenericDataTable
                    columns={EventsMappingColumns}
                    data={mappingData}
                    isLoading={loadingMappings || isLoading}
                    totalItems={mappingData.length}
                    success={true}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading mappings...'
                    noDataTitle='No Mapped Events Found'
                    noDataDescription='Map a master event to an academic year to see it here.'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && (
                <ToggleEventsMappingForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={fetchMappings}
                />
            )}

            <ViewDetailsDialog
                isOpen={isDetailsViewOpen}
                onClose={closeDetailsView}
                title={`Details for ${selectedRow?.coemE_EventName || selectedRow?.COEME_EventName || 'Event'}`}
                loading={viewLoading}
                data={viewData}
            />

            <MappingDetailLoader
                isOpen={isDetailsViewOpen}
                selectedRow={selectedRow}
                onLoad={handleOpenDetails}
            />
        </div>
    );
}

function MappingDetailLoader({ isOpen, selectedRow, onLoad }: { isOpen: boolean, selectedRow: any, onLoad: (row: any) => void }) {
    useEffect(() => {
        if (isOpen && selectedRow) {
            onLoad(selectedRow);
        }
    }, [isOpen, selectedRow, onLoad]);
    return null;
}
