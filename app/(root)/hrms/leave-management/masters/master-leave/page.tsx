// Refactored by automation script on 2025-10-28T15:40:35.757Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-form.tsx
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
import { Check, Edit, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface MasterLeave extends BaseEntity {
    leaveName: string;
    leaveCode: string;
    leaveType: string;
    leaveApplyCriteria: string;
    daysForApplyCriteria: string;
    maxDaysForApply: string;
    leaveDetails: string;
    leaveCredit: boolean;
    lateDeduct: boolean;
    probationNotApplicable: boolean;
    leaveOrder: number;
    isActive: boolean;
}

const masterLeaveDB = createLocalCrud<MasterLeave>('masterLeave');

export default function MasterLeavePage() {
    const [data, setData] = useState<MasterLeave[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState<MasterLeave | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<MasterLeave>({
        defaultValues: {
            leaveName: '',
            leaveCode: '',
            leaveType: '',
            leaveApplyCriteria: '',
            daysForApplyCriteria: '',
            maxDaysForApply: '',
            leaveDetails: '',
            leaveCredit: false,
            lateDeduct: false,
            probationNotApplicable: false,
            leaveOrder: 0,
            isActive: true
        }
    });

    const loadData = () => {
        try {
            const result = masterLeaveDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading master leaves:', error);
            toast.error('Failed to load master leaves');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingLeave(null);
        reset({
            leaveName: '',
            leaveCode: '',
            leaveType: '',
            leaveApplyCriteria: '',
            daysForApplyCriteria: '',
            maxDaysForApply: '',
            leaveDetails: '',
            leaveCredit: false,
            lateDeduct: false,
            probationNotApplicable: false,
            leaveOrder: 0,
            isActive: true
        });
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('master-leave-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingLeave(null);
        reset({
            leaveName: '',
            leaveCode: '',
            leaveType: '',
            leaveApplyCriteria: '',
            daysForApplyCriteria: '',
            maxDaysForApply: '',
            leaveDetails: '',
            leaveCredit: false,
            lateDeduct: false,
            probationNotApplicable: false,
            leaveOrder: 0,
            isActive: true
        });
    };

    const onSubmit = (formData: MasterLeave) => {
        try {
            if (editingLeave) {
                masterLeaveDB.update(editingLeave.id, formData);
                toast.success('Master leave updated successfully');
            } else {
                masterLeaveDB.create(formData);
                toast.success('Master leave created successfully');
            }
            loadData();
            handleFormClose();
        } catch (error) {
            console.error('Error saving master leave:', error);
            toast.error('Failed to save master leave');
        }
    };

    const handleEdit = (leave: MasterLeave) => {
        setEditingLeave(leave);
        setIsFormOpen(true);
        setValue('leaveName', leave.leaveName);
        setValue('leaveCode', leave.leaveCode);
        setValue('leaveType', leave.leaveType);
        setValue('leaveApplyCriteria', leave.leaveApplyCriteria);
        setValue('daysForApplyCriteria', leave.daysForApplyCriteria);
        setValue('maxDaysForApply', leave.maxDaysForApply);
        setValue('leaveDetails', leave.leaveDetails);
        setValue('leaveCredit', leave.leaveCredit);
        setValue('lateDeduct', leave.lateDeduct);
        setValue('probationNotApplicable', leave.probationNotApplicable);
        setValue('leaveOrder', leave.leaveOrder);
        setValue('isActive', leave.isActive);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('master-leave-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this master leave?')) {
            try {
                masterLeaveDB.remove(id);
                toast.success('Master leave deleted successfully');
                loadData();
            } catch (error) {
                console.error('Error deleting master leave:', error);
                toast.error('Failed to delete master leave');
            }
        }
    };

    const handleToggleStatus = (leave: MasterLeave) => {
        try {
            masterLeaveDB.update(leave.id, { isActive: !leave.isActive });
            toast.success(`Master leave ${leave.isActive ? 'deactivated' : 'activated'} successfully`);
            loadData();
        } catch (error) {
            console.error('Error toggling master leave status:', error);
            toast.error('Failed to toggle master leave status');
        }
    };

    const handleClear = () => {
        handleFormClose();
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'leaveName',
                header: 'Leave Name'
            },
            {
                accessorKey: 'leaveCode',
                header: 'Leave Code'
            },
            {
                accessorKey: 'leaveType',
                header: 'Leave Type'
            },
            {
                accessorKey: 'leaveOrder',
                header: 'Leave Order'
            },
            {
                accessorKey: 'leaveCredit',
                header: 'Leave Credit',
                cell: ({ row }: { row: any }) => (
                    <div className='flex justify-center'>
                        {row.original.leaveCredit ? <Check className='h-4 w-4 text-green-600' /> : <X className='h-4 w-4 text-red-600' />}
                    </div>
                )
            },
            {
                accessorKey: 'lateDeduct',
                header: 'Leave Deduct',
                cell: ({ row }: { row: any }) => (
                    <div className='flex justify-center'>
                        {row.original.lateDeduct ? <Check className='h-4 w-4 text-green-600' /> : <X className='h-4 w-4 text-red-600' />}
                    </div>
                )
            },
            {
                accessorKey: 'probationNotApplicable',
                header: 'Probation',
                cell: ({ row }: { row: any }) => (
                    <div className='flex justify-center'>
                        {row.original.probationNotApplicable ? (
                            <Check className='h-4 w-4 text-green-600' />
                        ) : (
                            <X className='h-4 w-4 text-red-600' />
                        )}
                    </div>
                )
            },
            {
                id: 'actions',
                header: 'Action',
                cell: ({ row }: { row: any }) => (
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleEdit(row.original)}>
                            <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleDelete(row.original.id)}>
                            <Trash2 className='h-4 w-4' />
                        </Button>
                        <Button
                            variant={row.original.isActive ? 'destructive' : 'default'}
                            size='sm'
                            onClick={() => handleToggleStatus(row.original)}>
                            {row.original.isActive ? 'Deactivate' : 'Activate'}
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
                        <Heading title='Leave Management' description='Master Leave Management' />
                    </div>
                    <Button onClick={handleAddClick} className='bg-blue-600 hover:bg-blue-700'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Master Leave
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title='Master Leave List'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='master-leave-form'>
                        <CollapsibleSection
                            title={editingLeave ? 'Edit Master Leave' : 'Add Master Leave'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                    <div>
                                        <label htmlFor='leave-name-input' className='font-medium text-sm'>
                                            Leave Name *
                                        </label>
                                        <InputText
                                            id='leave-name-input'
                                            {...register('leaveName', { required: 'Leave name is required' })}
                                            placeholder='Enter leave name'
                                            className={errors.leaveName ? 'border-red-500' : ''}
                                        />
                                        {errors.leaveName && <p className='mt-1 text-red-500 text-xs'>{errors.leaveName.message}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor='leave-code-input' className='font-medium text-sm'>
                                            Leave Code *
                                        </label>
                                        <InputText
                                            id='leave-code-input'
                                            {...register('leaveCode', { required: 'Leave code is required' })}
                                            placeholder='Enter leave code'
                                            className={errors.leaveCode ? 'border-red-500' : ''}
                                        />
                                        {errors.leaveCode && <p className='mt-1 text-red-500 text-xs'>{errors.leaveCode.message}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor='leave-type-select' className='font-medium text-sm'>
                                            Leave Type *
                                        </label>
                                        <Select value={watch('leaveType')} onValueChange={(value) => setValue('leaveType', value)}>
                                            <SelectTrigger id='leave-type-select' className={errors.leaveType ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Leave Type' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='On_Duty'>On Duty</SelectItem>
                                                <SelectItem value='Comp_Off'>Comp Off</SelectItem>
                                                <SelectItem value='LWP'>LWP</SelectItem>
                                                <SelectItem value='EL'>Emergency Leave</SelectItem>
                                                <SelectItem value='SL'>Sick Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.leaveType && <p className='mt-1 text-red-500 text-xs'>{errors.leaveType.message}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor='leave-apply-criteria-select' className='font-medium text-sm'>
                                            Leave Apply Criteria *
                                        </label>
                                        <Select
                                            value={watch('leaveApplyCriteria')}
                                            onValueChange={(value) => setValue('leaveApplyCriteria', value)}>
                                            <SelectTrigger
                                                id='leave-apply-criteria-select'
                                                className={errors.leaveApplyCriteria ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Apply Criteria' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Before'>Before</SelectItem>
                                                <SelectItem value='After'>After</SelectItem>
                                                <SelectItem value='Same Day'>Same Day</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.leaveApplyCriteria && (
                                            <p className='mt-1 text-red-500 text-xs'>{errors.leaveApplyCriteria.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor='days-apply-criteria-input' className='font-medium text-sm'>
                                            Days for Apply Criteria
                                        </label>
                                        <InputText
                                            id='days-apply-criteria-input'
                                            {...register('daysForApplyCriteria')}
                                            placeholder='Enter days'
                                            type='number'
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor='max-days-apply-input' className='font-medium text-sm'>
                                            Max Days For Apply
                                        </label>
                                        <InputText
                                            id='max-days-apply-input'
                                            {...register('maxDaysForApply')}
                                            placeholder='Enter max days'
                                            type='number'
                                        />
                                    </div>

                                    <div className='md:col-span-3'>
                                        <label htmlFor='leave-details-textarea' className='font-medium text-sm'>
                                            Leave Details
                                        </label>
                                        <textarea
                                            id='leave-details-textarea'
                                            {...register('leaveDetails')}
                                            placeholder='Enter leave details'
                                            className='w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='leaveCredit'
                                            checked={watch('leaveCredit')}
                                            onCheckedChange={(checked) => setValue('leaveCredit', checked as boolean)}
                                        />
                                        <label htmlFor='leaveCredit' className='font-medium text-sm'>
                                            Leave Credit
                                        </label>
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='lateDeduct'
                                            checked={watch('lateDeduct')}
                                            onCheckedChange={(checked) => setValue('lateDeduct', checked as boolean)}
                                        />
                                        <label htmlFor='lateDeduct' className='font-medium text-sm'>
                                            Late Deduct
                                        </label>
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='probationNotApplicable'
                                            checked={watch('probationNotApplicable')}
                                            onCheckedChange={(checked) => setValue('probationNotApplicable', checked as boolean)}
                                        />
                                        <label htmlFor='probationNotApplicable' className='font-medium text-sm'>
                                            Probation NOT Applicable
                                        </label>
                                    </div>

                                    <div>
                                        <label htmlFor='leave-order-input' className='font-medium text-sm'>
                                            Leave Order
                                        </label>
                                        <InputText
                                            id='leave-order-input'
                                            {...register('leaveOrder', { valueAsNumber: true })}
                                            placeholder='Enter order'
                                            type='number'
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2'>
                                    <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                                        {editingLeave ? 'Update' : 'Save'}
                                    </Button>
                                    <Button type='button' variant='outline' onClick={handleClear}>
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
