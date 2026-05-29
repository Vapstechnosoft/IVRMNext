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
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    data: any[];
}

// Column header labels for print & excel
const printHeaders = [
    'SL. No.', 'House Name', 'Venue', 'Student Name', 'Adm. No.',
    'Class', 'Section', 'Event', 'Sports Name', 'Event Date',
];

// Accessor keys matching columns order
const printAccessors = [
    'slNo', 'spccmH_HouseName', 'spccmeV_EventVenue', 'amsT_Name', 'amsT_AdmNo',
    'asmcL_ClassName', 'asmC_SectionName', 'spccmE_EventName', 'spccmscC_SportsCCName', 'spccE_StartDate',
];

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch {
        return '-';
    }
}

function getCellValue(row: any, key: string, index: number): string {
    if (key === 'slNo') return String(index + 1);
    if (key === 'spccE_StartDate') return formatDate(row[key]);
    const val = row[key];
    return val !== null && val !== undefined ? String(val) : '-';
}

function buildPrintHtml(data: any[]): string {
    const rows = data.map((row, idx) => {
        const cells = printAccessors.map((key) => {
            const val = getCellValue(row, key, idx);
            return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${val}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const headerCells = printHeaders.map(h =>
        `<th style="border:1px solid #000;padding:6px 10px;background:#f3f4f6;text-align:center;font-weight:bold;">${h}</th>`
    ).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Venue Wise Participation Report</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; background: #fff; color: #000; }
                h2 { text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; }
                @media print {
                    body { margin: 10mm; }
                    @page { size: A4 landscape; margin: 10mm; }
                }
            </style>
        </head>
        <body>
            <h2>Venue Wise Participation Report</h2>
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rows.length > 0 ? rows : '<tr><td colspan="' + printHeaders.length + '" style="text-align:center;padding:20px;">No Records Found</td></tr>'}</tbody>
            </table>
        </body>
        </html>
    `;
}

export const ReportGrid = ({ data }: ReportGridProps) => {

    const handlePrint = () => {
        const html = buildPrintHtml(data);

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render before printing
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const exportToExcel = () => {
        const excelData = data.map((row, index) => ({
            'SL. No.': index + 1,
            'House Name': row.spccmH_HouseName || '-',
            'Venue': row.spccmeV_EventVenue || '-',
            'Student Name': row.amsT_Name || '-',
            'Adm. No.': row.amsT_AdmNo || '-',
            'Class': row.asmcL_ClassName || '-',
            'Section': row.asmC_SectionName || '-',
            'Event': row.spccmE_EventName || '-',
            'Sports Name': row.spccmscC_SportsCCName || '-',
            'Event Date': formatDate(row.spccE_StartDate),
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Venue Wise Report");
        XLSX.writeFile(workbook, "VenueWiseParticipationReport.xlsx");
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                        Total Records: <span className="rounded bg-primary/10 px-3 py-1 font-bold text-primary">{data.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="border-2 hover:bg-primary/5">
                            <Printer className="h-4 w-4 mr-2 text-primary" /> Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel} className="border-2 hover:bg-primary/5">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" /> Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white rounded-lg border shadow-sm">
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
                                <TableCell className="text-center">{row.spccmH_HouseName || '-'}</TableCell>
                                <TableCell className="text-center">{row.spccmeV_EventVenue || '-'}</TableCell>
                                <TableCell className="text-center">{row.amsT_Name || '-'}</TableCell>
                                <TableCell className="text-center">{row.amsT_AdmNo || '-'}</TableCell>
                                <TableCell className="text-center">{row.asmcL_ClassName || '-'}</TableCell>
                                <TableCell className="text-center">{row.asmC_SectionName || '-'}</TableCell>
                                <TableCell className="text-center">{row.spccmE_EventName || '-'}</TableCell>
                                <TableCell className="text-center">{row.spccmscC_SportsCCName || '-'}</TableCell>
                                <TableCell className="text-center">{formatDate(row.spccE_StartDate)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
