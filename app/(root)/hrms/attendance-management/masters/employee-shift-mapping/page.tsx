'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Download, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type EmployeeShiftMapping, getEmployeeShiftMappingColumns } from './_components/columns';
import { type EmployeeShiftMappingForm, ShiftMappingForm } from './_components/shift-mapping-form';

export default function EmployeeShiftMappingPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [shiftMappings, setShiftMappings] = useState<EmployeeShiftMapping[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);
    const shiftMappingDB = createLocalCrud<EmployeeShiftMapping>('master:employeeShiftMapping');
    const [editingMapping, setEditingMapping] = useState<EmployeeShiftMappingForm | null>(null);

    // Load data on component mount
    useEffect(() => {
        loadShiftMappings();
    }, []);

    const loadShiftMappings = () => {
        try {
            setShiftMappings(shiftMappingDB.list());
        } catch (_error) {
            toast.error('Failed to load shift mappings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        setEditingMapping(null);
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
        setEditingMapping(null);
    };

    const handleFormSubmit = (data: EmployeeShiftMappingForm) => {
        try {
            // Convert dayType array to string for backward compatibility
            const dayTypeValue = Array.isArray(data.dayType) ? data.dayType[0] || '' : data.dayType || '';
            const mappingData = {
                ...data,
                employee: 'Sample Employee', // This should be derived from employees array
                holidayType: dayTypeValue,
                // Map timing fields to legacy field names for backward compatibility
                totalWork: data.totalWorkingHours || '00:00',
                halfDayWork: data.halfDayWorkingHours || '00:00',
                morningLogin: data.shiftStartTime || '00:00',
                morningLogout: data.lunchStartTime || '00:00',
                afternoonLogin: data.lunchEndTime || '00:00',
                afternoonLogout: data.shiftEndTime || '00:00',
                delayShift: data.delayPerShift || '00:00',
                earlyShift: data.earlyPerShift || '00:00',
                lunchHour: data.lunchHours || '00:00'
            };

            if (editingId) {
                shiftMappingDB.update(editingId, mappingData);
                toast.success('Employee shift mapping updated successfully');
            } else {
                shiftMappingDB.create(mappingData as Omit<EmployeeShiftMapping, 'id' | 'createdAt'>);
                toast.success('Employee shift mapping created successfully');
            }
            loadShiftMappings();
            handleFormClose();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (mapping: EmployeeShiftMapping) => {
        setEditingId(mapping.id);
        setEditingMapping({
            type: Array.isArray(mapping.type) ? mapping.type : mapping.type ? [mapping.type] : [],
            department: Array.isArray(mapping.department) ? mapping.department : mapping.department ? [mapping.department] : [],
            designation: Array.isArray(mapping.designation) ? mapping.designation : mapping.designation ? [mapping.designation] : [],
            dayType: Array.isArray(mapping.dayType) ? mapping.dayType : mapping.dayType ? [mapping.dayType] : [],
            shiftName: mapping.shiftName || '',
            applicableDate: mapping.applicableDate || '',
            employees: mapping.employees || [],
            shiftStartTime: mapping.shiftStartTime || '',
            lunchStartTime: mapping.lunchStartTime || '',
            shiftEndTime: mapping.shiftEndTime || '',
            lunchEndTime: mapping.lunchEndTime || '',
            totalWorkingHours: mapping.totalWorkingHours || '',
            delayPerShift: mapping.delayPerShift || '',
            halfDayWorkingHours: mapping.halfDayWorkingHours || '',
            earlyPerShift: mapping.earlyPerShift || '',
            lunchHours: mapping.lunchHours || ''
        });
        setIsFormOpen(true);

        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    const handleDelete = (id: number) => {
        try {
            shiftMappingDB.remove(id);
            toast.success('Employee shift mapping deleted successfully');
            loadShiftMappings();
        } catch (_error: any) {
            toast.error('Failed to delete shift mapping');
        }
    };

    const handleExportData = () => {
        toast.success('Data exported successfully');
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading
                            title='Employee Shift Mapping'
                            description='Map employees to specific shifts and manage attendance configurations'
                        />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Shift Mapping
                    </Button>
                </div>

                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                    title='Employee Shift Mappings Data'
                    description='View, search, and manage all employee shift mappings in the system'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable
                        isLoading={isLoading}
                        columns={getEmployeeShiftMappingColumns({ onEdit: handleEdit, onDelete: handleDelete })}
                        data={shiftMappings}
                        totalItems={shiftMappings.length}
                        showViewOptions={true}
                    />
                </CollapsibleSection>

                {/* Add Form Section - Conditionally Rendered */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editingId ? 'Update Employee Shift Mapping' : 'Add New Employee Shift Mapping'}
                            description='Fill in the details below to create a new employee shift mapping'
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
                                <ShiftMappingForm editingMapping={editingMapping} onSubmit={handleFormSubmit} onCancel={handleFormClose} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
