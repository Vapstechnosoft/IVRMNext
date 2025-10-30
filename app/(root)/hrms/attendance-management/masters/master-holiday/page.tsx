// Refactored by automation script on 2025-10-28T15:40:35.622Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/holiday-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface MasterHoliday extends BaseEntity {
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

type MasterHolidayForm = {
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectDay: boolean;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
};

// Generate calendar years starting from current year
const getCalendarYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Include current year and next 5 years
    for (let i = 0; i <= 5; i++) {
        years.push((currentYear + i).toString());
    }
    return years;
};

const calendarYears = getCalendarYears();

const departments = ['All', 'Teaching', 'Non Teaching', 'Administrative', 'JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF'];

const holidayTypes = ['WEEK DAY', 'WEEK END', 'NATIONAL HOLIDAY', 'FESTIVAL', 'OPTIONAL HOLIDAY'];

const weekDays = [
    { value: 'SUN', label: 'SUN' },
    { value: 'MON', label: 'MON' },
    { value: 'TUE', label: 'TUE' },
    { value: 'WED', label: 'WED' },
    { value: 'THU', label: 'THU' },
    { value: 'FRI', label: 'FRI' },
    { value: 'SAT', label: 'SAT' }
];

export default function MasterHolidayPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [holidays, setHolidays] = useState<MasterHoliday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);

    const holidayDB = createLocalCrud<MasterHoliday>('master:holiday');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<MasterHolidayForm>({
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            selectedDays: [],
            selectDay: false
        }
    });

    const calendarYear = watch('calendarYear');
    const department = watch('department');
    const holidayType = watch('holidayType');
    const selectDay = watch('selectDay');
    const selectedDays = watch('selectedDays');
    const fromDate = watch('fromDate');

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
        reset({
            isActive: true,
            selectedDays: [],
            selectDay: false,
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0]
        });
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
        reset({
            isActive: true,
            selectedDays: [],
            selectDay: false,
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0]
        });
    };

    const onSubmit: SubmitHandler<MasterHolidayForm> = async (data: MasterHolidayForm) => {
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
        setValue('calendarYear', holiday.calendarYear);
        setValue('department', holiday.department);
        setValue('holidayType', holiday.holidayType);
        setValue('name', holiday.name);
        setValue('selectedDays', holiday.selectedDays || []);
        setValue('selectDay', (holiday.selectedDays || []).length > 0);
        setValue('fromDate', holiday.fromDate);
        setValue('toDate', holiday.toDate);
        setValue('isActive', holiday.isActive);
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

    const handleDayToggle = (day: string) => {
        const currentDays = selectedDays || [];
        const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day];
        setValue('selectedDays', newDays);
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
                    <HolidayTable holidays={holidays} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
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
                                <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                    {/* Primary Information Section */}
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='calendarYear'>
                                                    Calendar Year <span className='text-red-500'>*</span>
                                                </label>
                                                <Select
                                                    value={calendarYear || ''}
                                                    onValueChange={(value) => setValue('calendarYear', value)}>
                                                    <SelectTrigger
                                                        id='calendarYear'
                                                        className={errors.calendarYear ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {calendarYears.map((year) => (
                                                            <SelectItem key={year} value={year}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!calendarYear && (
                                                    <input
                                                        type='hidden'
                                                        {...register('calendarYear', {
                                                            required: 'Calendar Year is required'
                                                        })}
                                                    />
                                                )}
                                                {errors.calendarYear && <FormError>{errors.calendarYear.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='department'>
                                                    Department <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={department || ''} onValueChange={(value) => setValue('department', value)}>
                                                    <SelectTrigger id='department' className={errors.department ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!department && (
                                                    <input
                                                        type='hidden'
                                                        {...register('department', {
                                                            required: 'Department is required'
                                                        })}
                                                    />
                                                )}
                                                {errors.department && <FormError>{errors.department.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='holidayType'>
                                                    Holiday Type <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={holidayType || ''} onValueChange={(value) => setValue('holidayType', value)}>
                                                    <SelectTrigger id='holidayType' className={errors.holidayType ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {holidayTypes.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!holidayType && (
                                                    <input
                                                        type='hidden'
                                                        {...register('holidayType', {
                                                            required: 'Holiday Type is required'
                                                        })}
                                                    />
                                                )}
                                                {errors.holidayType && <FormError>{errors.holidayType.message}</FormError>}
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <InputText
                                                label='Holiday Name'
                                                required
                                                id='name'
                                                {...register('name', {
                                                    required: 'Holiday Name is required'
                                                })}
                                                error={errors.name?.message}
                                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            />

                                            <div className='flex items-center space-y-2 pt-6'>
                                                <Checkbox
                                                    id='selectDay'
                                                    checked={selectDay}
                                                    onCheckedChange={(checked) => setValue('selectDay', !!checked)}
                                                />
                                                <label htmlFor='selectDay' className='ml-2 font-medium text-foreground text-sm'>
                                                    Select Day
                                                </label>
                                            </div>
                                        </div>

                                        {/* Day Selection */}
                                        {selectDay && (
                                            <div className='space-y-2'>
                                                <span className='font-medium text-sm'>Select Days:</span>
                                                <div className='max-h-32 overflow-y-auto rounded-md border bg-background p-3'>
                                                    <div className='grid grid-cols-4 gap-2'>
                                                        {weekDays.map((day) => (
                                                            <div key={day.value} className='flex cursor-pointer items-center gap-2 text-sm'>
                                                                <Checkbox
                                                                    checked={selectedDays?.includes(day.value) || false}
                                                                    onCheckedChange={() => handleDayToggle(day.value)}
                                                                />
                                                                <span>{day.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='fromDate'>
                                                    From Date <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    id='fromDate'
                                                    type='date'
                                                    {...register('fromDate', {
                                                        required: 'From Date is required'
                                                    })}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`w-full rounded-md border px-3 py-2 ${
                                                        errors.fromDate ? 'border-red-500' : 'border-input'
                                                    }`}
                                                />
                                                {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='toDate'>
                                                    To Date <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    id='toDate'
                                                    type='date'
                                                    {...register('toDate', {
                                                        required: 'To Date is required'
                                                    })}
                                                    min={fromDate || new Date().toISOString().split('T')[0]}
                                                    className={`w-full rounded-md border px-3 py-2 ${
                                                        errors.toDate ? 'border-red-500' : 'border-input'
                                                    }`}
                                                />
                                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                            </div>

                                            <div className='flex items-center space-y-2 pt-6'>
                                                <input
                                                    type='checkbox'
                                                    id='isActive'
                                                    {...register('isActive')}
                                                    className='mr-2 border-border text-primary focus:ring-primary'
                                                />
                                                <label htmlFor='isActive' className='font-medium text-foreground text-sm'>
                                                    Active
                                                </label>
                                            </div>
                                        </div>

                                        {/* Root Error */}
                                        {errors.root && <FormError>{errors.root.message}</FormError>}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleFormClose}
                                            disabled={isSubmitting}
                                            className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                            Cancel
                                        </Button>
                                        <Button
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                            {isSubmitting ? (
                                                <div className='flex items-center'>
                                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                    Saving...
                                                </div>
                                            ) : (
                                                <div className='flex items-center'>
                                                    <Save className='mr-2 h-4 w-4' />
                                                    {editingId ? 'Update Master Holiday' : 'Save Master Holiday'}
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}

interface HolidayTableProps {
    holidays: MasterHoliday[];
    isLoading: boolean;
    onEdit: (holiday: MasterHoliday) => void;
    onDelete: (id: number) => void;
}

function HolidayTable({ holidays, isLoading, onEdit, onDelete }: HolidayTableProps) {
    const holidayColumns: ColumnDef<MasterHoliday>[] = [
        {
            id: 'serialNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL. NO.' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>
        },
        {
            accessorKey: 'holidayType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
            cell: ({ row }) => <div>{row.getValue('holidayType')}</div>
        },
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
            cell: ({ row }) => <div>{row.getValue('department')}</div>
        },
        {
            accessorKey: 'fromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('fromDate')).toLocaleDateString()}</div>
        },
        {
            accessorKey: 'toDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('toDate')).toLocaleDateString()}</div>
        },
        {
            accessorKey: 'isActive',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean;
                return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
            }
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const holiday = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Button variant='ghost' size='sm' onClick={() => onEdit(holiday)} className='w-full justify-start'>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onDelete(holiday.id)}
                                className='w-full justify-start text-red-600 hover:text-red-900'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];

    return (
        <GenericDataTable
            isLoading={isLoading}
            columns={holidayColumns}
            data={holidays}
            totalItems={holidays.length}
            showViewOptions={true}
        />
    );
}
