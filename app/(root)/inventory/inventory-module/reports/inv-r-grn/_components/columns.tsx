
import { ColumnDef } from "@tanstack/react-table";
import { IInvRGRNReportData } from "@/types/inventory/reports/inv-r-grn";

export const getColumns = (typeflag: string, optionflag?: string): ColumnDef<IInvRGRNReportData>[] => {
    const commonNumberClass = "text-right font-mono";

    if (typeflag === 'All' || typeflag === 'Detailed') {
        return [
            {
                accessorKey: "rowNumber",
                header: "SL.No.",
                cell: ({ row }) => row.index + 1,
                size: 60,
            },
            {
                accessorKey: "invmgrN_GRNNo",
                header: "GRN No",
            },
            {
                accessorKey: "invmgrN_PurchaseDate",
                header: "Purchase Date",
                cell: ({ row }) => {
                    const date = row.getValue("invmgrN_PurchaseDate") as string;
                    // Assuming date is in a parseable format or already formatted
                    return date;
                }
            },
            {
                accessorKey: "invmS_SupplierName",
                header: "Supplier",
            },
            {
                accessorKey: "invmI_ItemName",
                header: "Item",
            },
            {
                accessorKey: "invmuoM_UOMName",
                header: "UOM",
            },
            {
                accessorKey: "invtgrN_Qty",
                header: "Quantity",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_Qty")).toFixed(2)}</div>,
            },
            {
                accessorKey: "invtgrN_PurchaseRate",
                header: "Rate",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_PurchaseRate")).toFixed(2)}</div>,
            },
            {
                accessorKey: "invtgrN_MRP",
                header: "MRP",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_MRP")).toFixed(2)}</div>,
            },
            {
                accessorKey: "invtgrN_SalesPrice",
                header: "Sale Price",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_SalesPrice")).toFixed(2)}</div>,
            },
            {
                accessorKey: "invtgrN_DiscountAmt",
                header: "Discount",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_DiscountAmt")).toFixed(2)}</div>,
            },
            {
                accessorKey: "invtgrN_TaxAmt",
                header: "Tax",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_TaxAmt")).toFixed(2)}</div>,
            },
            {
                accessorKey: "invtgrN_Amount",
                header: "Total Amount",
                cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtgrN_Amount")).toFixed(2)}</div>,
            },
        ];
    } else if (typeflag === 'Overall') {
        if (optionflag === 'Item_1') {
            return [
                {
                    accessorKey: "rowNumber",
                    header: "SL.No.",
                    cell: ({ row }) => row.index + 1,
                    size: 60,
                },
                {
                    accessorKey: "invmI_ItemName",
                    header: "Item",
                },
                {
                    accessorKey: "invmI_ItemCode",
                    header: "Item Code",
                },
                {
                    accessorKey: "grnQuantity",
                    header: "Quantity",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnQuantity")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnRate",
                    header: "Rate",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnRate")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnMRP",
                    header: "MRP",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnMRP")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnSalePrice",
                    header: "Sale Price",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnSalePrice")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnDiscount",
                    header: "Discount",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnDiscount")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnTax",
                    header: "Tax",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnTax")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnAmount",
                    header: "Amount",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnAmount")).toFixed(2)}</div>,
                },
            ];
        } else if (optionflag === 'Supplier') {
            return [
                {
                    accessorKey: "rowNumber",
                    header: "SL.No.",
                    cell: ({ row }) => row.index + 1,
                    size: 60,
                },
                {
                    accessorKey: "invmS_SupplierName",
                    header: "Supplier Name",
                },
                {
                    accessorKey: "invmS_SupplierCode",
                    header: "Code",
                },
                {
                    accessorKey: "invmS_SupplierConatctNo",
                    header: "Contact No.",
                },
                {
                    accessorKey: "invmS_EmailId",
                    header: "Email ID",
                },
                {
                    accessorKey: "grnQuantity",
                    header: "Quantity",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnQuantity")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnRate",
                    header: "Rate",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnRate")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnMRP",
                    header: "MRP",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnMRP")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnSalePrice",
                    header: "Sale Price",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnSalePrice")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnDiscount",
                    header: "Discount",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnDiscount")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnTax",
                    header: "Tax",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnTax")).toFixed(2)}</div>,
                },
                {
                    accessorKey: "grnAmount",
                    header: "Amount",
                    cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("grnAmount")).toFixed(2)}</div>,
                },
            ];
        }
    }
    return [];
};
