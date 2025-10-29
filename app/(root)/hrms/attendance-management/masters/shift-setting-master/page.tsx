// Refactored by automation script on 2025-10-28T15:40:35.628Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/shift-setting-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ShiftSetting extends BaseEntity {
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
}

type ShiftSettingForm = {
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
};

export default function ShiftSettingMasterPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [shiftSettings, setShiftSettings] = useState<ShiftSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);

    const shiftSettingDB = createLocalCrud<ShiftSetting>('master:shiftSetting');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ShiftSettingForm>({
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            shiftStartTime: '09:00',
            shiftEndTime: '18:00',
            lunchStartTime: '13:00',
            lunchEndTime: '14:00',
            totalWorkingHours: '08:00',
            halfDayWorkingHours: '04:00',
            lunchHours: '01:00',
            delayPerShift: '00:15',
            earlyPerShift: '00:15'
        }
    });

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

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        reset({
            isActive: true,
            shiftStartTime: '09:00',
            shiftEndTime: '18:00',
            lunchStartTime: '13:00',
            lunchEndTime: '14:00',
            totalWorkingHours: '08:00',
            halfDayWorkingHours: '04:00',
            lunchHours: '01:00',
            delayPerShift: '00:15',
            earlyPerShift: '00:15'
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
            shiftStartTime: '09:00',
            shiftEndTime: '18:00',
            lunchStartTime: '13:00',
            lunchEndTime: '14:00',
            totalWorkingHours: '08:00',
            halfDayWorkingHours: '04:00',
            lunchHours: '01:00',
            delayPerShift: '00:15',
            earlyPerShift: '00:15'
        });
    };

    const onSubmit: SubmitHandler<ShiftSettingForm> = async (data: ShiftSettingForm) => {
        try {
            if (editingId) {
                shiftSettingDB.update(editingId, data);
                toast.success('Shift setting updated successfully');
            } else {
                shiftSettingDB.create(data as Omit<ShiftSetting, 'id' | 'createdAt'>);
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
        setValue('shiftName', shiftSetting.shiftName);
        setValue('shiftStartTime', shiftSetting.shiftStartTime);
        setValue('shiftEndTime', shiftSetting.shiftEndTime);
        setValue('lunchStartTime', shiftSetting.lunchStartTime);
        setValue('lunchEndTime', shiftSetting.lunchEndTime);
        setValue('totalWorkingHours', shiftSetting.totalWorkingHours);
        setValue('halfDayWorkingHours', shiftSetting.halfDayWorkingHours);
        setValue('lunchHours', shiftSetting.lunchHours);
        setValue('delayPerShift', shiftSetting.delayPerShift);
        setValue('earlyPerShift', shiftSetting.earlyPerShift);
        setValue('isActive', shiftSetting.isActive);
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
                    <ShiftSettingTable shiftSettings={shiftSettings} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
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
                                <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                    {/* Primary Information Section */}
                                    <div className='space-y-4'>
                                        {/* First Row */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <InputText
                                                label='Shift Name'
                                                required
                                                id='shiftName'
                                                placeholder='Enter Shift Name'
                                                {...register('shiftName', { required: 'Shift Name is required' })}
                                                error={errors.shiftName?.message}
                                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            />

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Shift Start Time <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('shiftStartTime', { required: 'Shift Start Time is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.shiftStartTime ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.shiftStartTime && <FormError>{errors.shiftStartTime.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Total working hours per shift <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('totalWorkingHours', { required: 'Total working hours is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.totalWorkingHours ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.totalWorkingHours && <FormError>{errors.totalWorkingHours.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Second Row */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Shift End Time <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('shiftEndTime', { required: 'Shift End Time is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.shiftEndTime ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.shiftEndTime && <FormError>{errors.shiftEndTime.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Half day working hours per shift <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('halfDayWorkingHours', { required: 'Half day working hours is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.halfDayWorkingHours ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.halfDayWorkingHours && <FormError>{errors.halfDayWorkingHours.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Lunch Hours <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('lunchHours', { required: 'Lunch Hours is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.lunchHours ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.lunchHours && <FormError>{errors.lunchHours.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Third Row */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Lunch start time <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('lunchStartTime', { required: 'Lunch start time is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.lunchStartTime ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.lunchStartTime && <FormError>{errors.lunchStartTime.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Delay per shift <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('delayPerShift', { required: 'Delay per shift is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.delayPerShift ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.delayPerShift && <FormError>{errors.delayPerShift.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Early per shift <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('earlyPerShift', { required: 'Early per shift is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.earlyPerShift ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.earlyPerShift && <FormError>{errors.earlyPerShift.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Fourth Row */}
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                            <div className='space-y-2'>
                                                <label className='font-medium text-sm'>
                                                    Lunch End time <span className='text-red-500'>*</span>
                                                </label>
                                                <input
                                                    type='time'
                                                    {...register('lunchEndTime', { required: 'Lunch End time is required' })}
                                                    className={`w-full rounded-md border px-3 py-2 ${errors.lunchEndTime ? 'border-red-500' : 'border-input'}`}
                                                />
                                                {errors.lunchEndTime && <FormError>{errors.lunchEndTime.message}</FormError>}
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
                                                    {editingId ? 'Update Shift Setting' : 'Save Shift Setting'}
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

interface ShiftSettingTableProps {
    shiftSettings: ShiftSetting[];
    isLoading: boolean;
    onEdit: (shiftSetting: ShiftSetting) => void;
    onDelete: (id: number) => void;
}

function ShiftSettingTable({ shiftSettings, isLoading, onEdit, onDelete }: ShiftSettingTableProps) {
    const shiftSettingColumns: ColumnDef<ShiftSetting>[] = [
        {
            id: 'serialNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SHO' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        {
            accessorKey: 'shiftName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('shiftName')}</div>
        },
        {
            accessorKey: 'shiftStartTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Start Time' />,
            cell: ({ row }) => <div>{row.getValue('shiftStartTime')}</div>
        },
        {
            accessorKey: 'shiftEndTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Shift End Time' />,
            cell: ({ row }) => <div>{row.getValue('shiftEndTime')}</div>
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
            header: 'Actions',
            cell: ({ row }) => {
                const shiftSetting = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Button variant='ghost' size='sm' onClick={() => onEdit(shiftSetting)} className='w-full justify-start'>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onDelete(shiftSetting.id)}
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
            columns={shiftSettingColumns}
            data={shiftSettings}
            totalItems={shiftSettings.length}
            showViewOptions={true}
        />
    );
}
