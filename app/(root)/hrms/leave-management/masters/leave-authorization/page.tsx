'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { createLocalCrud } from '@/lib/localdb';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLeaveAuthorizationColumns, type LeaveAuthorization } from './_components/columns';
import { LeaveAuthorizationForm } from './_components/leave-authorization-form';

const leaveAuthDB = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

export default function LeaveAuthorizationPage() {
    const [data, setData] = useState<LeaveAuthorization[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAuth, setEditingAuth] = useState<LeaveAuthorization | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<LeaveAuthorization[]>([]);

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

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAuth(null);
    };

    const handleFormSubmit = (formData: LeaveAuthorization) => {
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

    const columns = useMemo(() => getLeaveAuthorizationColumns({ onEdit: handleEdit, onDelete: handleDelete }), [handleEdit, handleDelete]);

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
                        <div className='flex items-center justify-between'>
                            <div className='flex space-x-8'>
                                <button type='button' className='border-red-500 border-b-2 px-1 py-2 font-medium text-red-600 text-sm'>
                                    LEAVE AUTHORIZATION
                                </button>
                            </div>
                            {!isFormOpen && (
                                <Button onClick={() => setIsFormOpen(true)} className='bg-blue-600 hover:bg-blue-700'>
                                    Add Leave Authorization
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                {isFormOpen && (
                    <div id='leave-auth-form' className='rounded-lg bg-white p-6 shadow-sm'>
                        <h2 className='mb-4 font-semibold text-gray-900 text-lg'>
                            {editingAuth ? 'Edit Leave Authorization' : 'Add Leave Authorization'}
                        </h2>
                        <LeaveAuthorizationForm
                            editingLeaveAuthorization={editingAuth}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormClose}
                        />
                    </div>
                )}

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
