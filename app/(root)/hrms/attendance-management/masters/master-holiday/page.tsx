'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type MasterHoliday, getMasterHolidayColumns } from './_components/columns';
import { type MasterHolidayForm, HolidayForm } from './_components/holiday-form';

export default function MasterHolidayPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [holidays, setHolidays] = useState<MasterHoliday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Set current year client-side only to prevent hydration mismatch
    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    // Generate calendar years starting from current year
    const calendarYears = currentYear
        ? Array.from({ length: 6 }, (_, i) => (currentYear + i).toString())
        : [];

    const holidayDB = createLocalCrud<MasterHoliday>('master:holiday');
    const [editingHoliday, setEditingHoliday] = useState<MasterHolidayForm | null>(null);

    // Load data on component mount
    useEffect(() => {
        loadHolidays();
    }, []);

    const loadHolidays = () => {
        try {
            setHolidays(holidayDB.list());
        } catch (_error) {
            toast.error('Failed to load holidays');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        setEditingHoliday(null);
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
        setEditingHoliday(null);
    };

    const handleFormSubmit = (data: MasterHolidayForm) => {
        try {
            // Date validation
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day

            const fromDate = new Date(data.fromDate);
            const toDate = new Date(data.toDate);
            const selectedYear = Number.parseInt(data.calendarYear);

            // Validate From Date is not in the past
            if (fromDate < today) {
                toast.error('From Date cannot be in the past');
                return;
            }

            // Validate To Date is not before From Date
            if (toDate < fromDate) {
                toast.error('To Date cannot be before From Date');
                return;
            }

            // Validate dates are within the selected calendar year
            if (fromDate.getFullYear() !== selectedYear || toDate.getFullYear() !== selectedYear) {
                toast.error('Holiday dates must be within the selected calendar year');
                return;
            }

            const holidayData = {
                calendarYear: data.calendarYear,
                department: data.department,
                holidayType: data.holidayType,
                name: data.name,
                selectedDays: data.selectDay ? data.selectedDays : [],
                fromDate: data.fromDate,
                toDate: data.toDate,
                isActive: data.isActive
            };

            if (editingId) {
                holidayDB.update(editingId, holidayData);
                toast.success('Holiday updated successfully');
            } else {
                holidayDB.create(holidayData as Omit<MasterHoliday, 'id' | 'createdAt'>);
                toast.success('Holiday created successfully');
            }
            loadHolidays();
            handleFormClose();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (holiday: MasterHoliday) => {
        setEditingId(holiday.id);
        setEditingHoliday({
            calendarYear: holiday.calendarYear,
            department: holiday.department,
            holidayType: holiday.holidayType,
            name: holiday.name,
            selectedDays: holiday.selectedDays || [],
            selectDay: (holiday.selectedDays || []).length > 0,
            fromDate: holiday.fromDate,
            toDate: holiday.toDate,
            isActive: holiday.isActive
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
            holidayDB.remove(id);
            toast.success('Holiday deleted successfully');
            loadHolidays();
        } catch (_error: any) {
            toast.error('Failed to delete holiday');
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading
                            title='Master Holiday Management'
                            description='Manage holidays and working days for different departments'
                        />
                    </div>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Holiday
                    </Button>
                </div>

                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                    title='Master Holidays Data'
                    description='View, search, and manage all holiday details in the system'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable
                        isLoading={isLoading}
                        columns={getMasterHolidayColumns({ onEdit: handleEdit, onDelete: handleDelete })}
                        data={holidays}
                        totalItems={holidays.length}
                        showViewOptions={true}
                    />
                </CollapsibleSection>

                {/* Add Form Section - Conditionally Rendered */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editingId ? 'Update Master Holiday' : 'Add New Master Holiday'}
                            description='Fill in the details below to create a new holiday'
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
                                <HolidayForm
                                    editingHoliday={editingHoliday}
                                    calendarYears={calendarYears}
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
