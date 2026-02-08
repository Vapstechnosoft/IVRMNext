'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { MasterPageDTO } from "@/types/super-admin/configuration-setting/master-menu-page-mapping-institutionwise";
import { Search, Loader2 } from "lucide-react";

interface MasterPagesGridProps {
    data: MasterPageDTO[];
    onToggleRow: (row: MasterPageDTO) => void;
    onDisplayNameChange: (row: MasterPageDTO, displayName: string) => void;
    isLoading?: boolean;
}

export default function MasterPagesGrid({
    data,
    onToggleRow,
    onDisplayNameChange,
    isLoading
}: MasterPagesGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState<MasterPageDTO[]>(data);

    useEffect(() => {
        const filtered = data.filter(item =>
            item.pagename.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchQuery, data]);

    return (
        <div className="space-y-4 pt-6 mt-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-bold text-primary">Master Pages</h3>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="search here..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border shadow-sm overflow-hidden relative min-h-[150px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                )}
                <Table>
                    <TableHeader className="bg-slate-50 font-bold">
                        <TableRow>
                            <TableHead className="w-16 text-center text-primary font-bold">SL.NO</TableHead>
                            <TableHead className="text-primary font-bold">Page Name</TableHead>
                            <TableHead className="text-primary font-bold">Display Name</TableHead>
                            <TableHead className="w-20 text-center text-primary font-bold">Select</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <TableRow key={item.ivrmP_Id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.pagename}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={item.displayname || ""}
                                            onChange={(e) => onDisplayNameChange(item, e.target.value)}
                                            placeholder="Enter Display Name"
                                            className="h-8 max-w-[250px]"
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={!!item.checked}
                                            onCheckedChange={() => onToggleRow(item)}
                                            title="Add Cart"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground italic">
                                    {isLoading ? "Fetching pages..." : "No pages found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
