// Refactored by automation script on 2025-10-28T15:40:35.752Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/leave-authorization-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Edit, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveAuthorization extends BaseEntity {
    institution: string;
    gradeName: string;
    groupTypeName: string;
    departmentName: string;
    designationName: string;
    leaveType: string;
    orderOfApproval: string;
    approvalPerson: string;
    finalFlag: boolean;
    emailId: string;
    sanctionedUser: string;
    sanctionedOrder: string;
}

const leaveAuthDB = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

export default function LeaveAuthorizationPage() {
    const [data, setData] = useState<LeaveAuthorization[]>([]);
    const [_isFormOpen, setIsFormOpen] = useState(false);
    const [editingAuth, setEditingAuth] = useState<LeaveAuthorization | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<LeaveAuthorization[]>([]);

    const {
        // register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveAuthorization>({
        defaultValues: {
            institution: 'Vaps Knowledge Services Pvt Ltd',
            gradeName: '',
            groupTypeName: '',
            departmentName: '',
            designationName: '',
            leaveType: '',
            orderOfApproval: '',
            approvalPerson: '',
            finalFlag: false,
            emailId: '',
            sanctionedUser: '',
            sanctionedOrder: ''
        }
    });

    const loadData = () => {
        try {
            const result = leaveAuthDB.list();
            setData(result);
            setFilteredData(result);
        } catch (error) {
            console.error('Error loading leave authorizations:', error);
            toast.error('Failed to load leave authorizations');
        }
    };

    useEffect(() => {
        loadData();

        // Add sample data if no data exists
        const existingData = leaveAuthDB.list();
        if (existingData.length === 0) {
            const sampleData: Omit<LeaveAuthorization, 'id' | 'createdAt'>[] = [
                {
                    institution: 'Vaps Knowledge Services Pvt Ltd',
                    gradeName: 'Manager',
                    groupTypeName: 'VKS',
                    departmentName: 'Sales and Marketing',
                    designationName: 'Assistant Business Development Manager',
                    leaveType: 'Comp Off',
                    orderOfApproval: '1',
                    approvalPerson: 'Benoy Yogesh Shetty',
                    finalFlag: false,
                    emailId: 'benoy@vaps.com',
                    sanctionedUser: 'Benoy Yogesh Shetty',
                    sanctionedOrder: '1'
                },
                {
                    institution: 'Vaps Knowledge Services Pvt Ltd',
                    gradeName: 'Manager',
                    groupTypeName: 'VKS',
                    departmentName: 'Sales and Marketing',
                    designationName: 'Assistant Business Development Manager',
                    leaveType: 'Optional Leave',
                    orderOfApproval: '1',
                    approvalPerson: 'Benoy Yogesh Shetty',
                    finalFlag: false,
                    emailId: 'benoy@vaps.com',
                    sanctionedUser: 'Benoy Yogesh Shetty',
                    sanctionedOrder: '1'
                },
                {
                    institution: 'Vaps Knowledge Services Pvt Ltd',
                    gradeName: 'Manager',
                    groupTypeName: 'VKS',
                    departmentName: 'Sales and Marketing',
                    designationName: 'Assistant Business Development Manager',
                    leaveType: 'Optional Leave',
                    orderOfApproval: '1',
                    approvalPerson: 'Benoy Yogesh Shetty',
                    finalFlag: false,
                    emailId: 'benoy@vaps.com',
                    sanctionedUser: 'Benoy Yogesh Shetty',
                    sanctionedOrder: '1'
                }
            ];

            sampleData.forEach((data) => leaveAuthDB.create(data));
            loadData();
        }
    }, []);

    // Filter data based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredData(data);
        } else {
            const filtered = data.filter(
                (item) =>
                    item.gradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.designationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.groupTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.sanctionedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.sanctionedOrder.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchTerm, data]);

    const _handleAddClick = () => {
        setIsFormOpen(true);
        setEditingAuth(null);
        reset({
            institution: 'Vaps Knowledge Services Pvt Ltd',
            gradeName: '',
            groupTypeName: '',
            departmentName: '',
            designationName: '',
            leaveType: '',
            orderOfApproval: '',
            approvalPerson: '',
            finalFlag: false,
            emailId: '',
            sanctionedUser: '',
            sanctionedOrder: ''
        });
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-auth-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAuth(null);
        reset({
            institution: 'Vaps Knowledge Services Pvt Ltd',
            gradeName: '',
            groupTypeName: '',
            departmentName: '',
            designationName: '',
            leaveType: '',
            orderOfApproval: '',
            approvalPerson: '',
            finalFlag: false,
            emailId: '',
            sanctionedUser: '',
            sanctionedOrder: ''
        });
    };

    const onSubmit = (formData: LeaveAuthorization) => {
        try {
            if (editingAuth) {
                leaveAuthDB.update(editingAuth.id, formData);
                toast.success('Leave authorization updated successfully');
            } else {
                leaveAuthDB.create(formData);
                toast.success('Leave authorization created successfully');
            }
            loadData();
            handleFormClose();
        } catch (error) {
            console.error('Error saving leave authorization:', error);
            toast.error('Failed to save leave authorization');
        }
    };

    const handleEdit = (auth: LeaveAuthorization) => {
        setEditingAuth(auth);
        setIsFormOpen(true);
        setValue('institution', auth.institution);
        setValue('gradeName', auth.gradeName);
        setValue('groupTypeName', auth.groupTypeName);
        setValue('departmentName', auth.departmentName);
        setValue('designationName', auth.designationName);
        setValue('leaveType', auth.leaveType);
        setValue('orderOfApproval', auth.orderOfApproval);
        setValue('approvalPerson', auth.approvalPerson);
        setValue('finalFlag', auth.finalFlag);
        setValue('emailId', auth.emailId);
        setValue('sanctionedUser', auth.sanctionedUser);
        setValue('sanctionedOrder', auth.sanctionedOrder);
        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('leave-auth-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this leave authorization?')) {
            try {
                leaveAuthDB.remove(id);
                toast.success('Leave authorization deleted successfully');
                loadData();
            } catch (error) {
                console.error('Error deleting leave authorization:', error);
                toast.error('Failed to delete leave authorization');
            }
        }
    };

    const handleClear = () => {
        handleFormClose();
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'SL.No',
                cell: ({ row }: { row: any }) => <div className='text-center'>{row.index + 1}</div>
            },
            {
                accessorKey: 'gradeName',
                header: 'Grade Name'
            },
            {
                accessorKey: 'departmentName',
                header: 'Department Name'
            },
            {
                accessorKey: 'designationName',
                header: 'Designation Name'
            },
            {
                accessorKey: 'groupTypeName',
                header: 'Group Type Name'
            },
            {
                accessorKey: 'leaveType',
                header: 'Leave Type'
            },
            {
                accessorKey: 'emailId',
                header: 'Email Id'
            },
            {
                accessorKey: 'sanctionedUser',
                header: 'Sanctioned User'
            },
            {
                accessorKey: 'sanctionedOrder',
                header: 'Sanctioned Order'
            },
            {
                accessorKey: 'finalFlag',
                header: 'Final Flag',
                cell: ({ row }: { row: any }) => (
                    <div className='flex justify-center'>
                        {row.original.finalFlag ? <span className='text-green-600'>✓</span> : <X className='h-4 w-4 text-red-600' />}
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
                    </div>
                )
            }
        ],
        []
    );

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container mx-auto space-y-6 p-6'>
                {/* Header Section */}
                <div className='rounded-lg bg-white p-6 shadow-sm'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='space-y-2'>
                            <h1 className='font-bold text-2xl text-gray-900'>LEAVE MANAGEMENT</h1>
                            <div className='flex items-center space-x-2 text-gray-600 text-sm'>
                                <span>Master</span>
                                <span>&gt;</span>
                                <span className='font-medium text-primary'>Leave Authorization</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Section */}
                    <div className='mt-6 border-gray-200 border-b'>
                        <div className='flex space-x-8'>
                            <button type='button' className='border-red-500 border-b-2 px-1 py-2 font-medium text-red-600 text-sm'>
                                LEAVE AUTHORIZATION
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className='rounded-lg bg-white p-6 shadow-sm'>
                    <h2 className='mb-4 font-semibold text-gray-900 text-lg'>Leave Authorization</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Institution Field */}
                        <div className='mb-4'>
                            <label htmlFor='institution-display' className='mb-2 block font-medium text-gray-700 text-sm'>
                                Institution
                            </label>
                            <div id='institution-display' className='rounded-md bg-gray-100 p-3 text-gray-600'>
                                {watch('institution')}
                            </div>
                        </div>

                        {/* Form Fields Grid */}
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-4'>
                                <div>
                                    <label htmlFor='grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Select Grade <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('gradeName')} onValueChange={(value) => setValue('gradeName', value)}>
                                        <SelectTrigger id='grade-select' className={errors.gradeName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Manager'>Manager</SelectItem>
                                            <SelectItem value='Executive'>Executive</SelectItem>
                                            <SelectItem value='Senior Manager'>Senior Manager</SelectItem>
                                            <SelectItem value='Director'>Director</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gradeName && <p className='mt-1 text-red-500 text-xs'>{errors.gradeName.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor='group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Group Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('groupTypeName')} onValueChange={(value) => setValue('groupTypeName', value)}>
                                        <SelectTrigger id='group-type-select' className={errors.groupTypeName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='VKS'>VKS</SelectItem>
                                            <SelectItem value='Admin'>Admin</SelectItem>
                                            <SelectItem value='HR'>HR</SelectItem>
                                            <SelectItem value='Finance'>Finance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.groupTypeName && <p className='mt-1 text-red-500 text-xs'>{errors.groupTypeName.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor='department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Department Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('departmentName')} onValueChange={(value) => setValue('departmentName', value)}>
                                        <SelectTrigger id='department-select' className={errors.departmentName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Sales and Marketing'>Sales and Marketing</SelectItem>
                                            <SelectItem value='Human Resources'>Human Resources</SelectItem>
                                            <SelectItem value='Finance'>Finance</SelectItem>
                                            <SelectItem value='Operations'>Operations</SelectItem>
                                            <SelectItem value='IT'>IT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.departmentName && <p className='mt-1 text-red-500 text-xs'>{errors.departmentName.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor='designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Designation Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('designationName')} onValueChange={(value) => setValue('designationName', value)}>
                                        <SelectTrigger id='designation-select' className={errors.designationName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Assistant Business Development Manager'>
                                                Assistant Business Development Manager
                                            </SelectItem>
                                            <SelectItem value='Business Development Manager'>Business Development Manager</SelectItem>
                                            <SelectItem value='Senior Business Development Manager'>
                                                Senior Business Development Manager
                                            </SelectItem>
                                            <SelectItem value='Team Lead'>Team Lead</SelectItem>
                                            <SelectItem value='Senior Manager'>Senior Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.designationName && (
                                        <p className='mt-1 text-red-500 text-xs'>{errors.designationName.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-4'>
                                <div>
                                    <label htmlFor='leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('leaveType')} onValueChange={(value) => setValue('leaveType', value)}>
                                        <SelectTrigger id='leave-type-select' className={errors.leaveType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                            <SelectItem value='Optional Leave'>Optional Leave</SelectItem>
                                            <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                            <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                            <SelectItem value='Emergency Leave'>Emergency Leave</SelectItem>
                                            <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.leaveType && <p className='mt-1 text-red-500 text-xs'>{errors.leaveType.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor='order-approval-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Order Of Approval <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('orderOfApproval')} onValueChange={(value) => setValue('orderOfApproval', value)}>
                                        <SelectTrigger
                                            id='order-approval-select'
                                            className={errors.orderOfApproval ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>1</SelectItem>
                                            <SelectItem value='2'>2</SelectItem>
                                            <SelectItem value='3'>3</SelectItem>
                                            <SelectItem value='4'>4</SelectItem>
                                            <SelectItem value='5'>5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.orderOfApproval && (
                                        <p className='mt-1 text-red-500 text-xs'>{errors.orderOfApproval.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor='approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Approval Person <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={watch('approvalPerson')} onValueChange={(value) => setValue('approvalPerson', value)}>
                                        <SelectTrigger
                                            id='approval-person-select'
                                            className={errors.approvalPerson ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Benoy Yogesh Shetty'>Benoy Yogesh Shetty</SelectItem>
                                            <SelectItem value='R Siddesh Kumar'>R Siddesh Kumar</SelectItem>
                                            <SelectItem value='John Doe'>John Doe</SelectItem>
                                            <SelectItem value='Jane Smith'>Jane Smith</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.approvalPerson && <p className='mt-1 text-red-500 text-xs'>{errors.approvalPerson.message}</p>}
                                </div>

                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='finalFlag'
                                        checked={watch('finalFlag')}
                                        onCheckedChange={(checked) => setValue('finalFlag', checked as boolean)}
                                    />
                                    <label htmlFor='finalFlag' className='font-medium text-gray-700 text-sm'>
                                        Final Flag
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex gap-4 pt-4'>
                            <Button type='submit' className='bg-blue-600 px-6 py-2 text-white hover:bg-blue-700'>
                                + ADD TO CART
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleClear} className='px-6 py-2'>
                                X CANCEL
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Grid View Section */}
                <div className='rounded-lg bg-white p-6 shadow-sm'>
                    <h2 className='mb-4 font-semibold text-gray-900 text-lg'>GRID VIEW</h2>

                    {/* General Search */}
                    <div className='mb-4'>
                        <div className='relative'>
                            <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400' />
                            <input
                                type='text'
                                placeholder='search here...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>

                    {/* Individual Column Search Fields */}
                    <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8'>
                        <input
                            type='text'
                            placeholder='search grade name...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search department ni...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search desgination na...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search group type na...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search leave type...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search email id...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search Sanctioned us...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                        <input
                            type='text'
                            placeholder='search Sanctioned on...'
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    {/* Data Table */}
                    <div className='overflow-x-auto'>
                        <GenericDataTable data={filteredData} columns={columns} totalItems={filteredData.length} isLoading={false} />
                    </div>
                </div>
            </div>
        </div>
    );
}
