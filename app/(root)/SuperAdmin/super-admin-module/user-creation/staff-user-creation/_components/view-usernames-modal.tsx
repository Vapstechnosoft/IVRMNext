'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EmployeeListDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface ViewUsernamesModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: EmployeeListDTO[];
    roleName?: string;
}

export default function ViewUsernamesModal({ isOpen, onClose, users, roleName }: ViewUsernamesModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const isAdmin = roleName?.toUpperCase() === 'ADMIN' || roleName?.toUpperCase() === 'SUPER ADMIN';

    const filteredUsers = users.filter(
        (user) =>
            (user.stafname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.hrmE_EmployeeCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.user_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.intname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.mI_Name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-3xl flex-col overflow-hidden p-0'>
                <DialogHeader className='border-b bg-blue-50 p-6'>
                    <DialogTitle className='font-bold text-blue-900 text-xl'>
                        {isAdmin ? 'Admin List With Usernames' : 'Employee List With Usernames'}
                    </DialogTitle>
                    <p className='mt-1 text-blue-700 text-sm uppercase'>
                        NOTE: EXISTING USERNAMES FOR <b>{roleName || 'SELECTED ROLE'}</b>
                    </p>
                </DialogHeader>

                <div className='flex items-center gap-4 border-b bg-gray-50 p-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-gray-400' />
                        <Input
                            placeholder={isAdmin ? 'Search by institution or username...' : 'Search by name, code, or username...'}
                            className='pl-10'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className='flex-1'>
                    <Table>
                        <TableHeader className='sticky top-0 z-10 bg-gray-100'>
                            <TableRow>
                                <TableHead className='w-[80px] text-center'>SL.NO.</TableHead>
                                {isAdmin ? (
                                    <>
                                        <TableHead>Institute Name</TableHead>
                                        <TableHead>User Name</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead className='text-center'>Employee Code</TableHead>
                                        <TableHead>User Name</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <TableRow key={index} className='transition-colors hover:bg-blue-50/30'>
                                        <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                        {isAdmin ? (
                                            <>
                                                <TableCell>{user.intname || user.mI_Name || '------'}</TableCell>
                                                <TableCell className='font-semibold text-blue-700'>{user.user_Name}</TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>{user.stafname || '------'}</TableCell>
                                                <TableCell className='text-center'>{user.hrmE_EmployeeCode || '------'}</TableCell>
                                                <TableCell className='font-semibold text-blue-700'>{user.user_Name}</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 3 : 4} className='h-24 text-center text-gray-500 italic'>
                                        No users found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>

                <div className='flex justify-end border-t bg-gray-50 p-4'>
                    <Button onClick={onClose} className='px-6'>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
