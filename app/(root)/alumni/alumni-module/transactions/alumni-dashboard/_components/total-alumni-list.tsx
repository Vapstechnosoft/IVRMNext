'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import type { IAlumniList } from '@/types/alumni/alumni-dashboard';

interface TotalAlumniListProps {
    alumni: IAlumniList[];
    totalCount: number;
}

export default function TotalAlumniList({ alumni, totalCount }: TotalAlumniListProps) {
    const [search, setSearch] = useState('');

    const filteredAlumni = alumni.filter(a =>
        a.Name?.toLowerCase().includes(search.toLowerCase()) ||
        a.ALMST_AdmNo?.toLowerCase().includes(search.toLowerCase()) ||
        a.ASMAY_Year?.toLowerCase().includes(search.toLowerCase()) ||
        a.classname?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card className='mt-8'>
            <CardHeader className='flex flex-row items-center justify-between border-b bg-success/5'>
                <div className='space-y-1'>
                    <CardTitle className='flex items-center text-xl'>
                        <Users className='mr-2 h-6 w-6 text-success' />
                        TOTAL ALUMNI LIST
                    </CardTitle>
                    <p className='text-sm text-muted-foreground'>
                        Showing <span className='font-bold text-success'>{totalCount}</span> registered alumni
                    </p>
                </div>
                <div className='relative w-72'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search alumni list...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='pl-8 bg-background'
                    />
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                    <table className='w-full border-collapse text-sm'>
                        <thead>
                            <tr className='border-b bg-muted/30 font-semibold'>
                                <th className='p-4 text-left'>SL.NO.</th>
                                <th className='p-4 text-left'>STUDENT NAME</th>
                                <th className='p-4 text-left'>ADMISSION NO.</th>
                                <th className='p-4 text-center'>YEAR</th>
                                <th className='p-4 text-left'>CLASS</th>
                                <th className='p-4 text-left'>MOBILE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlumni.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='p-12 text-center text-muted-foreground'>
                                        <div className='flex flex-col items-center justify-center opacity-40'>
                                            <Users className='mb-2 h-12 w-12' />
                                            <p>No alumni found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAlumni.map((a, idx) => (
                                    <tr key={idx} className='border-b transition-all hover:bg-success/5'>
                                        <td className='p-4 w-16 text-center'>{idx + 1}</td>
                                        <td className='p-4 font-medium text-blue-900'>{a.Name}</td>
                                        <td className='p-4'>{a.ALMST_AdmNo}</td>
                                        <td className='p-4 text-center'>{a.ASMAY_Year}</td>
                                        <td className='p-4'>{a.classname}</td>
                                        <td className='p-4 font-mono text-xs'>{a.ALMST_MobileNo}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
