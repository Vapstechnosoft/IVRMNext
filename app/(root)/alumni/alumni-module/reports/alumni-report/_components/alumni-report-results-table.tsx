'use client';

import { IAlumniReportResultItem } from "@/types/alumni/alumni-report";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface AlumniReportResultsTableProps {
    data: IAlumniReportResultItem[];
    showEmail: boolean;
    showPhone: boolean;
    onPrint: (selected: IAlumniReportResultItem[]) => void;
    onPrintAddressBook: (selected: IAlumniReportResultItem[]) => void;
    isReportView: boolean;
}

export function AlumniReportResultsTable({
    data,
    showEmail,
    showPhone,
    onPrint,
    onPrintAddressBook,
    isReportView
}: AlumniReportResultsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredData.map(item => item.almst_Id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelectRow = (id: number, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const getSelectedRecords = () => {
        return data.filter(item => selectedIds.has(item.almst_Id));
    };

    const exportToExcel = () => {
        const selectedRecords = getSelectedRecords();
        if (selectedRecords.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(selectedRecords);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni Report");
        XLSX.writeFile(workbook, "Alumni_Report.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium">
                        Total Records: <span className="text-primary">{data.length}</span>
                    </div>
                    {searchTerm && (
                        <div className="text-sm font-medium">
                            Filtered: <span className="text-primary">{filteredData.length}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search result..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToExcel}
                        disabled={selectedIds.size === 0}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    {isReportView ? (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onPrint(getSelectedRecords())}
                            disabled={selectedIds.size === 0}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onPrintAddressBook(getSelectedRecords())}
                            disabled={selectedIds.size === 0}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Address Book
                        </Button>
                    )}
                </div>
            </div>

            <div className="border rounded-md overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-12">SL NO</TableHead>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="min-w-[150px]">Alumni Name</TableHead>
                            <TableHead>DOB</TableHead>
                            <TableHead className="min-w-[150px]">Father Name</TableHead>
                            {showPhone && <TableHead>Mobile No</TableHead>}
                            {showEmail && <TableHead>Email Id</TableHead>}
                            <TableHead>Joined Year</TableHead>
                            <TableHead>Left Year</TableHead>
                            <TableHead>Joined Class</TableHead>
                            <TableHead>Left Class</TableHead>
                            <TableHead>Member Id</TableHead>
                            <TableHead>Member Category</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Blood Group</TableHead>
                            <TableHead>Profession</TableHead>
                            <TableHead>City:State</TableHead>
                            <TableHead className="min-w-[200px]">Full Address</TableHead>
                            <TableHead>Pin Code</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item, index) => (
                            <TableRow key={item.almst_Id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(item.almst_Id)}
                                        onCheckedChange={(checked) => toggleSelectRow(item.almst_Id, !!checked)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{item.amsT_FirstName}</TableCell>
                                <TableCell>{item.amsT_DOB ? format(new Date(item.amsT_DOB), "dd/MM/yyyy") : "-"}</TableCell>
                                <TableCell>{item.ALMST_FatherName}</TableCell>
                                {showPhone && <TableCell>{item.amsT_MobileNo}</TableCell>}
                                {showEmail && <TableCell>{item.amsT_emailId}</TableCell>}
                                <TableCell>{item.ASMAY_Id_Join}</TableCell>
                                <TableCell>{item.ASMAY_Id_Left}</TableCell>
                                <TableCell>{item.JoinClass}</TableCell>
                                <TableCell>{item.LeftClass}</TableCell>
                                <TableCell>{item.ALMST_MembershipId}</TableCell>
                                <TableCell>{item.ALMMC_MembershipCategory}</TableCell>
                                <TableCell>{item.IVRMMD_Name}</TableCell>
                                <TableCell>{item.amsT_BloodGroup}</TableCell>
                                <TableCell>{item.ALSPR_Designation}</TableCell>
                                <TableCell>{item.city}</TableCell>
                                <TableCell className="max-w-xs truncate" title={item.ALMST_FullAddess}>
                                    {item.ALMST_FullAddess}
                                </TableCell>
                                <TableCell>{item.ALMST_ConPincode || item.ALMST_PerPincode || "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
