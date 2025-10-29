// Refactored by automation script on 2025-10-28T15:40:35.606Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/gpsattendance-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { MapPin, RefreshCw, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface GPSAttendance extends BaseEntity {
    employeeName: string;
    designation?: string;
    date: string;
    clientName: string;
    salesLead: string;
    remarks?: string;
    punchFlag: boolean;
    location: string; // address string
}

type GPSForm = {
    employeeName: string;
    designation?: string;
    date: string;
    clientName: string;
    salesLead: string;
    remarks?: string;
    punchFlag: boolean;
    location: string;
};

export default function GPSLocationAttendancePage() {
    const store = createLocalCrud<GPSAttendance>('attendance:gps-location-attendance');
    const [rows, setRows] = useState<GPSAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, _setIsFormOpen] = useState(true); // form visible by default per screenshot
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<GPSForm>({
        mode: 'onChange',
        defaultValues: { punchFlag: false }
    });

    useEffect(() => {
        setRows(store.list());
        setIsLoading(false);
    }, []);

    const onSubmit: SubmitHandler<GPSForm> = async (data) => {
        try {
            store.create({ ...data });
            toast.success('GPS Attendance saved');
            reset({ punchFlag: false } as any);
            setRows(store.list());
        } catch (e: any) {
            toast.error(e.message || 'Operation failed');
        }
    };

    const columns: ColumnDef<GPSAttendance>[] = [
        {
            id: 'sl',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
        { accessorKey: 'date', header: ({ column }) => <DataTableColumnHeader column={column} title='Date' /> },
        { accessorKey: 'clientName', header: ({ column }) => <DataTableColumnHeader column={column} title='Client Name' /> },
        { accessorKey: 'location', header: ({ column }) => <DataTableColumnHeader column={column} title='Location' /> },
        { accessorKey: 'salesLead', header: ({ column }) => <DataTableColumnHeader column={column} title='Sales Lead' /> },
        { accessorKey: 'remarks', header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' /> },
        {
            accessorKey: 'punchFlag',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Punch Flag' />,
            cell: ({ row }) => <div>{row.getValue('punchFlag') ? 'Yes' : 'No'}</div>
        }
    ];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='GPS Location Attendance' description='Capture attendance with GPS location details' />
                    </div>
                </div>

                {isFormOpen && (
                    <div ref={formRef}>
                        <CollapsibleSection
                            title='GPS Location Attendance'
                            description='Employee info and GPS parameters'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                                    <div className='space-y-2 md:col-span-2'>
                                        <label className='font-medium text-sm'>
                                            Employee Name <span className='text-red-500'>*</span>
                                        </label>
                                        <InputText
                                            placeholder='Employee Name'
                                            {...register('employeeName', { required: 'Required' })}
                                            error={errors.employeeName?.message}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='font-medium text-sm'>Designation</label>
                                        <InputText placeholder='Designation' {...register('designation')} />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='font-medium text-sm'>
                                            Date <span className='text-red-500'>*</span>
                                        </label>
                                        <InputText
                                            type='date'
                                            {...register('date', { required: 'Required' })}
                                            error={errors.date?.message}
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                                    <div className='space-y-2 md:col-span-2'>
                                        <label className='font-medium text-sm'>
                                            Client Name <span className='text-red-500'>*</span>
                                        </label>
                                        <Select onValueChange={(v) => setValue('clientName', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select or Search Client Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Client A'>Client A</SelectItem>
                                                <SelectItem value='Client B'>Client B</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-2 md:col-span-2'>
                                        <label className='font-medium text-sm'>Sales Lead</label>
                                        <Select onValueChange={(v) => setValue('salesLead', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select or Search Sales Lead' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Lead 1'>Lead 1</SelectItem>
                                                <SelectItem value='Lead 2'>Lead 2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='font-medium text-sm'>Location</label>
                                    <div className='flex items-center gap-2'>
                                        <MapPin className='h-4 w-4 opacity-70' />
                                        <InputText placeholder='Address or coordinates' className='flex-1' {...register('location')} />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <label className='font-medium text-sm'>Remarks</label>
                                        <InputText placeholder='Enter Remarks' {...register('remarks')} />
                                    </div>
                                    <label className='flex items-center gap-2 pt-6 text-sm md:pt-0'>
                                        <Checkbox checked={watch('punchFlag')} onCheckedChange={(v) => setValue('punchFlag', Boolean(v))} />{' '}
                                        Punch Flag
                                    </label>
                                </div>

                                <div className='flex justify-center gap-4 border-t pt-6'>
                                    <Button type='button' variant='outline' onClick={() => reset({ punchFlag: false } as any)}>
                                        <X className='mr-2 h-4 w-4' /> Cancel
                                    </Button>
                                    <Button type='submit' disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <div className='flex items-center'>
                                                <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> Saving...
                                            </div>
                                        ) : (
                                            <div className='flex items-center'>
                                                <Save className='mr-2 h-4 w-4' /> Save
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CollapsibleSection>
                    </div>
                )}

                <CollapsibleSection
                    title='GPS Location Attendance Records'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={isLoading} columns={columns} data={rows} totalItems={rows.length} showViewOptions />
                </CollapsibleSection>
            </div>
        </div>
    );
}
