'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Save, X } from "lucide-react";
import { MasterPageDTO } from "@/types/super-admin/configuration-setting/master-menu-page-mapping-institutionwise";

interface SelectedMasterPagesGridProps {
    data: MasterPageDTO[];
    onRemove: (row: MasterPageDTO) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaveDisabled?: boolean;
}

export default function SelectedMasterPagesGrid({
    data,
    onRemove,
    onSave,
    onCancel,
    isSaveDisabled
}: SelectedMasterPagesGridProps) {
    if (data.length === 0) return null;

    return (
        <div className="space-y-6 pt-6 mt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Selected Master Pages</h3>
            </div>

            <div className="rounded-md border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 font-bold">
                        <TableRow>
                            <TableHead className="w-16 text-center text-primary font-bold">SL.NO</TableHead>
                            <TableHead className="text-primary font-bold">Page Name</TableHead>
                            <TableHead className="text-primary font-bold">Display Name</TableHead>
                            <TableHead className="w-20 text-center text-primary font-bold">Remove</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={item.ivrmP_Id}>
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.pagename}</TableCell>
                                <TableCell>{item.displayname}</TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => onRemove(item)}
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center gap-4 pt-4">
                <Button
                    onClick={onSave}
                    disabled={isSaveDisabled}
                    className="flex items-center gap-2 px-8"
                >
                    <Save className="h-4 w-4" />
                    Save
                </Button>
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-8"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
