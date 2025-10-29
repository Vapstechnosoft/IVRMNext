// Refactored by automation script on 2025-10-28T15:40:35.811Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-credit-details-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveCreditDetail extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveName: string;
    leaveCode?: string;
    months: Record<string, number>;
}

const detailDB = createLocalCrud<LeaveCreditDetail>('leaveCreditDetails');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function LeaveCreditDetailsPage() {
    const [data, setData] = useState<LeaveCreditDetail[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditDetail | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCreditDetail>({
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            leaveName: '',
            leaveCode: '',
            months: MONTHS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<string, number>)
        }
    });

    const loadData = () => {
        try {
            const result = detailDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading details:', error);
            toast.error('Failed to load records');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingRow(null);
        reset({
            type: [],
            department: [],
            designation: [],
            leaveName: '',
            leaveCode: '',
            months: MONTHS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<string, number>)
        });
        setTimeout(() => document.getElementById('leave-credit-details-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
        reset({
            type: [],
            department: [],
            designation: [],
            leaveName: '',
            leaveCode: '',
            months: MONTHS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<string, number>)
        });
    };

    const onSubmit = (formData: LeaveCreditDetail) => {
        try {
            if (editingRow) {
                detailDB.update(editingRow.id, formData);
                toast.success('Record updated');
            } else {
                detailDB.create(formData);
                toast.success('Record added');
            }
            loadData();
            handleFormClose();
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCreditDetail) => {
        setEditingRow(row);
        setIsFormOpen(true);
        setValue('type', row.type);
        setValue('department', row.department);
        setValue('designation', row.designation);
        setValue('leaveName', row.leaveName);
        setValue('leaveCode', row.leaveCode);
        setValue('months', row.months);
        setTimeout(() => document.getElementById('leave-credit-details-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        detailDB.remove(id);
        toast.success('Record deleted');
        loadData();
    };

    const columns = useMemo(
        () => [
            { accessorKey: 'leaveName', header: 'Leave Name' },
            { accessorKey: 'leaveCode', header: 'Leave Code' },
            ...MONTHS.map((m) => ({ accessorKey: `months.${m}`, header: m })),
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: { row: any }) => (
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleEdit(row.original)}>
                            Edit
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleDelete(row.original.id)}>
                            Delete
                        </Button>
                    </div>
                )
            }
        ],
        []
    );

    const typeOptions = ['VKS', 'Permanent', 'ELearning', 'Robotic', 'Internship', 'Management Admin'];
    const departmentOptions = ['Hardware and Network', 'Sales', 'Human Resource', 'Admin', 'LEGAL', 'IT Team'];
    const designationOptions = [
        'Computer Faculty',
        'E-learning coordinator',
        'Accounts and Finance Executive',
        'Client acquisition manager',
        'Sr HR Executive',
        'Manager HR'
    ];

    const toggleMulti = (field: 'type' | 'department' | 'designation', value: string, checked: boolean) => {
        const current = watch(field);
        if (checked) setValue(field, [...current, value]);
        else
            setValue(
                field,
                current.filter((v: string) => v !== value)
            );
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Credit Details' />
                    </div>
                    <Button onClick={handleAddClick} className='bg-blue-600 hover:bg-blue-700'>
                        Add Leave Credit Details
                    </Button>
                </div>

                <CollapsibleSection
                    title='Leave Credit Details'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-credit-details-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Credit Details' : 'Add Credit Details'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
                                    <div className='space-y-4'>
                                        <div>
                                            <label className='font-medium text-sm'>Type</label>
                                            <div className='max-h-40 overflow-y-auto rounded-md border p-2'>
                                                {typeOptions.map((t) => (
                                                    <label key={t} className='flex items-center gap-2 text-sm'>
                                                        <Checkbox
                                                            checked={watch('type').includes(t)}
                                                            onCheckedChange={(c) => toggleMulti('type', t, c as boolean)}
                                                        />
                                                        <span>{t}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className='font-medium text-sm'>Department</label>
                                            <div className='max-h-40 overflow-y-auto rounded-md border p-2'>
                                                {departmentOptions.map((t) => (
                                                    <label key={t} className='flex items-center gap-2 text-sm'>
                                                        <Checkbox
                                                            checked={watch('department').includes(t)}
                                                            onCheckedChange={(c) => toggleMulti('department', t, c as boolean)}
                                                        />
                                                        <span>{t}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className='font-medium text-sm'>Designation</label>
                                            <div className='max-h-40 overflow-y-auto rounded-md border p-2'>
                                                {designationOptions.map((t) => (
                                                    <label key={t} className='flex items-center gap-2 text-sm'>
                                                        <Checkbox
                                                            checked={watch('designation').includes(t)}
                                                            onCheckedChange={(c) => toggleMulti('designation', t, c as boolean)}
                                                        />
                                                        <span>{t}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <div>
                                            <label className='font-medium text-sm'>Leave Name *</label>
                                            <Select value={watch('leaveName')} onValueChange={(v) => setValue('leaveName', v)}>
                                                <SelectTrigger className={errors.leaveName ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder='Select Leave' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                                    <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                                    <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                                    <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className='font-medium text-sm'>Leave Code</label>
                                            <InputText {...register('leaveCode')} placeholder='Enter leave code' />
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                                            {MONTHS.map((m) => (
                                                <div key={m} className='flex items-center gap-2'>
                                                    <label className='w-24 text-sm'>{m}</label>
                                                    <InputText
                                                        type='number'
                                                        step='0.5'
                                                        value={watch('months')[m] ?? 0}
                                                        onChange={(e) =>
                                                            setValue('months', {
                                                                ...watch('months'),
                                                                [m]: Number.parseFloat(e.target.value || '0')
                                                            })
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                                        {editingRow ? 'Update' : 'Save'}
                                    </Button>
                                    <Button type='button' variant='outline' onClick={handleFormClose}>
                                        Clear
                                    </Button>
                                </div>
                            </form>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
