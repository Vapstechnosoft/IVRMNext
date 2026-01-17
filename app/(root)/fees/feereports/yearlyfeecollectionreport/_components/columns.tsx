'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IFeeYearlyCollectionReportRow } from '@/types/fees/reports/reports';
import type { ColumnDef, HeaderContext } from '@tanstack/react-table';

/* ======================================================


   COLUMN CONFIG (IMAGE MATCHING)
====================================================== */

export type BreakdownType = keyof typeof REPORT_COLUMN_MAP;

export const REPORT_COLUMN_MAP = {
    FGW: [
        { key: 'groupName', label: 'Group Name' },

        { key: 'paidAmount', label: 'Paid Amount', align: 'right', sum: true },
        { key: 'balance', label: 'Balance', align: 'right', sum: true },
        { key: 'concession', label: 'Concession', align: 'right', sum: true },
        { key: 'fine', label: 'Fine', align: 'right', sum: true },
        { key: 'rebate', label: 'Rebate', align: 'right', sum: true },
        { key: 'waivedOff', label: 'Waived Off', align: 'right', sum: true },
        { key: 'adjusted', label: 'Adjusted', align: 'right', sum: true },
        { key: 'excessPaid', label: 'Excess Paid', align: 'right', sum: true },
        { key: 'runningExcess', label: 'Running Excess', align: 'right', sum: true }
    ],

    INMW: [
        { key: 'studentName', label: 'Student Name' },
        { key: 'classSection', label: 'Class/Section' },
        { key: 'admissionNo', label: 'Admission No' },
        { key: 'installmentName', label: 'Installment name' },

        { key: 'totalPayable', label: 'Total Payable', align: 'right', sum: true },
        { key: 'paidAmount', label: 'Paid Amount', align: 'right', sum: true },
        { key: 'balance', label: 'Balance', align: 'right', sum: true },
        { key: 'concession', label: 'Concession', align: 'right', sum: true },
        { key: 'arrear', label: 'Arrear', align: 'right', sum: true },
        { key: 'excess', label: 'Excess', align: 'right', sum: true },
        { key: 'charge', label: 'Charge', align: 'right', sum: true },
        { key: 'adjustment', label: 'Adjustment', align: 'right', sum: true }
    ]
    //,

    //   INW: [
    //     { key: 'Head Name', label: 'Student Name' },
    //     { key: 'classSection', label: 'Class/Section' },
    //     { key: 'admissionNo', label: 'Admission No' },
    //     { key: 'installmentName', label: 'Installment name' }
    //   ]
} as const;

export const getDynamicColumns = (breakdown: BreakdownType): ColumnDef<FeeYearlyTableRow>[] => {
    const columnsConfig = REPORT_COLUMN_MAP[breakdown] ?? [];

    return [
        /* ================= SL NO ================= */
        {
            id: 'slno',
            header: () => <div className='text-center'>Sl No</div>,
            cell: ({ row, table }) => {
                if ('__isTotal' in row.original) {
                    return <div className='text-center font-bold'>—</div>;
                }

                const { pageIndex, pageSize } = table.getState().pagination;

                return <div className='text-center font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false,
            size: 60
        },

        /* ================= DATA COLUMNS ================= */
        ...columnsConfig.map(
            (col): ColumnDef<FeeYearlyTableRow> => ({
                accessorKey: col.key,
                enableSorting: false,
                header: ({ column }: HeaderContext<FeeYearlyTableRow, unknown>) => (
                    <DataTableColumnHeader column={column} title={col.label} />
                ),
                cell: ({ row }) => {
                    const value = row.getValue(col.key);
                    const isTotalRow = '__isTotal' in row.original;

                    if (value == null) return <span className='text-muted-foreground'>—</span>;

                    if (typeof value === 'number') {
                        return (
                            <div className={`text-right font-semibold ${isTotalRow ? 'text-primary' : ''}`}>{value.toLocaleString()}</div>
                        );
                    }

                    return <div className={`font-semibold ${isTotalRow ? 'text-primary' : ''}`}>{String(value)}</div>;
                }
            })
        )
    ];
};

const getExportConfig = (breakdown: BreakdownType) => {
    const cols = REPORT_COLUMN_MAP[breakdown];

    return {
        headers: cols.map((c) => c.label),
        keys: cols.map((c) => c.key)
    };
};

export function printTableDynamic(breakdown: BreakdownType, rows: any[], totalRow?: any) {
    const { headers, keys } = getExportConfig(breakdown);

    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const thead = headers.map((h) => `<th>${h}</th>`).join('');

    const tbody = rows.map((row) => `<tr>${keys.map((k) => `<td>${row[k] ?? ''}</td>`).join('')}</tr>`).join('');

    const totalHtml = totalRow
        ? `<tr style="font-weight:bold;background:#f3f3f3">
        ${keys.map((k) => `<td>${totalRow[k] ?? ''}</td>`).join('')}
      </tr>`
        : '';

    printWindow.document.write(`
    <html>
      <head>
        <title>Yearly Fee Collection</title>
        <style>
          body { font-family: Arial; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h3>Yearly Fee Collection Report</h3>
        <table>
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}${totalHtml}</tbody>
        </table>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.print();
}

import * as XLSX from 'xlsx';

export function exportToExcelDynamic(breakdown: BreakdownType, rows: any[], fileName: string) {
    const { headers, keys } = getExportConfig(breakdown);

    const excelData = rows.map((row) => {
        const obj: any = {};
        keys.forEach((k, i) => {
            obj[headers[i]] = row[k] ?? '';
        });
        return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export type FeeYearlyTableRow =
    | IFeeYearlyCollectionReportRow
    | (Partial<IFeeYearlyCollectionReportRow> & {
          __isTotal: true;
          studentName: 'TOTAL';
      });

type FieldMap = Record<string, (item: any) => any>;

export const REPORT_FIELD_MAP: Record<BreakdownType, FieldMap> = {
    FGW: {
        groupName: (i) => i.fmgG_GroupName ?? '',

        paidAmount: (i) => i.paid ?? 0,
        balance: (i) => i.balance ?? 0,
        concession: (i) => i.concession ?? 0,
        fine: (i) => i.fine ?? 0,
        rebate: (i) => i.rebate ?? 0,
        waivedOff: (i) => i.waived ?? 0,
        adjusted: (i) => i.adjusted ?? 0,
        excessPaid: (i) => i.excess ?? 0,
        runningExcess: (i) => i.runningExcess ?? 0
    },

    INMW: {
        studentName: (i) => i.studentName?.trim() ?? '',
        classSection: (i) => i.asmcL_ClassName ?? '',
        admissionNo: (i) => i.amsT_AdmNo ?? '',
        installmentName: (i) => i.ftI_Name ?? '',

        totalPayable: (i) => i.payable ?? 0,
        paidAmount: (i) => i.paid ?? 0,
        balance: (i) => i.balance ?? 0,
        concession: (i) => i.concession ?? 0,
        arrear: (i) => i.arrear ?? 0,
        excess: (i) => i.excess ?? 0,
        charge: (i) => i.charge ?? 0,
        adjustment: (i) => i.adjusted ?? 0
    }
};

export const mapYearlyCollectionReport = (list: any[], breakdown: BreakdownType): IFeeYearlyCollectionReportRow[] => {
    const fieldMap = REPORT_FIELD_MAP[breakdown];

    return list.map((item, index) => {
        const row: any = {
            slNo: index + 1
        };

        Object.keys(fieldMap).forEach((key) => {
            row[key] = fieldMap[key](item);
        });

        return row;
    });
};

const NUMERIC_COLUMNS = ['totalPayable', 'paidAmount', 'balance', 'concession', 'arrear', 'excess', 'charge', 'adjustment'];

export function createTotalRow(rows: IFeeYearlyCollectionReportRow[]): FeeYearlyTableRow {
    return {
        __isTotal: true,
        slNo: 0,
        studentName: 'TOTAL',
        classSection: '',
        admissionNo: '',
        installmentName: '',

        totalPayable: rows.reduce((s, r) => s + r.totalPayable, 0),
        paidAmount: rows.reduce((s, r) => s + r.paidAmount, 0),
        balance: rows.reduce((s, r) => s + r.balance, 0),
        concession: rows.reduce((s, r) => s + r.concession, 0),
        arrear: rows.reduce((s, r) => s + r.arrear, 0),
        excess: rows.reduce((s, r) => s + r.excess, 0),
        charge: rows.reduce((s, r) => s + r.charge, 0),
        adjustment: rows.reduce((s, r) => s + r.adjustment, 0)
    };
}
