'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IClgAlumniApprovalDetails } from '@/types/alumni/clg-alumni-approval';
import { Calendar, GraduationCap, Search, Users, X } from 'lucide-react';
import { useState } from 'react';

interface AlumniListProps {
    data: IClgAlumniApprovalDetails[];
    onSearch: (id: number) => void;
    onCancel: () => void;
}

export default function AlumniList({ data, onSearch, onCancel }: AlumniListProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleCheckboxChange = (id: number) => {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    };

    const selectedAlumni = data.find((item) => item.alcsreG_Id === selectedId);

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-primary/10 p-2'>
                        <Users className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                        <h3 className='font-bold text-gray-800'>Pending Verification Requests</h3>
                        <p className='text-muted-foreground text-sm'>
                            Total: <span className='font-bold text-primary'>{data.length}</span> alumni awaiting approval
                        </p>
                    </div>
                </div>

                {selectedAlumni && (
                    <div className='rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3'>
                        <div className='flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                                <span className='font-bold text-blue-600'>✓</span>
                            </div>
                            <div>
                                <p className='font-medium text-blue-800 text-sm'>Selected: {selectedAlumni.alcsreG_MemberName}</p>
                                <p className='text-blue-600 text-xs'>{selectedAlumni.admit_course}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ScrollArea className='h-[400px] rounded-lg border'>
                <Table>
                    <TableHeader className='sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-blue-50'>
                        <TableRow>
                            <TableHead className='w-[50px] text-center'>Select</TableHead>
                            <TableHead className='w-[60px] text-center'>SLNO</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className='text-center'>Year Admitted</TableHead>
                            <TableHead className='text-center'>Year Left</TableHead>
                            <TableHead>Course Admitted</TableHead>
                            <TableHead>Course Left</TableHead>
                            <TableHead>Branch Admitted</TableHead>
                            <TableHead>Branch Left</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className='h-24 text-center'>
                                    <div className='flex flex-col items-center justify-center gap-3 py-8'>
                                        <div className='rounded-full bg-green-50 p-4'>
                                            <Users className='h-10 w-10 text-green-500' />
                                        </div>
                                        <div>
                                            <h4 className='font-bold text-gray-700'>All Caught Up!</h4>
                                            <p className='text-muted-foreground text-sm'>No pending alumni verification requests.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow
                                    key={item.alcsreG_Id}
                                    className={`transition-all hover:bg-gray-50 ${selectedId === item.alcsreG_Id ? 'border-primary border-l-4 bg-gradient-to-r from-blue-50 to-purple-50' : ''}`}
                                    onClick={() => handleCheckboxChange(item.alcsreG_Id)}>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={selectedId === item.alcsreG_Id}
                                            onCheckedChange={() => handleCheckboxChange(item.alcsreG_Id)}
                                            className='data-[state=checked]:bg-primary'
                                        />
                                    </TableCell>
                                    <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                    <TableCell className='font-semibold'>
                                        <div className='flex items-center gap-2'>
                                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                                                <span className='font-bold text-primary text-xs'>{item.alcsreG_MemberName.charAt(0)}</span>
                                            </div>
                                            {item.alcsreG_MemberName}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <Calendar className='h-3 w-3 text-blue-500' />
                                            {item.a_year}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <Calendar className='h-3 w-3 text-green-500' />
                                            {item.l_year}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            <GraduationCap className='h-3 w-3 text-blue-600' />
                                            <span className='max-w-[150px] truncate'>{item.admit_course}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            <GraduationCap className='h-3 w-3 text-green-600' />
                                            <span className='max-w-[150px] truncate'>{item.left_course}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className='rounded-full bg-blue-100 px-2 py-1 text-blue-700 text-xs'>
                                            {item.admit_branch}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className='rounded-full bg-green-100 px-2 py-1 text-green-700 text-xs'>
                                            {item.left_branch}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-6'>
                <Button
                    onClick={() => selectedId && onSearch(selectedId)}
                    disabled={!selectedId}
                    className='h-12 min-w-[160px] bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700'
                    size='lg'>
                    <Search className='mr-2 h-5 w-5' />
                    Search Matching Records
                </Button>
                <Button variant='outline' onClick={onCancel} className='h-12 min-w-[120px]' size='lg'>
                    <X className='mr-2 h-5 w-5' />
                    Clear Selection
                </Button>
            </div>
        </div>
    );
}
