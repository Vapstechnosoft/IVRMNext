
import { ColumnDef } from "@tanstack/react-table";
import { IInvRItemConsumptionReportData } from "@/types/inventory/reports/inv-r-item-consumption";
import { format } from "date-fns";

export const getColumns = (
    typeflag: string,
    optionflag: string | undefined
): ColumnDef<IInvRItemConsumptionReportData>[] => {

    const commonNumberClass = "text-right font-mono";

    // Common Helpers
    const slNoCol: ColumnDef<IInvRItemConsumptionReportData> = {
        accessorKey: "sno",
        header: "SL.No.",
        cell: ({ row }) => row.index + 1,
        size: 60,
    };

    // --- Fields ---
    const itemCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "invmI_ItemName", header: "Item" };
    const itemCodeCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "invmI_ItemCode", header: "Item Code" };
    const uomCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "invmUOM_UOMName", header: "UOM" };
    const dateCol: ColumnDef<IInvRItemConsumptionReportData> = {
        accessorKey: "invmiC_ICDate",
        header: "Date",
        cell: ({ row }) => {
            const val = row.getValue("invmiC_ICDate") as string;
            return val ? format(new Date(val), 'dd/MM/yyyy') : '';
        }
    };
    const qtyCol: ColumnDef<IInvRItemConsumptionReportData> = {
        accessorKey: "invtiC_ICQty",
        header: "Quantity",
        cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("invtiC_ICQty")).toFixed(2)}</div>
    };
    const qtySummaryCol: ColumnDef<IInvRItemConsumptionReportData> = {
        accessorKey: "icQty",
        header: "Quantity",
        cell: ({ row }) => <div className={commonNumberClass}>{Number(row.getValue("icQty")).toFixed(2)}</div>
    };
    const narrationCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "invtiC_Naration", header: "Narration" };

    // Dynamic Member Name (Staff/Student/Dept)
    const empNameCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "membername", header: "Employee Name" };
    const empCodeCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "hrmE_EmployeeCode", header: "Employee Code" };

    const deptNameCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "membername", header: "Department" };

    const studentNameCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "membername", header: "Student Name" };
    const admNoCol: ColumnDef<IInvRItemConsumptionReportData> = { accessorKey: "amsT_AdmNo", header: "Adm. No." };


    // Logic
    if (typeflag === 'All') {
        return [slNoCol, itemCol, uomCol, dateCol, qtyCol, narrationCol];
    }

    if (typeflag === 'Overall') {
        if (optionflag === 'Item') return [slNoCol, itemCol, itemCodeCol, qtySummaryCol];
        if (optionflag === 'Staff') return [slNoCol, empNameCol, empCodeCol, qtySummaryCol];
        if (optionflag === 'Department') return [slNoCol, deptNameCol, qtySummaryCol];
        if (optionflag === 'Student') return [slNoCol, studentNameCol, admNoCol, qtySummaryCol];
    }

    if (typeflag === 'Detailed') {
        if (optionflag === 'Item') return [slNoCol, itemCol, itemCodeCol, dateCol, qtyCol];
        if (optionflag === 'Staff') return [slNoCol, itemCol, itemCodeCol, dateCol, empNameCol, empCodeCol, qtyCol];
        if (optionflag === 'Department') return [slNoCol, itemCol, itemCodeCol, dateCol, empNameCol, qtyCol]; // Note: Angular code uses 'membername' and 'Employee Name' header for Dept too? "name: 'membername', field: 'membername', title: 'Employee Name'" in Dept section. Maybe copy paste error in Angular or intentional? Assuming intended to show Dept name or Emp name within Dept? Code says 'membername' title 'Employee Name'. Let's stick to 'Employee Name' if that's what code says, or 'Department' based on context? 
        // Angular Code for Detailed + Department: 
        // { name: 'membername', field: 'membername', title: 'Employee Name', width: "150px" } 
        // But in Overall + Department it says title: 'Department'. 
        // In Detailed + Department, it might be listing employees within department? Or simply consumption logged against dept?
        // Let's use 'Employee Name' as per Angular code literal, but be aware.

        if (optionflag === 'Student') return [slNoCol, itemCol, itemCodeCol, dateCol, studentNameCol, admNoCol, qtyCol];
    }

    return [];
};
