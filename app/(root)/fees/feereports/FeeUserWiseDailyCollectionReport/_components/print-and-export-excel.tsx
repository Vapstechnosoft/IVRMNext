import * as XLSX from 'xlsx';

export function printTable(tableId: string) {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const table = document.getElementById(tableId);
    if (!table) return;

    printWindow.document.write(`
        <html>
        <head>
            <title>Print Report</title>
            <style>
                body { font-family: Arial; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
                th { background: #eaeaea; }
                .no-print { display: none !important; }
            </style>
        </head>
        <body>
            <h3>Fee UserWise Daily Collection Report</h3>
            ${table.outerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

export function exportToExcel(data: any, fileName: string) {
    if (!data) return;

    let worksheetData: any[] = [];

    if (data.studentWise) {
        worksheetData = data.studentWise.map((item: any) => ({
            'Sl No': '',
            'Student Name': item.Student_Name,
            'Admission No': item.Admission_No,
            'Class Name': item.ClassName,
            'Section Name': item.SectionName,
            Date: item.Date,
            'Mode Of Payment': item.ModeOfPayment,
            'Bank Name': item.BankName,
            'Cheque No': item.DD_OR_CHeque_No,
            'Head Name': item.FMH_FeeName,
            Amount: item.Amount,
            'Receipt No': item.Receipt_No,
            GeneratedBy: item.GeneratedBy
        }));
    } else if (data.totalCollection) {
        worksheetData = data.totalCollection.map((item: any) => ({
            'Sl No': '',
            Date: item.Date,
            'Mode Of Payment': item.ModeOfPayment,
            'Total Amount': item.totalAmount,
            'Receipt No': item.Receipt_No,
            GeneratedBy: item.GeneratedBy
        }));
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
