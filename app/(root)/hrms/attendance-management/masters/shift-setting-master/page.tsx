'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type ShiftSetting, getShiftSettingColumns } from './_components/columns';
import { type ShiftSettingForm, ShiftSettingForm as ShiftSettingFormComponent } from './_components/shift-setting-form';

export default function ShiftSettingMasterPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [shiftSettings, setShiftSettings] = useState<ShiftSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);
    const shiftSettingDB = createLocalCrud<ShiftSetting>('master:shiftSetting');

    // Load data on component mount
    useEffect(() => {
        loadShiftSettings();
    }, []);

    const loadShiftSettings = () => {
        try {
            setShiftSettings(shiftSettingDB.list());
        } catch (_error) {
            toast.error('Failed to load shift settings');
        } finally {
            setIsLoading(false);
        }
    };

    const [editingShiftSetting, setEditingShiftSetting] = useState<ShiftSettingForm | null>(null);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        setEditingShiftSetting(null);
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setEditingShiftSetting(null);
    };

    const handleFormSubmit = (data: ShiftSettingForm) => {
        try {
            const shiftSettingData = {
                ...data,
                isActive: true // Always active by default
            };
            if (editingId) {
                shiftSettingDB.update(editingId, shiftSettingData);
                toast.success('Shift setting updated successfully');
            } else {
                shiftSettingDB.create(shiftSettingData as Omit<ShiftSetting, 'id' | 'createdAt'>);
                toast.success('Shift setting created successfully');
            }
            loadShiftSettings();
            handleFormClose();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (shiftSetting: ShiftSetting) => {
        setEditingId(shiftSetting.id);
        setEditingShiftSetting({
            shiftName: shiftSetting.shiftName,
            shiftStartTime: shiftSetting.shiftStartTime,
            shiftEndTime: shiftSetting.shiftEndTime,
            lunchStartTime: shiftSetting.lunchStartTime,
            lunchEndTime: shiftSetting.lunchEndTime,
            totalWorkingHours: shiftSetting.totalWorkingHours,
            halfDayWorkingHours: shiftSetting.halfDayWorkingHours,
            lunchHours: shiftSetting.lunchHours,
            delayPerShift: shiftSetting.delayPerShift,
            earlyPerShift: shiftSetting.earlyPerShift,
            isActive: shiftSetting.isActive
        });
        setIsFormOpen(true);

        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleDelete = (id: number) => {
        try {
            shiftSettingDB.remove(id);
            toast.success('Shift setting deleted successfully');
            loadShiftSettings();
        } catch (_error: any) {
            toast.error('Failed to delete shift setting');
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Shift Setting Master' description='Manage shift timings and working hours configuration' />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Shift Setting
                    </Button>
                </div>

                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                    title='Shift Settings Data'
                    description='View, search, and manage all shift configurations in the system'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable
                        isLoading={isLoading}
                        columns={getShiftSettingColumns({ onEdit: handleEdit, onDelete: handleDelete })}
                        data={shiftSettings}
                        totalItems={shiftSettings.length}
                        showViewOptions={true}
                    />
                </CollapsibleSection>

                {/* Add Form Section - Conditionally Rendered */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editingId ? 'Update Shift Setting' : 'Add New Shift Setting'}
                            description='Fill in the details below to create a new shift configuration'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='shadow-lg'
                            headerClassName=''>
                            <div className='relative'>
                                <Button
                                    onClick={handleFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <ShiftSettingFormComponent
                                    editingShiftSetting={editingShiftSetting}
                                    onSubmit={handleFormSubmit}
                                    onCancel={handleFormClose}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
