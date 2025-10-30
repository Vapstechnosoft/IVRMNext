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
import { Edit, Trash2, MoreHorizontal, Power } from "lucide-react";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../../lib/localdb";
import type { EmployeeTypeDetail } from "@/types/hrms/master-employee-type";
import { activateDeactivateMasterEmployeeType } from "@/types/hrms/master-employee-type";

interface EmployeeType extends EmployeeTypeDetail {}

interface EmployeeTypeTabProps {
  data: EmployeeType[];
  formData: { employeeType: string; isActive: boolean };
  setFormData: (data: { employeeType: string; isActive: boolean }) => void;
  onRefresh: () => void;
  db: ReturnType<typeof createLocalCrud<EmployeeType>>;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  isFormMinimized: boolean;
  setIsFormMinimized: (minimized: boolean) => void;
}

type EmployeeTypeForm = {
  employeeType: string;
  isActive: boolean;
};

export default function EmployeeTypeTab({
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
}: EmployeeTypeTabProps) {
  const handleEdit = (item: EmployeeType) => {
    setEditingId(item.HRMET_Id);
    setFormData({
      employeeType: item.HRMET_EmployeeType,
      isActive: item.HRMET_ActiveFlag,
    });
    setIsFormMinimized(false);
    toast.info("Editing mode enabled");
  };

  const handleDelete = (id: number) => {
    try {
      toast.info("Delete operation is not yet implemented in the API");
    } catch (error) {
      toast.error("Failed to delete employee type");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await activateDeactivateMasterEmployeeType({
        HRMET_Id: id,
        HRMET_ActiveFlag: newStatus,
        MI_Id: 30,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the employee type record`
        );
        // Reload the data to reflect the changes
        onRefresh();
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const employeeTypeColumns: ColumnDef<EmployeeType>[] = [
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
      accessorKey: "HRMET_Id",
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
      accessorKey: "HRMET_EmployeeType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Type" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMET_EmployeeType")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMET_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMET_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMET_ActiveFlag") ? "Active" : "Inactive"}
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
        const employeeType = cell.getValue() as EmployeeType;
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
                  onClick={() => handleEdit(employeeType)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleToggleActive(
                      employeeType.HRMET_Id,
                      employeeType.HRMET_ActiveFlag
                    )
                  }
                  className={`w-full justify-start ${
                    employeeType.HRMET_ActiveFlag
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {employeeType.HRMET_ActiveFlag ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(employeeType.HRMET_Id)}
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
      <DataTable
        isLoading={false}
        columns={employeeTypeColumns}
        data={data}
        totalItems={data.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
