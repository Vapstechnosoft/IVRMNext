'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IStudentMatchDetails } from '@/types/alumni/clg-alumni-approval';
import { Check, GraduationCap, Hash, User, UserCheck, X } from 'lucide-react';
import { useState } from 'react';

interface StudentMatchListProps {
    data: IStudentMatchDetails[];
    onApprove: (alcsregId: number, alcmstId: number) => void;
    onCancel: () => void;
}

export default function StudentMatchList({ data, onApprove, onCancel }: StudentMatchListProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleCheckboxChange = (id: number) => {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    };

    const handleApprove = () => {
        const selectedStudent = data.find((s) => s.alcmsT_Id === selectedId);
        if (selectedStudent) {
            onApprove(selectedStudent.alcsreG_Id, selectedStudent.alcmsT_Id);
        }
    };

    const selectedStudent = data.find((s) => s.alcmsT_Id === selectedId);

    return (
        <div className='fade-in slide-in-from-top-4 animate-in space-y-6 duration-500'>
            <div className='rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-lg bg-green-100 p-2'>
                            <UserCheck className='h-5 w-5 text-green-600' />
                        </div>
                        <div>
                            <h3 className='font-bold text-green-800'>Matched Student Records</h3>
                            <p className='text-green-700 text-sm'>Select the correct student match for verification</p>
                        </div>
                    </div>
                    <div className='rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-xs'>
                        {data.length} match{data.length !== 1 ? 'es' : ''} found
                    </div>
                </div>
            </div>

            {selectedStudent && (
                <div className='rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                                <User className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                                <p className='font-bold text-blue-800'>Selected for Approval</p>
                                <p className='text-blue-700 text-sm'>
                                    {selectedStudent.membername} • {selectedStudent.alcmsT_AdmNo}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleApprove}
                            className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'>
                            <Check className='mr-2 h-4 w-4' />
                            Confirm Approval
                        </Button>
                    </div>
                </div>
            )}

            <ScrollArea className='h-[300px] rounded-lg border'>
                <Table>
                    <TableHeader className='sticky top-0 z-10 bg-gradient-to-r from-green-50 to-emerald-50'>
                        <TableRow>
                            <TableHead className='w-[50px] text-center'>Select</TableHead>
                            <TableHead className='w-[60px] text-center'>SLNO</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Admission No</TableHead>
                            <TableHead className='text-center'>Year Admitted</TableHead>
                            <TableHead>Course Admitted</TableHead>
                            <TableHead>Branch Admitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className='h-24 text-center'>
                                    <div className='flex flex-col items-center justify-center gap-3 py-8'>
                                        <div className='rounded-full bg-gray-100 p-4'>
                                            <User className='h-8 w-8 text-gray-400' />
                                        </div>
                                        <div>
                                            <h4 className='font-bold text-gray-700'>No Matches Found</h4>
                                            <p className='text-muted-foreground text-sm'>No matching student records were found.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow
                                    key={item.alcmsT_Id}
                                    className={`transition-all hover:bg-green-50/50 ${selectedId === item.alcmsT_Id ? 'border-green-500 border-l-4 bg-gradient-to-r from-green-50 to-emerald-50' : ''}`}
                                    onClick={() => handleCheckboxChange(item.alcmsT_Id)}>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={selectedId === item.alcmsT_Id}
                                            onCheckedChange={() => handleCheckboxChange(item.alcmsT_Id)}
                                            className='data-[state=checked]:bg-green-600'
                                        />
                                    </TableCell>
                                    <TableCell className='text-center font-medium'>
                                        <div className='mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                                            {index + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell className='font-semibold'>
                                        <div className='flex items-center gap-2'>
                                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                                                <User className='h-4 w-4 text-primary' />
                                            </div>
                                            <div>
                                                <div>{item.membername}</div>
                                                <div className='text-muted-foreground text-xs'>ID: {item.alcsreG_Id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            <Hash className='h-3 w-3 text-blue-500' />
                                            {item.alcmsT_AdmNo}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700 text-sm'>
                                            {item.yeardmitted}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            <GraduationCap className='h-3 w-3 text-purple-500' />
                                            <span className='max-w-[150px] truncate'>{item.courseadmitted}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className='rounded-full bg-purple-100 px-3 py-1 text-purple-700 text-xs'>
                                            {item.branchadmitted}
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
                    onClick={handleApprove}
                    disabled={!selectedId}
                    className='h-12 min-w-[160px] bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:from-green-700 hover:to-emerald-700'
                    size='lg'>
                    <Check className='mr-2 h-5 w-5' />
                    Confirm Approval
                </Button>
                <Button variant='outline' onClick={onCancel} className='h-12 min-w-[120px]' size='lg'>
                    <X className='mr-2 h-5 w-5' />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
