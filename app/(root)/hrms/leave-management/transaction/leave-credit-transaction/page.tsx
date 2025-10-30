// Refactored by automation script on 2025-10-28T15:40:35.834Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-credit-transaction-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveCreditTransaction extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    fromDate?: string;
    toDate?: string;
    employee?: string;
    lossOfPay: boolean;
    leaveName: string;
    availed: number;
}

const txDB = createLocalCrud<LeaveCreditTransaction>('leaveCreditTransaction');

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
const employeeOptions = ['Steffi Halian', 'Shruthi NA', 'Bindhushree N', 'Chaithra NS', 'Balu Prabhakar'];
const leaveNames = ['CL', 'SL', 'PL', 'LWP', 'OD'];

export default function LeaveCreditTransactionPage() {
    const [data, setData] = useState<LeaveCreditTransaction[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<LeaveCreditTransaction | null>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm<LeaveCreditTransaction>({
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            leaveYear: '2025',
            fromDate: '',
            toDate: '',
            employee: '',
            lossOfPay: false,
            leaveName: 'CL',
            availed: 0
        }
    });

    const loadData = () => {
        try {
            setData(txDB.list());
        } catch (_error) {
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
            leaveYear: '2025',
            fromDate: '',
            toDate: '',
            employee: '',
            lossOfPay: false,
            leaveName: 'CL',
            availed: 0
        });
        setTimeout(() => document.getElementById('leave-credit-transaction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRow(null);
        reset({
            type: [],
            department: [],
            designation: [],
            leaveYear: '2025',
            fromDate: '',
            toDate: '',
            employee: '',
            lossOfPay: false,
            leaveName: 'CL',
            availed: 0
        });
    };

    const onSubmit = (formData: LeaveCreditTransaction) => {
        try {
            if (editingRow) txDB.update(editingRow.id, formData);
            else txDB.create(formData);
            loadData();
            handleFormClose();
            toast.success('Saved successfully');
        } catch (_e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (row: LeaveCreditTransaction) => {
        setEditingRow(row);
        setIsFormOpen(true);
        Object.entries(row).forEach(([k, v]) => setValue(k as any, v as any));
        setTimeout(() => document.getElementById('leave-credit-transaction-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this record?')) return;
        txDB.remove(id);
        loadData();
    };

    const toggleMulti = (field: 'type' | 'department' | 'designation', value: string, checked: boolean) => {
        const current = watch(field);
        if (checked) setValue(field, [...current, value]);
        else
            setValue(
                field,
                current.filter((v: string) => v !== value)
            );
    };

    const columns = useMemo(
        () => [
            { accessorKey: 'leaveYear', header: 'Leave Year' },
            { accessorKey: 'employee', header: 'Employee' },
            { accessorKey: 'leaveName', header: 'Leave Name' },
            { accessorKey: 'availed', header: 'Availed' },
            { accessorKey: 'fromDate', header: 'From Date' },
            { accessorKey: 'toDate', header: 'To Date' },
            { accessorKey: 'lossOfPay', header: 'Loss of Pay' },
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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Transaction' />
                    </div>
                    <Button onClick={handleAddClick}>Add Leave Transaction</Button>
                </div>

                <CollapsibleSection
                    title='Leave Transaction List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {isFormOpen && (
                    <div id='leave-credit-transaction-form'>
                        <CollapsibleSection
                            title={editingRow ? 'Edit Transaction' : 'Add Transaction'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
                                    <div className='space-y-2'>
                                        <label htmlFor='type-checkboxes' className='font-medium text-sm'>
                                            Type
                                        </label>
                                        <div id='type-checkboxes' className='max-h-44 overflow-y-auto rounded-md border p-2'>
                                            {typeOptions.map((t) => (
                                                <div key={t} className='flex items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        id={`type-${t}`}
                                                        checked={watch('type').includes(t)}
                                                        onCheckedChange={(c) => toggleMulti('type', t, c as boolean)}
                                                    />
                                                    <Label htmlFor={`type-${t}`}>{t}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <label htmlFor='department-checkboxes' className='font-medium text-sm'>
                                            Department
                                        </label>
                                        <div id='department-checkboxes' className='max-h-44 overflow-y-auto rounded-md border p-2'>
                                            {departmentOptions.map((t) => (
                                                <div key={t} className='flex items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        id={`dept-${t}`}
                                                        checked={watch('department').includes(t)}
                                                        onCheckedChange={(c) => toggleMulti('department', t, c as boolean)}
                                                    />
                                                    <Label htmlFor={`dept-${t}`}>{t}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <label htmlFor='designation-checkboxes' className='font-medium text-sm'>
                                            Designation
                                        </label>
                                        <div id='designation-checkboxes' className='max-h-44 overflow-y-auto rounded-md border p-2'>
                                            {designationOptions.map((t) => (
                                                <div key={t} className='flex items-center gap-2 text-sm'>
                                                    <Checkbox
                                                        id={`desig-${t}`}
                                                        checked={watch('designation').includes(t)}
                                                        onCheckedChange={(c) => toggleMulti('designation', t, c as boolean)}
                                                    />
                                                    <Label htmlFor={`desig-${t}`}>{t}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <div>
                                            <label htmlFor='leave-year-select' className='font-medium text-sm'>
                                                Leave Year
                                            </label>
                                            <Select value={watch('leaveYear')} onValueChange={(v) => setValue('leaveYear', v)}>
                                                <SelectTrigger id='leave-year-select'>
                                                    <SelectValue placeholder='Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                                                        <SelectItem key={y} value={y}>
                                                            {y}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                                            <div>
                                                <label htmlFor='from-date-input' className='font-medium text-sm'>
                                                    From Date
                                                </label>
                                                <InputText id='from-date-input' type='date' {...register('fromDate')} />
                                            </div>
                                            <div>
                                                <label htmlFor='to-date-input' className='font-medium text-sm'>
                                                    To Date
                                                </label>
                                                <InputText id='to-date-input' type='date' {...register('toDate')} />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor='employee-select' className='font-medium text-sm'>
                                                Employee
                                            </label>
                                            <Select value={watch('employee')} onValueChange={(v) => setValue('employee', v)}>
                                                <SelectTrigger id='employee-select'>
                                                    <SelectValue placeholder='Select employee' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employeeOptions.map((e) => (
                                                        <SelectItem key={e} value={e}>
                                                            {e}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Checkbox
                                                checked={watch('lossOfPay')}
                                                onCheckedChange={(c) => setValue('lossOfPay', c as boolean)}
                                            />
                                            <span className='text-sm'>Loss of Pay</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <div>
                                        <label htmlFor='leave-name-select' className='font-medium text-sm'>
                                            Leave Name
                                        </label>
                                        <Select value={watch('leaveName')} onValueChange={(v) => setValue('leaveName', v)}>
                                            <SelectTrigger id='leave-name-select'>
                                                <SelectValue placeholder='Leave' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveNames.map((n) => (
                                                    <SelectItem key={n} value={n}>
                                                        {n}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label htmlFor='availed-input' className='font-medium text-sm'>
                                            Availed
                                        </label>
                                        <InputText
                                            id='availed-input'
                                            type='number'
                                            step='0.5'
                                            {...register('availed', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2'>
                                    <Button type='submit'>{editingRow ? 'Update' : 'Save'}</Button>
                                    <Button type='button' variant='outline' onClick={handleFormClose}>
                                        Cancel
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
