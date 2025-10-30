// Refactored by automation script on 2025-10-28T15:40:35.594Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/shift-mapping-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
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
import { Download, Edit, MoreHorizontal, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface EmployeeShiftMapping extends BaseEntity {
    employeeTypes: string[];
    dayTypes: string[];
    allEmployees: boolean;
    searchEmployee: string;
    type: string;
    department: string;
    designation: string;
    dayType: string;
    shiftName: string;
    applicableDate: string;
    employee: string;
    holidayType: string;
    totalWork: string;
    halfDayWork: string;
    morningLogin: string;
    morningLogout: string;
    afternoonLogin: string;
    afternoonLogout: string;
    delayShift: string;
    earlyShift: string;
    lunchHour: string;
    isActive: boolean;
}

type EmployeeShiftMappingForm = {
    employeeTypes: string[];
    dayTypes: string[];
    allEmployees: boolean;
    searchEmployee: string;
    type: string;
    department: string;
    designation: string;
    dayType: string;
    shiftName: string;
    applicableDate: string;
    isActive: boolean;
};

const employeeTypeOptions = [
    'Teaching',
    'Non Teaching',
    'Administrative',
    'test',
    'assistant teacher',
    'Principal',
    'Owner of the company'
];

const dayTypeOptions = ['PUBLIC HOLIDAY', 'WEEK END', 'WEEK DAY', 'VACATION'];

const typeOptions = ['All'];
const departmentOptions = ['All'];
const designationOptions = ['All'];

const shiftNames = ['Morning Shift', 'Evening Shift', 'Night Shift', 'General Shift'];

export default function EmployeeShiftMappingPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [shiftMappings, setShiftMappings] = useState<EmployeeShiftMapping[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);

    const shiftMappingDB = createLocalCrud<EmployeeShiftMapping>('master:employeeShiftMapping');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeShiftMappingForm>({
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            employeeTypes: [],
            dayTypes: [],
            allEmployees: true,
            type: 'All',
            department: 'All',
            designation: 'All',
            applicableDate: new Date().toISOString().split('T')[0]
        }
    });

    const employeeTypes = watch('employeeTypes');
    const dayTypes = watch('dayTypes');
    const allEmployees = watch('allEmployees');
    const type = watch('type');
    const department = watch('department');
    const designation = watch('designation');
    const dayType = watch('dayType');
    const shiftName = watch('shiftName');

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
        reset({
            isActive: true,
            employeeTypes: [],
            dayTypes: [],
            allEmployees: true,
            type: 'All',
            department: 'All',
            designation: 'All',
            applicableDate: new Date().toISOString().split('T')[0]
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
            employeeTypes: [],
            dayTypes: [],
            allEmployees: true,
            type: 'All',
            department: 'All',
            designation: 'All',
            applicableDate: new Date().toISOString().split('T')[0]
        });
    };

    const onSubmit: SubmitHandler<EmployeeShiftMappingForm> = async (data: EmployeeShiftMappingForm) => {
        try {
            // Generate mock data for the mapping based on form inputs
            const mappingData = {
                ...data,
                employee: 'Sample Employee',
                holidayType: data.dayType,
                totalWork: '8:00',
                halfDayWork: '4:00',
                morningLogin: '8:00',
                morningLogout: '12:00',
                afternoonLogin: '13:00',
                afternoonLogout: '17:00',
                delayShift: '0:10',
                earlyShift: '0:10',
                lunchHour: '1:00'
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
        setValue('employeeTypes', mapping.employeeTypes || []);
        setValue('dayTypes', mapping.dayTypes || []);
        setValue('allEmployees', mapping.allEmployees);
        setValue('searchEmployee', mapping.searchEmployee || '');
        setValue('type', mapping.type);
        setValue('department', mapping.department);
        setValue('designation', mapping.designation);
        setValue('dayType', mapping.dayType);
        setValue('shiftName', mapping.shiftName);
        setValue('applicableDate', mapping.applicableDate);
        setValue('isActive', mapping.isActive);
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
            shiftMappingDB.remove(id);
            toast.success('Employee shift mapping deleted successfully');
            loadShiftMappings();
        } catch (_error: any) {
            toast.error('Failed to delete shift mapping');
        }
    };

    const handleEmployeeTypeToggle = (empType: string) => {
        const currentTypes = employeeTypes || [];
        const newTypes = currentTypes.includes(empType) ? currentTypes.filter((t) => t !== empType) : [...currentTypes, empType];
        setValue('employeeTypes', newTypes);
    };

    const handleDayTypeToggle = (dayTypeOption: string) => {
        const currentDayTypes = dayTypes || [];
        const newDayTypes = currentDayTypes.includes(dayTypeOption)
            ? currentDayTypes.filter((t) => t !== dayTypeOption)
            : [...currentDayTypes, dayTypeOption];
        setValue('dayTypes', newDayTypes);
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
                    <ShiftMappingTable
                        shiftMappings={shiftMappings}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onExport={handleExportData}
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
                                <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                    {/* Primary Information Section */}
                                    <div className='space-y-4'>
                                        {/* Employee Type Selection */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
                                            <div className='space-y-2'>
                                                <span className='font-medium text-sm'>Employee Types:</span>
                                                <div className='max-h-40 overflow-y-auto rounded-md border bg-background p-3'>
                                                    <div className='space-y-2'>
                                                        {employeeTypeOptions.map((empType) => (
                                                            <div key={empType} className='flex cursor-pointer items-center gap-2 text-sm'>
                                                                <Checkbox
                                                                    checked={employeeTypes?.includes(empType) || false}
                                                                    onCheckedChange={() => handleEmployeeTypeToggle(empType)}
                                                                />
                                                                <span>{empType}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='type'>
                                                    Type <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={type || ''} onValueChange={(value) => setValue('type', value)}>
                                                    <SelectTrigger id='type'>
                                                        <SelectValue placeholder='All' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {typeOptions.map((typeOption) => (
                                                            <SelectItem key={typeOption} value={typeOption}>
                                                                {typeOption}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='department'>
                                                    Department <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={department || ''} onValueChange={(value) => setValue('department', value)}>
                                                    <SelectTrigger id='department'>
                                                        <SelectValue placeholder='All' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departmentOptions.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='designation'>
                                                    Designation <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={designation || ''} onValueChange={(value) => setValue('designation', value)}>
                                                    <SelectTrigger id='designation'>
                                                        <SelectValue placeholder='All' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {designationOptions.map((desig) => (
                                                            <SelectItem key={desig} value={desig}>
                                                                {desig}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Day Types and Employee Selection */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <div className='space-y-2'>
                                                <span className='font-medium text-sm'>Day Types:</span>
                                                <div className='rounded-md border bg-background p-3'>
                                                    <div className='space-y-2'>
                                                        {dayTypeOptions.map((dayTypeOption) => (
                                                            <div
                                                                key={dayTypeOption}
                                                                className='flex cursor-pointer items-center gap-2 text-sm'>
                                                                <Checkbox
                                                                    checked={dayTypes?.includes(dayTypeOption) || false}
                                                                    onCheckedChange={() => handleDayTypeToggle(dayTypeOption)}
                                                                />
                                                                <span>{dayTypeOption}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={allEmployees}
                                                        onCheckedChange={(checked) => setValue('allEmployees', !!checked)}
                                                    />
                                                    <span className='font-medium text-sm'>Employee: All</span>
                                                </div>
                                                <InputText
                                                    placeholder='Search here...'
                                                    {...register('searchEmployee')}
                                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                                />
                                            </div>
                                        </div>

                                        {/* Required Fields */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='dayType'>
                                                    Day Type <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={dayType || ''} onValueChange={(value) => setValue('dayType', value)}>
                                                    <SelectTrigger id='dayType' className={errors.dayType ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dayTypeOptions.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!dayType && (
                                                    <input
                                                        type='hidden'
                                                        {...register('dayType', {
                                                            required: 'Day Type is required'
                                                        })}
                                                    />
                                                )}
                                                {errors.dayType && <FormError>{errors.dayType.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='shiftName'>
                                                    Shift Name <span className='text-red-500'>*</span>
                                                </label>
                                                <Select value={shiftName || ''} onValueChange={(value) => setValue('shiftName', value)}>
                                                    <SelectTrigger id='shiftName' className={errors.shiftName ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {shiftNames.map((shift) => (
                                                            <SelectItem key={shift} value={shift}>
                                                                {shift}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!shiftName && (
                                                    <input
                                                        type='hidden'
                                                        {...register('shiftName', {
                                                            required: 'Shift Name is required'
                                                        })}
                                                    />
                                                )}
                                                {errors.shiftName && <FormError>{errors.shiftName.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm' htmlFor='applicableDate'>
                                                    Applicable Date <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    id='applicableDate'
                                                    type='date'
                                                    {...register('applicableDate', { required: 'Applicable Date is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.applicableDate ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.applicableDate && <FormError>{errors.applicableDate.message}</FormError>}
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
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
                                                    {editingId ? 'Update Shift Mapping' : 'Save Shift Mapping'}
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

interface ShiftMappingTableProps {
    shiftMappings: EmployeeShiftMapping[];
    isLoading: boolean;
    onEdit: (mapping: EmployeeShiftMapping) => void;
    onDelete: (id: number) => void;
    onExport: () => void;
}

function ShiftMappingTable({ shiftMappings, isLoading, onEdit, onDelete, onExport }: ShiftMappingTableProps) {
    const shiftMappingColumns: ColumnDef<EmployeeShiftMapping>[] = [
        {
            id: 'serialNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        {
            accessorKey: 'shiftName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('shiftName')}</div>
        },
        {
            accessorKey: 'employee',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
            cell: ({ row }) => <div>{row.getValue('employee') || 'All Employees'}</div>
        },
        {
            accessorKey: 'holidayType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Type' />,
            cell: ({ row }) => <div>{row.getValue('holidayType')}</div>
        },
        {
            accessorKey: 'applicableDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Applicable Date' />,
            cell: ({ row }) => <div>{new Date(row.getValue('applicableDate')).toLocaleDateString()}</div>
        },
        {
            accessorKey: 'totalWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Work' />,
            cell: ({ row }) => <div>{row.getValue('totalWork')}</div>
        },
        {
            accessorKey: 'halfDayWork',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day Work' />,
            cell: ({ row }) => <div>{row.getValue('halfDayWork')}</div>
        },
        {
            accessorKey: 'morningLogin',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Login' />,
            cell: ({ row }) => <div>{row.getValue('morningLogin')}</div>
        },
        {
            accessorKey: 'morningLogout',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Logout' />,
            cell: ({ row }) => <div>{row.getValue('morningLogout')}</div>
        },
        {
            accessorKey: 'afternoonLogin',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Login' />,
            cell: ({ row }) => <div>{row.getValue('afternoonLogin')}</div>
        },
        {
            accessorKey: 'afternoonLogout',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Logout' />,
            cell: ({ row }) => <div>{row.getValue('afternoonLogout')}</div>
        },
        {
            accessorKey: 'delayShift',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Delay Shift' />,
            cell: ({ row }) => <div>{row.getValue('delayShift')}</div>
        },
        {
            accessorKey: 'earlyShift',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Early Shift' />,
            cell: ({ row }) => <div>{row.getValue('earlyShift')}</div>
        },
        {
            accessorKey: 'lunchHour',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Lunch Hour' />,
            cell: ({ row }) => <div>{row.getValue('lunchHour')}</div>
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const mapping = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Button variant='ghost' size='sm' onClick={() => onEdit(mapping)} className='w-full justify-start'>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onDelete(mapping.id)}
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
        <div className='space-y-4'>
            <div className='flex justify-end'>
                <Button onClick={onExport} variant='outline' className='gap-2'>
                    <Download className='h-4 w-4' />
                    Export Data
                </Button>
            </div>
            <GenericDataTable
                isLoading={isLoading}
                columns={shiftMappingColumns}
                data={shiftMappings}
                totalItems={shiftMappings.length}
                showViewOptions={true}
            />
        </div>
    );
}
