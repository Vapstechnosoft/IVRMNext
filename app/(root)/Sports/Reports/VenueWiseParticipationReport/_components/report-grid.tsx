'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    data: any[];
}

export const ReportGrid = ({ data }: ReportGridProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'VenueWise_Participation_Report',
        pageStyle: `
          @page { size: portrait; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; }
          }
        `
    });

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, "VenueWiseParticipationReport.xlsx");
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePrint()} className="border-2 hover:bg-primary/5">
                    <Printer className="h-4 w-4 mr-2 text-primary" /> Print
                </Button>
                <Button variant="outline" size="sm" onClick={exportToExcel} className="border-2 hover:bg-primary/5">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" /> Excel
                </Button>
            </div>

            <div ref={componentRef} className="rounded-md border bg-white p-4">
                <div className="hidden print:block text-center mb-6">
                    <h2 className="text-2xl font-bold uppercase underline">Venue Wise Participation Report</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">SL. No.</TableHead>
                            <TableHead className="text-center">House Name</TableHead>
                            <TableHead className="text-center">Venue</TableHead>
                            <TableHead className="text-center">Student Name</TableHead>
                            <TableHead className="text-center">Adm. No.</TableHead>
                            <TableHead className="text-center">Class</TableHead>
                            <TableHead className="text-center">Section</TableHead>
                            <TableHead className="text-center">Event</TableHead>
                            <TableHead className="text-center">Sports Name</TableHead>
                            <TableHead className="text-center">Event Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell className="text-center">{row.spccmH_HouseName}</TableCell>
                                <TableCell className="text-center">{row.spccmeV_EventVenue}</TableCell>
                                <TableCell className="text-center">{row.amsT_Name}</TableCell>
                                <TableCell className="text-center">{row.amsT_AdmNo}</TableCell>
                                <TableCell className="text-center">{row.asmcL_ClassName}</TableCell>
                                <TableCell className="text-center">{row.asmC_SectionName}</TableCell>
                                <TableCell className="text-center">{row.spccmE_EventName}</TableCell>
                                <TableCell className="text-center">{row.spccmscc_SportsCCName}</TableCell>
                                <TableCell className="text-center">{row.spccE_StartDate ? new Date(row.spccE_StartDate).toLocaleDateString() : ''}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
