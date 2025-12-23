'use client';

import * as XLSX from 'xlsx';
export function printTable(columns: string[], rows: any[], sumRow?: any) {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const tableHead = columns.map((col) => `<th>${col}</th>`).join('');

    const tableRows = rows.map((row) => `<tr>${columns.map((col) => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`).join('');

    const totalRow = sumRow
        ? `<tr style="font-weight:bold;background:#f3f3f3">
            ${columns.map((col) => `<td>${sumRow[col] ?? ''}</td>`).join('')}
           </tr>`
        : '';

    printWindow.document.write(`
        <html>
        <head>
            <title>Fee Consolidated Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
                th { background: #eaeaea; }
                tr:nth-child(even) td { background: #fafafa; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <h2>Fee Consolidated Report</h2>
            <table>
                <thead>
                    <tr>${tableHead}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                   
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

export function exportToExcel(rows: any[], fileName: string) {
    if (!rows || rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function printTableAll(rows: any[], installments: any[]) {
    const win = window.open('', '', 'width=1400,height=900');
    if (!win) return;

    // HEADER ROW 1
    const headerRow1 = `
    <tr>
      <th rowspan="2">Sl No</th>
      <th rowspan="2">Roll No</th>
      <th rowspan="2">Student Name</th>
      <th rowspan="2">Class</th>
      <th rowspan="2">Section</th>
      ${installments.map((i) => `<th colspan="4" style="text-align:center">${i.instName}</th>`).join('')}
    </tr>
  `;

    // HEADER ROW 2
    const headerRow2 = `<tr>${installments
        .map(() => '<th>Receipt No</th>' + '<th>Date</th>' + '<th>Cheque No</th>' + '<th>Amount</th>')
        .join('')}</tr>`;

    // BODY
    const bodyRows = rows
        .map((row, index) => {
            const instCells = installments
                .map((inst) => {
                    const d = row.installments?.[inst.ftI_Id] || {};
                    return `
            <td>${d.receiptNo || '-'}</td>
            <td>${d.date || '-'}</td>
            <td>${d.chequeNo || '-'}</td>
            <td style="text-align:right">${d.amount ?? '-'}</td>
          `;
                })
                .join('');

            return `
        <tr>
          <td>${index + 1}</td>
          <td>${row.rollNo}</td>
          <td>${row.studentName}</td>
          <td>${row.className}</td>
          <td>${row.sectionName}</td>
          ${instCells}
        </tr>
      `;
        })
        .join('');

    win.document.write(`
    <html>
      <head>
        <title>Fee Consolidated Report</title>
        <style>
          body { font-family: Arial; padding: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 5px; font-size: 11px; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Fee Consolidated Report</h2>
        <table>
          <thead>
            ${headerRow1}
            ${headerRow2}
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.print();
}

export function exportToExcelAll(rows: any[], installments: any[], fileName: string) {
    const excelRows = rows.map((row, index) => {
        const flatRow: any = {
            'Sl No': index + 1,
            'Roll No': row.rollNo,
            'Student Name': row.studentName,
            Class: row.className,
            Section: row.sectionName
        };

        installments.forEach((inst) => {
            const instData = row.installments?.[String(inst.ftI_Id)] || {};

            flatRow[`${inst.ftI_Name} Receipt No`] = instData.receiptNo ?? '';
            flatRow[`${inst.ftI_Name} Date`] = instData.date ?? '';
            flatRow[`${inst.ftI_Name} Cheque No`] = instData.chequeNo ?? '';
            flatRow[`${inst.ftI_Name} Amount`] = instData.amount ?? '';
        });

        return flatRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Report');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
