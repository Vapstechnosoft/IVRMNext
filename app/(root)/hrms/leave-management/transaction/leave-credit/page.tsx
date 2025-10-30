// Refactored by automation script on 2025-10-28T15:40:35.796Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-credit-form.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveCredit extends BaseEntity {
    leaveYear: string;
    leaveName: string;
    employeeName: string;
    leaveCredit: number;
    leaveBalance: number;
    type: string[];
    department: string[];
    designation: string[];
}

const leaveCreditDB = createLocalCrud<LeaveCredit>('leaveCredit');

export default function LeaveCreditPage() {
    const [data, setData] = useState<LeaveCredit[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCredit, setEditingCredit] = useState<LeaveCredit | null>(null);
    const [activeTab, setActiveTab] = useState('Leave Credit');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveCredit>({
        defaultValues: {
            leaveYear: '',
            leaveName: '',
            employeeName: '',
            leaveCredit: 0,
            leaveBalance: 0,
            type: [],
            department: [],
            designation: []
        }
    });

    const loadData = () => {
        try {
            const result = leaveCreditDB.list();
            setData(result);
        } catch (error) {
            console.error('Error loading leave credits:', error);
            toast.error('Failed to load leave credits');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingCredit(null);
        reset({
            leaveYear: '',
            leaveName: '',
            employeeName: '',
            leaveCredit: 0,
            leaveBalance: 0,
            type: [],
            department: [],
            designation: []
        });
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingCredit(null);
        reset({
            leaveYear: '',
            leaveName: '',
            employeeName: '',
            leaveCredit: 0,
            leaveBalance: 0,
            type: [],
            department: [],
            designation: []
        });
    };

    const onSubmit = (formData: LeaveCredit) => {
        try {
            if (editingCredit) {
                leaveCreditDB.update(editingCredit.id, formData);
                toast.success('Leave credit updated successfully');
            } else {
                leaveCreditDB.create(formData);
                toast.success('Leave credit created successfully');
            }
            loadData();
            handleFormClose();
        } catch (error) {
            console.error('Error saving leave credit:', error);
            toast.error('Failed to save leave credit');
        }
    };

    const handleEdit = (credit: LeaveCredit) => {
        setEditingCredit(credit);
        setIsFormOpen(true);
        setValue('leaveYear', credit.leaveYear);
        setValue('leaveName', credit.leaveName);
        setValue('employeeName', credit.employeeName);
        setValue('leaveCredit', credit.leaveCredit);
        setValue('leaveBalance', credit.leaveBalance);
        setValue('type', credit.type);
        setValue('department', credit.department);
        setValue('designation', credit.designation);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-credit-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave credit?')) {
            try {
                leaveCreditDB.remove(id);
                toast.success('Leave credit deleted successfully');
                loadData();
            } catch (error) {
                console.error('Error deleting leave credit:', error);
                toast.error('Failed to delete leave credit');
            }
        }
    };

    const handleClear = () => {
        handleFormClose();
    };

    const handleTypeChange = (type: string, checked: boolean) => {
        const currentTypes = watch('type');
        if (checked) {
            setValue('type', [...currentTypes, type]);
        } else {
            setValue(
                'type',
                currentTypes.filter((t) => t !== type)
            );
        }
    };

    const handleDepartmentChange = (dept: string, checked: boolean) => {
        const currentDepts = watch('department');
        if (checked) {
            setValue('department', [...currentDepts, dept]);
        } else {
            setValue(
                'department',
                currentDepts.filter((d) => d !== dept)
            );
        }
    };

    const handleDesignationChange = (desig: string, checked: boolean) => {
        const currentDesigs = watch('designation');
        if (checked) {
            setValue('designation', [...currentDesigs, desig]);
        } else {
            setValue(
                'designation',
                currentDesigs.filter((d) => d !== desig)
            );
        }
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'leaveYear',
                header: 'Leave Year'
            },
            {
                accessorKey: 'employeeName',
                header: 'Employee Name'
            },
            {
                accessorKey: 'leaveName',
                header: 'Leave Name'
            },
            {
                accessorKey: 'leaveCredit',
                header: 'Leave Credit'
            },
            {
                accessorKey: 'leaveBalance',
                header: 'Leave Balance'
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: { row: any }) => (
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleEdit(row.original)}>
                            <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleDelete(row.original.id)}>
                            <Trash2 className='h-4 w-4' />
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

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Leave Credit Process' />
                    </div>
                    <Button onClick={handleAddClick} className='bg-blue-600 hover:bg-blue-700'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Leave Credit
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title='Leave Transfer Report'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-4'>
                        <p className='text-gray-600 text-sm'>Total grid records: {data.length}</p>
                    </div>
                    <GenericDataTable data={data} columns={columns} totalItems={data.length} isLoading={false} />
                </CollapsibleSection>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='leave-credit-form'>
                        <CollapsibleSection
                            title={editingCredit ? 'Edit Leave Credit' : 'Add Leave Credit'}
                            description=''
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                                <TabsList className='grid w-full grid-cols-4'>
                                    <TabsTrigger value='Leave Credit'>Leave Credit</TabsTrigger>
                                    <TabsTrigger value='Leave Addition'>Leave Addition</TabsTrigger>
                                    <TabsTrigger value='Leave Deduction'>Leave Deduction</TabsTrigger>
                                    <TabsTrigger value='Leave CarryForward'>Leave CarryForward</TabsTrigger>
                                </TabsList>

                                <TabsContent value='Leave Credit' className='space-y-4'>
                                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                            <div>
                                                <label htmlFor='type-checkboxes' className='font-medium text-sm'>
                                                    Type
                                                </label>
                                                <div
                                                    id='type-checkboxes'
                                                    className='max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                                    <div className='mb-2 flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='type-all'
                                                            checked={watch('type').length === typeOptions.length}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setValue('type', typeOptions);
                                                                } else {
                                                                    setValue('type', []);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor='type-all' className='font-medium text-sm'>
                                                            Type: All
                                                        </label>
                                                    </div>
                                                    {typeOptions.map((type) => (
                                                        <div key={type} className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                id={`type-${type}`}
                                                                checked={watch('type').includes(type)}
                                                                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                                                            />
                                                            <label htmlFor={`type-${type}`} className='text-sm'>
                                                                {type}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor='department-checkboxes' className='font-medium text-sm'>
                                                    Department
                                                </label>
                                                <div
                                                    id='department-checkboxes'
                                                    className='max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                                    <div className='mb-2 flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='dept-all'
                                                            checked={watch('department').length === departmentOptions.length}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setValue('department', departmentOptions);
                                                                } else {
                                                                    setValue('department', []);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor='dept-all' className='font-medium text-sm'>
                                                            Department: All
                                                        </label>
                                                    </div>
                                                    {departmentOptions.map((dept) => (
                                                        <div key={dept} className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                id={`dept-${dept}`}
                                                                checked={watch('department').includes(dept)}
                                                                onCheckedChange={(checked) =>
                                                                    handleDepartmentChange(dept, checked as boolean)
                                                                }
                                                            />
                                                            <label htmlFor={`dept-${dept}`} className='text-sm'>
                                                                {dept}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor='designation-checkboxes' className='font-medium text-sm'>
                                                    Designation
                                                </label>
                                                <div
                                                    id='designation-checkboxes'
                                                    className='max-h-32 overflow-y-auto rounded-md border border-gray-300 p-2'>
                                                    <div className='mb-2 flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='desig-all'
                                                            checked={watch('designation').length === designationOptions.length}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setValue('designation', designationOptions);
                                                                } else {
                                                                    setValue('designation', []);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor='desig-all' className='font-medium text-sm'>
                                                            Designation: All
                                                        </label>
                                                    </div>
                                                    {designationOptions.map((desig) => (
                                                        <div key={desig} className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                id={`desig-${desig}`}
                                                                checked={watch('designation').includes(desig)}
                                                                onCheckedChange={(checked) =>
                                                                    handleDesignationChange(desig, checked as boolean)
                                                                }
                                                            />
                                                            <label htmlFor={`desig-${desig}`} className='text-sm'>
                                                                {desig}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div>
                                                <label htmlFor='leave-year-select' className='font-medium text-sm'>
                                                    Leave Year *
                                                </label>
                                                <Select value={watch('leaveYear')} onValueChange={(value) => setValue('leaveYear', value)}>
                                                    <SelectTrigger
                                                        id='leave-year-select'
                                                        className={errors.leaveYear ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='Select Leave Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='2019'>2019</SelectItem>
                                                        <SelectItem value='2020'>2020</SelectItem>
                                                        <SelectItem value='2021'>2021</SelectItem>
                                                        <SelectItem value='2022'>2022</SelectItem>
                                                        <SelectItem value='2023'>2023</SelectItem>
                                                        <SelectItem value='2024'>2024</SelectItem>
                                                        <SelectItem value='2025'>2025</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.leaveYear && (
                                                    <p className='mt-1 text-red-500 text-xs'>{errors.leaveYear.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor='leave-name-select' className='font-medium text-sm'>
                                                    Leave Name *
                                                </label>
                                                <Select value={watch('leaveName')} onValueChange={(value) => setValue('leaveName', value)}>
                                                    <SelectTrigger
                                                        id='leave-name-select'
                                                        className={errors.leaveName ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='Select Leave Name' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                                        <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                                        <SelectItem value='Optional Leave'>Optional Leave</SelectItem>
                                                        <SelectItem value='Emergency Leave'>Emergency Leave</SelectItem>
                                                        <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                                        <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.leaveName && (
                                                    <p className='mt-1 text-red-500 text-xs'>{errors.leaveName.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor='employee-name-input' className='font-medium text-sm'>
                                                    Employee Name
                                                </label>
                                                <InputText
                                                    id='employee-name-input'
                                                    {...register('employeeName')}
                                                    placeholder='Enter employee name'
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor='leave-credit-input' className='font-medium text-sm'>
                                                    Leave Credit
                                                </label>
                                                <InputText
                                                    id='leave-credit-input'
                                                    {...register('leaveCredit', { valueAsNumber: true })}
                                                    placeholder='Enter leave credit'
                                                    type='number'
                                                    step='0.5'
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor='leave-balance-input' className='font-medium text-sm'>
                                                    Leave Balance
                                                </label>
                                                <InputText
                                                    id='leave-balance-input'
                                                    {...register('leaveBalance', { valueAsNumber: true })}
                                                    placeholder='Enter leave balance'
                                                    type='number'
                                                    step='0.5'
                                                />
                                            </div>
                                        </div>

                                        <div className='flex gap-2'>
                                            <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                                                {editingCredit ? 'Update' : 'Save'}
                                            </Button>
                                            <Button type='button' variant='destructive' onClick={handleClear}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </TabsContent>

                                <TabsContent value='Leave Addition' className='space-y-4'>
                                    <div className='py-8 text-center text-gray-500'>
                                        Leave Addition functionality will be implemented here
                                    </div>
                                </TabsContent>

                                <TabsContent value='Leave Deduction' className='space-y-4'>
                                    <div className='py-8 text-center text-gray-500'>
                                        Leave Deduction functionality will be implemented here
                                    </div>
                                </TabsContent>

                                <TabsContent value='Leave CarryForward' className='space-y-4'>
                                    <div className='py-8 text-center text-gray-500'>
                                        Leave CarryForward functionality will be implemented here
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
