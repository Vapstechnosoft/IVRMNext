"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, MoreHorizontal, Power, Save } from "lucide-react";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../../lib/localdb";
import type { GradeDetail } from "@/types/hrms/master-grade";
import { activateDeactivateMasterGrade } from "@/types/hrms/master-grade";

interface Grade extends GradeDetail {}

interface GradeTabProps {
  data: Grade[];
  formData: {
    gradeName: string;
    gradeDisplayName: string;
    payScaleFrom: string;
    incrementOf: string;
    payScaleTo: string;
    payScaleRange: string;
    order: number;
    isActive: boolean;
  };
  setFormData: (data: {
    gradeName: string;
    gradeDisplayName: string;
    payScaleFrom: string;
    incrementOf: string;
    payScaleTo: string;
    payScaleRange: string;
    order: number;
    isActive: boolean;
  }) => void;
  onRefresh: () => void;
  db: ReturnType<typeof createLocalCrud<any>>;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isFormMinimized: boolean;
  setIsFormMinimized: (minimized: boolean) => void;
  isOrderEditing: boolean;
  orderValues: Record<number, number>;
  onOrderChange: (id: number, value: number) => void;
  onSetOrderClick: () => void;
}

export default function GradeTab({
  data,
  formData,
  setFormData,
  onRefresh,
  db,
  editingId,
  setEditingId,
  deleteId,
  setDeleteId,
  isFormMinimized,
  setIsFormMinimized,
  isOrderEditing,
  orderValues,
  onOrderChange,
  onSetOrderClick,
}: GradeTabProps) {
  const handleEdit = (item: Grade) => {
    setEditingId(item.HRMG_Id);
    setFormData({
      gradeName: item.HRMG_GradeName,
      gradeDisplayName: item.HRMG_GradeDisplayName,
      payScaleFrom: String(item.HRMG_PayScaleFrom ?? ""),
      incrementOf: String(item.HRMG_IncrementOf ?? ""),
      payScaleTo: String(item.HRMG_PayScaleTo ?? ""),
      payScaleRange: String(item.HRMG_PayScaleRange ?? ""),
      order: item.HRMG_Order,
    });
    setIsFormMinimized(false);
    toast.info("Editing mode enabled");
  };

  const handleDelete = (id: number) => {
    try {
      toast.info("Delete operation is not yet implemented in the API");
    } catch (error) {
      toast.error("Failed to delete grade");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await activateDeactivateMasterGrade({
        HRMG_Id: id,
        HRMG_ActiveFlag: newStatus,
        roleId: 30,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the grade record`
        );
        onRefresh();
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const gradeColumns: ColumnDef<Grade>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 24,
    },
    {
      accessorKey: "HRMG_Id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sl.No" />
      ),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div>{continuousIndex}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "HRMG_GradeName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Grade Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMG_GradeName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_GradeDisplayName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Grade Display Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMG_GradeDisplayName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_PayScaleFrom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pay Scale From" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("HRMG_PayScaleFrom") as number;
        return <div>₹{value?.toFixed(2) || "0.00"}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_IncrementOf",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Increment Of" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("HRMG_IncrementOf") as number;
        return <div>₹{value?.toFixed(2) || "0.00"}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_PayScaleTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pay Scale To" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("HRMG_PayScaleTo") as number;
        return <div>₹{value?.toFixed(2) || "0.00"}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_PayScaleRange",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pay Scale Range" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMG_PayScaleRange")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_Order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => {
        const id = row.original.HRMG_Id;
        const currentOrder = row.getValue("HRMG_Order") as number;

        if (isOrderEditing) {
          return (
            <input
              type="number"
              min="1"
              value={orderValues[id] ?? currentOrder}
              onChange={(e) => onOrderChange(id, parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          );
        }

        return <div>{currentOrder}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMG_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMG_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMG_ActiveFlag") ? "Active" : "Inactive"}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      accessorFn: (row: any) => {
        return row;
      },
      enableSorting: false,
      cell: ({ cell }: { cell: any }) => {
        const grade = cell.getValue() as Grade;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <div className="flex-justify-between flex-wrap gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleEdit(grade)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleToggleActive(grade.HRMG_Id, grade.HRMG_ActiveFlag)
                  }
                  className={`w-full justify-start ${
                    grade.HRMG_ActiveFlag ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {grade.HRMG_ActiveFlag ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(grade.HRMG_Id)}
                  className="w-full justify-start text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg bg-card overflow-hidden">
      {/* Set Order Button */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Grades</h3>
            <p className="text-sm text-muted-foreground">
              Manage grades and their display order
            </p>
          </div>
          <Button
            onClick={onSetOrderClick}
            variant={isOrderEditing ? "default" : "outline"}
            className="transition-all duration-200 hover:scale-105 w-fit"
          >
            {isOrderEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Order
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Set Order
              </>
            )}
          </Button>
        </div>
      </div>

      <DataTable
        isLoading={false}
        columns={gradeColumns}
        data={data}
        totalItems={data.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
