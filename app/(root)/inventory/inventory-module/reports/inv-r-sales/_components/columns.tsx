
import { ColumnDef } from "@tanstack/react-table";
import { IInvRSalesReportData } from "@/types/inventory/reports/inv-r-sales";

export const getColumns = (
    typeflag: string,
    optionflag: string | undefined,
    showTax: boolean,
    showDiscount: boolean
): ColumnDef<IInvRSalesReportData>[] => {

    const commonNumberClass = "text-right font-mono";
    const dateCell = ({ row }: any) => {
        // Angular: kendo.toString(kendo.parseDate(INVMSL_SalesDate, 'yyyy-MM-dd'), 'dd/MM/yyyy')
        // Assuming API returns YYYY-MM-DD or ISO
        const date = row.getValue("invmsL_SalesDate");
        return date;
    };

    let columns: ColumnDef<IInvRSalesReportData>[] = [];

    // Common Columns for 'All' or Detailed -> Item/SaleNo
    const slNoCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "rowNumber",
        header: "SL.No.",
        cell: ({ row }) => row.index + 1,
        size: 60,
    };

    const salesNoCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invmsL_SalesNo",
        header: "Sale No",
    };

    const salesDateCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invmsL_SalesDate",
        header: "Sale Date",
        cell: dateCell
    };

    const itemCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invmI_ItemName",
        header: "Item",
    };

    const quantityCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invtsL_SalesQty", // Or saleQty 
        header: "Quantity",
        cell: ({ row }) => {
            const val = row.original.invtsL_SalesQty ?? row.original.saleQty;
            return <div className={commonNumberClass}>{Number(val).toFixed(2)}</div>;
        }
    };

    const priceCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invtsL_SalesPrice", // Or salePrice
        header: "Price",
        cell: ({ row }) => {
            const val = row.original.invtsL_SalesPrice ?? row.original.salePrice;
            return <div className={commonNumberClass}>{Number(val).toFixed(2)}</div>;
        }
    };

    const amountCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invtsL_Amount", // Or saleAmount
        header: "Amount",
        cell: ({ row }) => {
            const val = row.original.invtsL_Amount ?? row.original.saleAmount;
            return <div className={commonNumberClass}>{Number(val).toFixed(2)}</div>;
        }
    };

    const taxCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invtsL_TaxAmt", // Or saleTax
        header: "Tax",
        cell: ({ row }) => {
            const val = row.original.invtsL_TaxAmt ?? row.original.saleTax;
            return <div className={commonNumberClass}>{Number(val).toFixed(2)}</div>;
        }
    };

    const discountCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "invtsL_DiscountAmt", // Or saleDiscount
        header: "Discount",
        cell: ({ row }) => {
            const val = row.original.invtsL_DiscountAmt ?? row.original.saleDiscount;
            return <div className={commonNumberClass}>{Number(val).toFixed(2)}</div>;
        }
    };

    const nameCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "membername",
        header: "Name",
    };

    const admNoCol: ColumnDef<IInvRSalesReportData> = {
        accessorKey: "amsT_AdmNo",
        header: "Adm.No.",
    };


    if (typeflag === 'All') {
        columns = [slNoCol, itemCol, salesNoCol, salesDateCol, quantityCol, priceCol, amountCol];
        if (showTax) columns.push(taxCol);
        if (showDiscount) columns.push(discountCol);
    } else if (typeflag === 'Detailed') {
        if (optionflag === 'Item') {
            columns = [slNoCol, salesNoCol, salesDateCol, itemCol, quantityCol, priceCol, amountCol];
        } else if (optionflag === 'Student') {
            columns = [slNoCol, salesNoCol, salesDateCol, itemCol, nameCol, quantityCol, priceCol, amountCol];
        } else if (optionflag === 'Saleno') {
            columns = [slNoCol, salesNoCol, salesDateCol, itemCol, nameCol, salesDateCol, quantityCol, priceCol, amountCol];
        }

        if (showTax) columns.push(taxCol);
        if (showDiscount) columns.push(discountCol);

    } else if (typeflag === 'Overall') {
        if (optionflag === 'Item') {
            columns = [slNoCol, itemCol, quantityCol, priceCol, amountCol];
        } else if (optionflag === 'Student' || optionflag === 'Staff') {
            columns = [slNoCol, nameCol];
            if (optionflag === 'Student') columns.push(admNoCol);
            columns.push(quantityCol, priceCol, amountCol);
        }

        if (showTax) columns.push(taxCol);
        if (showDiscount) columns.push(discountCol);
    }

    return columns;
};
