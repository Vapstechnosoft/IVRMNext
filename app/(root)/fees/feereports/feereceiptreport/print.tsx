type PrintReceiptData = {
    logodata: string;
    receiptNo: string;
    admissionNo: string;
    studentName: string;
    fatherName: string;
    academicYear: string;
    className: string;
    feeRows: any[];
    paymentRows: any[];
    amountInWords: string;
    paymentMode: string;
};

export function ExporttoPrint(data: PrintReceiptData) {
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) return;

    const {
        logodata,
        receiptNo,
        admissionNo,
        studentName,
        fatherName,
        academicYear,
        className,
        feeRows,
        paymentRows,
        amountInWords,
        paymentMode
    } = data;

    printWindow.document.open();
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Receipt - ${receiptNo}</title>

<script src="https://cdn.tailwindcss.com"></script>

<style>
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@page {
  size: A4 landscape;
  margin: 10mm;
}

body {
  margin: 0;
  background: white;
  font-family: Arial, Helvetica, sans-serif;
}

.print-root {
  width: 277mm;
  margin: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #000;
  padding: 6px;
  font-size: 12px;
}

th {
  background: #f3f3f3;
  font-weight: bold;
}

h1 { font-size: 22px; }
h2 { font-size: 18px; }
h3 { font-size: 14px; }
</style>
</head>

<body>
<div class="print-root p-6">

  <!-- HEADER -->
<div class="text-center">
  <img src="${logodata}" alt="Logo" class="max-h-20 max-w-40 mx-auto" />
</div>


  <!-- META -->
  <div class="grid grid-cols-2 text-sm mt-4">
    <div>
      <p><b>Receipt No:</b> ${receiptNo}</p>
      <p><b>Admission No:</b> ${admissionNo}</p>
      <p><b>Name:</b> ${studentName}</p>
      <p><b>Father:</b> ${fatherName}</p>
    </div>
    <div class="text-right">
      <p><b>Academic Year:</b> ${academicYear}</p>
      <p><b>Class/Sec:</b> ${className}</p>
    </div>
  </div>

  <h2 class="text-center font-bold my-4">FEE RECEIPT</h2>

  <!-- FEE TABLE -->
  <table class="text-xs">
    <thead>
      <tr>
        <th>SL.NO</th>
        <th>PARTICULARS</th>
        <th>INSTALLMENT</th>
        <th>TOTAL CHARGES</th>
        <th>CONCESSION</th>
        <th>PAID AMOUNT</th>
        <th>BALANCE</th>
      </tr>
    </thead>
    <tbody>
      ${feeRows
          .map(
              (r, i) => `
        <tr>
          <td align="center">${i + 1}</td>
          <td>${r.particulars}</td>
          <td align="center">${r.installment ?? '-'}</td>
          <td align="right">${r.totalCharges ?? '-'}</td>
          <td align="right">${r.concession ?? '-'}</td>
          <td align="right">${r.paidAmount ?? '-'}</td>
          <td align="right">${r.balance ?? '-'}</td>
        </tr>
      `
          )
          .join('')}
    </tbody>
  </table>

  <!-- PAYMENT -->
  <h3 class="mt-6 font-bold text-sm">CURRENT PAYMENT DETAIL</h3>

  <table class="text-xs mt-2">
    <thead>
      <tr>
        <th>SL.NO</th>
        <th>AMOUNT</th>
        <th>BANK</th>
        <th>DD.NO</th>
        <th>DATE</th>
      </tr>
    </thead>
    <tbody>
      ${paymentRows
          .map(
              (p, i) => `
        <tr>
          <td align="center">${i + 1}</td>
          <td align="right">${p.amount}</td>
          <td align="center">${p.bank ?? '-'}</td>
          <td align="center">${p.ddNo ?? '-'}</td>
          <td align="center">${p.date ?? '-'}</td>
        </tr>
      `
          )
          .join('')}
    </tbody>
  </table>

  <!-- FOOTER -->
  <div class="mt-4 text-sm">
    <p><b>Amount Received:</b> ${amountInWords}</p>
    <p><b>Payment Mode:</b> ${paymentMode}</p>
  </div>

  <div class="mt-10 text-right">
    <p class="border-t pt-2 text-sm">AUTHORIZED SIGNATORY</p>
  </div>

</div>
</body>
</html>
`);

    printWindow.document.close();

    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 800);
    };
}
