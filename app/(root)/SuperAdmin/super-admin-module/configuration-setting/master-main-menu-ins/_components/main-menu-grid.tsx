'use client';

import { useState, useEffect } from 'react';
import { MasterMainMenuINSDTO } from '@/types/super-admin/configuration-setting/master-main-menu-ins';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Minus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, ArrowUpDown, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MainMenuGridProps {
    data: MasterMainMenuINSDTO[];
    onDelete: (item: MasterMainMenuINSDTO) => void;
    onOrder?: () => void;
    onClear?: () => void;
}

export default function MainMenuGrid({ data: initialData, onDelete, onOrder, onClear }: MainMenuGridProps) {
    const [data, setData] = useState<MasterMainMenuINSDTO[]>(initialData);
    const [isOpen, setIsOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Filtering
    const filteredData = data.filter((item) =>
        Object.values(item).some(
            (val) => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (key: keyof MasterMainMenuINSDTO) => {
        const sorted = [...data].sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });
        setData(sorted);
    };

    return (
        <div className="box box-primary mt-4 border rounded-md shadow-sm">
            <div className="box-header with-border p-3 border-b flex justify-between items-center bg-gray-50">
                <h3 className="box-title text-lg font-medium">Institute Main Menu List</h3>
                <div className="box-tools pull-right">
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="btn-box-tool">
                                <Minus className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                </div>
            </div>

            <Collapsible open={isOpen}>
                <CollapsibleContent>
                    <div className="box-body p-4">
                        {/* Search Bar */}
                        <div className="row mb-4 flex justify-end">
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <Input
                                            type="text"
                                            className="pl-10"
                                            placeholder="search here..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="table w-full text-sm text-left table-hover table-bordered border-collapse">
                                <thead className="bg-gray-100 text-center font-bold">
                                    <tr>
                                        <th className="p-2 border">SL.NO</th>
                                        <th className="p-2 border cursor-pointer text-blue-600" onClick={() => handleSort('mI_Name')}>
                                            Institution Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                        </th>
                                        <th className="p-2 border cursor-pointer text-blue-600" onClick={() => handleSort('modulename')}>
                                            Module Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                        </th>
                                        <th className="p-2 border cursor-pointer text-blue-600" onClick={() => handleSort('ivrmmmI_MenuName')}>
                                            Main Menu Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                        </th>
                                        <th className="p-2 border text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.ivrmmmI_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="p-2 border text-center">{startIndex + index + 1}</td>
                                            <td className="p-2 border text-center">{item.mI_Name}</td>
                                            <td className="p-2 border text-center">{item.modulename}</td>
                                            <td className="p-2 border text-center">{item.ivrmmmI_MenuName}</td>
                                            <td className="p-2 border text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => onDelete(item)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedData.length === 0 && (
                                        <tr><td colSpan={5} className="text-center p-4">No Data Found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4 mb-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Footer Buttons */}
                        {data.length > 0 && (
                            <div className="flex justify-center gap-4">
                                {onOrder && (
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onOrder}>
                                        Set order
                                    </Button>
                                )}
                                {onClear && (
                                    <Button variant="secondary" className="bg-red-500 hover:bg-red-600 text-white" onClick={onClear}>
                                        <X className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
