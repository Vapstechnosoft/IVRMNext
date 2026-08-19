'use client';

import { useState } from 'react';
import { Printer, FileSpreadsheet, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import {
    ISportHouseReportPointsResponse,
    ISportHouseReportPointsItem,
    IHouseTotalItem,
    IOverallCountItem,
    IHouseHeader
} from '@/types/sports/reports/sport-house-report-points';

interface ReportGridProps {
    data: ISportHouseReportPointsResponse;
    yearName?: string;
    isLoading?: boolean;
}

export default function ReportGrid({ data, yearName = "2026-2027", isLoading }: ReportGridProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const viewlist = data.viewlist || [];
    const houseTotal = data.houseTotal || [];
    const overallCount = data.overallCount || [];

    // Extract house list from response or default to static specified house names
    const houseHeaders: IHouseHeader[] = data.houseList && data.houseList.length > 0
        ? data.houseList
        : [
            { spccmH_Id: 101, SPCCMH_HouseName: "House 1 test" },
            { spccmH_Id: 102, SPCCMH_HouseName: "House 002" },
            { spccmH_Id: 103, SPCCMH_HouseName: "House 03" },
            { spccmH_Id: 104, SPCCMH_HouseName: "new133" },
            { spccmH_Id: 105, SPCCMH_HouseName: "RCB HOME one" }
        ];

    // Housewise keys array: each house has 2 sub-columns (HouseName and HouseName_Points)
    const housewiseKeys: { key: string; label: string; isPoints: boolean }[] = [];
    houseHeaders.forEach((h) => {
        housewiseKeys.push({
            key: h.SPCCMH_HouseName,
            label: 'Count',
            isPoints: false
        });
        housewiseKeys.push({
            key: `${h.SPCCMH_HouseName}_Points`,
            label: 'Points',
            isPoints: true
        });
    });

    // Filter viewlist by searchQuery
    const filteredList = viewlist.filter((item) => {
        if (!searchQuery) return true;
        const className = `${item.ASMCL_ClassName || ''} ${item.ASMC_SectionName || ''}`.toLowerCase();
        return className.includes(searchQuery.toLowerCase());
    });

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        const houseHeadersHtml = houseHeaders.map(h => 
            `<th colspan="2" style="border:1px solid #000;padding:6px;background:#f3f4f6;text-align:center;font-weight:bold;">${h.SPCCMH_HouseName}</th>`
        ).join('');

        const subHeadersHtml = housewiseKeys.map(k =>
            `<th style="border:1px solid #000;padding:4px;background:#e5e7eb;text-align:center;font-size:9px;">${k.isPoints ? 'Points' : 'Count'}</th>`
        ).join('');

        const rowsHtml = filteredList.map(item => {
            const cells = housewiseKeys.map(k => {
                const val = item[k.key] !== undefined ? item[k.key] : '-';
                return `<td style="border:1px solid #000;padding:5px;text-align:center;">${val}</td>`;
            }).join('');
            return `<tr><td style="border:1px solid #000;padding:5px;font-weight:600;">${item.ASMCL_ClassName} ${item.ASMC_SectionName}</td>${cells}</tr>`;
        }).join('');

        // Totals row
        let totalsHtml = '';
        if (houseTotal.length > 0) {
            const totObj = houseTotal[0];
            const cells = housewiseKeys.map(k => {
                const val = totObj[k.key] !== undefined ? totObj[k.key] : '-';
                return `<td style="border:1px solid #000;padding:5px;text-align:center;font-weight:bold;background:#f9fafb;">${val}</td>`;
            }).join('');
            totalsHtml = `<tr style="font-weight:bold;"><td style="border:1px solid #000;padding:5px;font-weight:bold;background:#f9fafb;">Total</td>${cells}</tr>`;
        }

        // Overall count row
        let overallHtml = '';
        if (overallCount.length > 0) {
            const cntObj = overallCount[0];
            const cells = housewiseKeys.map(k => {
                const val = cntObj[k.key] !== undefined ? cntObj[k.key] : '-';
                return `<td style="border:1px solid #000;padding:5px;text-align:center;font-weight:bold;background:#f3f4f6;">${val}</td>`;
            }).join('');
            overallHtml = `<tr style="font-weight:bold;"><td style="border:1px solid #000;padding:5px;font-weight:bold;background:#f3f4f6;">Avg / Overall</td>${cells}</tr>`;
        }

        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8"/>
                <title>House Points ${yearName}</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #000; }
                    h3 { text-align: center; margin-bottom: 5px; text-transform: uppercase; }
                    h4 { text-align: center; margin-top: 0; font-weight: normal; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    @media print {
                        body { margin: 8mm; }
                        @page { size: A4 landscape; margin: 8mm; }
                    }
                </style>
            </head>
            <body>
                <h3>House Report</h3>
                <h4>House Points ${yearName}</h4>
                <table>
                    <thead>
                        <tr>
                            <th rowspan="2" style="border:1px solid #000;padding:6px;background:#f3f4f6;text-align:center;">Class Name</th>
                            ${houseHeadersHtml}
                        </tr>
                        <tr>
                            ${subHeadersHtml}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        ${totalsHtml}
                        ${overallHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const exportToExcel = () => {
        const excelRows = filteredList.map(item => {
            const rowObj: Record<string, any> = {
                'Class Name': `${item.ASMCL_ClassName} ${item.ASMC_SectionName}`
            };
            housewiseKeys.forEach(k => {
                rowObj[k.key] = item[k.key] ?? '-';
            });
            return rowObj;
        });

        if (houseTotal.length > 0) {
            const totObj: Record<string, any> = { 'Class Name': 'Total' };
            housewiseKeys.forEach(k => {
                totObj[k.key] = houseTotal[0][k.key] ?? '-';
            });
            excelRows.push(totObj);
        }

        if (overallCount.length > 0) {
            const avgObj: Record<string, any> = { 'Class Name': 'Avg / Overall' };
            housewiseKeys.forEach(k => {
                avgObj[k.key] = overallCount[0][k.key] ?? '-';
            });
            excelRows.push(avgObj);
        }

        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "House Points Report");
        XLSX.writeFile(workbook, `SportHouseReportPoints_${yearName}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="text-sm font-medium">
                        Total Grid Records: <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold">{filteredList.length}</span>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by class..."
                            className="pl-8 h-9 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="outline" size="sm" onClick={handlePrint} className="border-2 hover:bg-primary/5">
                        <Printer className="h-4 w-4 mr-2 text-primary" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToExcel} className="border-2 hover:bg-primary/5">
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                        Excel
                    </Button>
                </div>
            </div>

            {/* Grid Container */}
            <div className="bg-white p-6 rounded-lg shadow-sm border" id="printSectionId">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold uppercase underline text-primary tracking-wide">
                        House Points {yearName}
                    </h2>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted/60 border-b">
                                <th className="border p-3 text-left font-bold text-slate-800" rowSpan={2}>
                                    Class Name
                                </th>
                                {houseHeaders.map((user) => (
                                    <th
                                        key={user.spccmH_Id}
                                        colSpan={2}
                                        className="border p-2.5 text-center font-bold bg-primary/10 text-primary"
                                    >
                                        {user.SPCCMH_HouseName}
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-muted/40 border-b text-xs text-muted-foreground">
                                {housewiseKeys.map((k, idx) => (
                                    <th key={idx} className="border p-1.5 text-center font-semibold">
                                        {k.isPoints ? 'Points' : 'Count'}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={1 + housewiseKeys.length} className="text-center p-8 text-muted-foreground">
                                        Loading report records...
                                    </td>
                                </tr>
                            ) : filteredList.length > 0 ? (
                                filteredList.map((opt, idx) => (
                                    <tr key={idx} className="border-b hover:bg-muted/20 transition-colors">
                                        <td className="border p-2.5 font-medium whitespace-nowrap">
                                            {opt.ASMCL_ClassName} {opt.ASMC_SectionName}
                                        </td>
                                        {housewiseKeys.map((k, colIdx) => (
                                            <td key={colIdx} className="border p-2.5 text-center">
                                                {opt[k.key] !== undefined ? opt[k.key] : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={1 + housewiseKeys.length} className="text-center p-8 text-muted-foreground">
                                        No Records Found
                                    </td>
                                </tr>
                            )}

                            {/* House Totals Row */}
                            {houseTotal.length > 0 && (
                                <tr className="border-b bg-primary/5 font-bold">
                                    <td className="border p-2.5 text-primary">
                                        Total
                                    </td>
                                    {housewiseKeys.map((k, colIdx) => (
                                        <td key={colIdx} className="border p-2.5 text-center text-primary font-semibold">
                                            {houseTotal[0][k.key] !== undefined ? houseTotal[0][k.key] : '-'}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            {/* Overall Count Row */}
                            {overallCount.length > 0 && (
                                <tr className="bg-slate-100/80 font-bold text-slate-700">
                                    <td className="border p-2.5">
                                        Average / Overall
                                    </td>
                                    {housewiseKeys.map((k, colIdx) => (
                                        <td key={colIdx} className="border p-2.5 text-center font-semibold">
                                            {overallCount[0][k.key] !== undefined ? overallCount[0][k.key] : '-'}
                                        </td>
                                    ))}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
