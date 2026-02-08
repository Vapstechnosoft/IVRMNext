'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { GridDetailDTO } from "@/types/super-admin/configuration-setting/master-menu-page-mapping-institutionwise";
import { Search, Trash2, X } from "lucide-react";

interface DeleteMappingGridProps {
    data: GridDetailDTO[];
    onDelete: (data: GridDetailDTO[]) => void;
    onCancel: () => void;
}

export default function DeleteMappingGrid({
    data,
    onDelete,
    onCancel
}: DeleteMappingGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState<GridDetailDTO[]>(data);

    useEffect(() => {
        const filtered = data.filter(item =>
            item.pagename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.submenuname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.modulename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mI_Name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchQuery, data]);

    if (data.length === 0) return null;

    return (
        <div className="space-y-4 pt-6 mt-6 border-t-2 border-red-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-bold text-red-600">Deleting Saved Pages</h3>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="search here.."
                        className="pl-8 border-red-200 focus-visible:ring-red-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-red-200 shadow-sm overflow-hidden bg-red-50/10">
                <Table>
                    <TableHeader className="bg-red-50 font-bold">
                        <TableRow>
                            <TableHead className="w-16 text-center text-red-700 font-bold border-red-200">SL.NO</TableHead>
                            <TableHead className="text-red-700 font-bold border-red-200">Institution Name</TableHead>
                            <TableHead className="text-red-700 font-bold border-red-200">Sub Menu Name</TableHead>
                            <TableHead className="text-red-700 font-bold border-red-200">Module Name</TableHead>
                            <TableHead className="text-red-700 font-bold border-red-200">Page Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item, index) => (
                            <TableRow key={item.ivrmmmpmI_Id} className="border-red-100 hover:bg-red-50/50">
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell>{item.mI_Name}</TableCell>
                                <TableCell>{item.submenuname}</TableCell>
                                <TableCell>{item.modulename}</TableCell>
                                <TableCell>{item.pagename}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-red-100 mt-6">
                <Button
                    onClick={() => onDelete(data)}
                    variant="destructive"
                    className="flex items-center gap-2 px-8 shadow-md"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-8 border-slate-300 hover:bg-slate-100"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
