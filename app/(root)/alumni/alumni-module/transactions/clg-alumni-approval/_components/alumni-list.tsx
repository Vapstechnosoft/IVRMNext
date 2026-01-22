'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IClgAlumniApprovalDetails } from '@/types/alumni/clg-alumni-approval';
import { Search, Users, X } from 'lucide-react';
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

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between px-2'>
                <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-primary' />
                    <p className='text-muted-foreground text-sm'>
                        Total Pending Alumni: <span className='font-bold text-foreground'>{data.length}</span>
                    </p>
                </div>
            </div>

            <ScrollArea className='h-[400px] rounded-md border'>
                <Table>
                    <TableHeader className='sticky top-0 z-10 bg-muted/50'>
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
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow key={item.alcsreG_Id} className={selectedId === item.alcsreG_Id ? 'bg-primary/5' : ''}>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={selectedId === item.alcsreG_Id}
                                            onCheckedChange={() => handleCheckboxChange(item.alcsreG_Id)}
                                        />
                                    </TableCell>
                                    <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                    <TableCell className='font-semibold'>{item.alcsreG_MemberName}</TableCell>
                                    <TableCell className='text-center'>{item.a_year}</TableCell>
                                    <TableCell className='text-center'>{item.l_year}</TableCell>
                                    <TableCell>{item.admit_course}</TableCell>
                                    <TableCell>{item.left_course}</TableCell>
                                    <TableCell>{item.admit_branch}</TableCell>
                                    <TableCell>{item.left_branch}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-4'>
                <Button onClick={() => selectedId && onSearch(selectedId)} disabled={!selectedId} className='min-w-[120px]'>
                    <Search className='mr-2 h-4 w-4' />
                    Search Match
                </Button>
                <Button variant='destructive' onClick={onCancel} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
