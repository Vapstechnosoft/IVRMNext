'use client';

import { useState } from 'react';
import { Search, Edit, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function StaffRequestList({
    data,
    onEdit,
    onToggle
}: {
    data: any[],
    onEdit: (data: any) => void,
    onToggle: (data: any) => void
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item => 
        item.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.HRMD_DepartmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="shadow-md border-t-4 border-t-[#4255a7]">
            <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-[#4255a7] text-sm font-bold uppercase">HOSTEL STAFF REQUEST DETAILS</CardTitle>
                <Minus className="h-4 w-4 text-gray-400 cursor-pointer" />
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-700">Total Grid Records :</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-[#4255a7]">
                            {filteredData.length}
                        </span>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="search here..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-9 rounded-full border-blue-200 focus:border-[#4255a7] transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-100 shadow-sm">
                    <Table>
                        <TableHeader className="bg-[#4255a7] hover:bg-[#4255a7]">
                            <TableRow className="hover:bg-transparent border-none h-10">
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">SL.No.</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Staff Name</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Department</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Designation</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Emp code</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Hostel</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Room Category</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">AC</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Mess Type</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Request Date</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Remarks</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-white text-[11px] font-bold uppercase whitespace-nowrap text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                                        <TableCell className="py-2.5 text-xs font-medium text-gray-600">{index + 1}</TableCell>
                                        <TableCell className="py-2.5 text-xs font-semibold text-blue-900">{item.empName}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{item.HRMD_DepartmentName}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{item.HRMDES_DesignationName}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{item.HRME_EmployeeCode}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{item.hlmH_Name}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{item.hlmrcA_RoomCategory}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{item.HLHSTREQ_ACRoomFlg ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">
                                            {item.HLHSTREQ_VegMessFlg ? 'Veg' : ''}
                                            {item.HLHSTREQ_VegMessFlg && item.HLHSTREQ_NonVegMessFlg ? ' / ' : ''}
                                            {item.HLHSTREQ_NonVegMessFlg ? 'Non-Veg' : ''}
                                        </TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600">{format(new Date(item.HLHSTREQ_RequestDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="py-2.5 text-xs text-gray-600 max-w-[150px] truncate">{item.HLHSTREQ_Remarks || '-'}</TableCell>
                                        <TableCell className="py-2.5 text-xs">
                                            <span 
                                                onClick={() => onToggle(item)}
                                                className={cn(
                                                    "cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    item.HLHSTREQ_ActiveFlg ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                                )}
                                            >
                                                {item.HLHSTREQ_ActiveFlg ? 'Active' : 'Deactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-center">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => onEdit(item)}
                                                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <span className="text-gray-400 font-medium">Record Not Found!</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
