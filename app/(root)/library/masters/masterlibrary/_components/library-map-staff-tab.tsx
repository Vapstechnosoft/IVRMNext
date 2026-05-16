'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { useMasterLibraryMapping } from '@/hooks/library/useMasterLibraryMapping';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ActionButtons } from '@/components/ui/form/action-buttons';

export function LibraryMapStaffTab() {
    const { libraries, isLoading: isLibLoading } = useMasterLibraryMapping();
    const [selectedLibrary, setSelectedLibrary] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');

    const handleSave = () => {
        if (!selectedLibrary || !selectedRole || !selectedUser) {
            toast.error('Please fill in all required fields');
            return;
        }
        toast.success('Staff mapping saved successfully! (Simulation)');
        handleCancel();
    };

    const handleCancel = () => {
        setSelectedLibrary('');
        setSelectedRole('');
        setSelectedUser('');
    };

    const tableProps = useDataTableProps({
        data: libraries.map((lib: any, index: number) => ({
            ...lib,
            slNo: index + 1,
            libraryName: lib.lmaL_LibraryName,
            userName: '---', // Placeholder
        }))
    });

    return (
        <div className='space-y-4'>
            <div className='mx-auto max-w-3xl'>
                <CollapsibleSection
                    title='MASTER LIBRARY'
                    defaultOpen
                    variant='outline'
                    size='md'
                    className='shadow-lg duration-300'
                >
                    <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right text-sm font-medium'>
                                    Library Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Library--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(libraries || []).map((lib: any) => (
                                                <SelectItem key={lib.lmaL_Id || `lib-${Math.random()}`} value={lib.lmaL_Id?.toString() || ''}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right text-sm font-medium'>
                                    User Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select User--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* User items */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right text-sm font-medium'>
                                    Role Type:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Role--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Role items */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-3 border-t pt-4 mt-4'>
                        <Button onClick={handleSave} className='bg-[#4251b1] hover:bg-[#35418e] h-8 px-6 text-xs'>
                            <Save className='mr-2 h-3.5 w-3.5' />
                            SAVE
                        </Button>
                        <Button onClick={handleCancel} variant='destructive' className='h-8 px-6 text-xs'>
                            <X className='mr-2 h-3.5 w-3.5' />
                            CANCEL
                        </Button>
                    </div>
                </CollapsibleSection>
            </div>

            <CollapsibleSection
                title='STAFF DETAILS'
                defaultOpen
                variant='default'
                size='lg'
                className='shadow-lg'
            >
                <GenericDataTable
                    {...tableProps}
                    isLoading={isLibLoading}
                    columns={[
                        { accessorKey: 'slNo', header: 'Sl.No.' },
                        { accessorKey: 'libraryName', header: 'Library Name' },
                        { accessorKey: 'userName', header: 'User Name' },
                        {
                            id: 'actions',
                            header: 'Action',
                            cell: ({ row }) => (
                                <ActionButtons
                                    rowData={row.original}
                                    buttons={{ toggle: true }}
                                    onToggle={(data) => toast.info(`Toggling status for ${data.libraryName}`)}
                                    toggleConditionKey='lmaL_ActiveFlag'
                                />
                            )
                        },
                    ]}
                    columnPinning={{ right: ['actions'] }}
                    noDataTitle='No Records Found'
                />
            </CollapsibleSection>
        </div>
    );
}
