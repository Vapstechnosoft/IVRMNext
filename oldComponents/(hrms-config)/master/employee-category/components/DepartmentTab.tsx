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
import type { DepartmentDetail } from "@/types/hrms/master-department";
import { activateDeactivateMasterDepartment } from "@/types/hrms/master-department";

interface Department extends DepartmentDetail {}

interface DepartmentTabProps {
  data: Department[];
  formData: {
    departmentName: string;
    internalTrainingHours: string;
    order: number;
    isActive: boolean;
  };
  setFormData: (data: {
    departmentName: string;
    internalTrainingHours: string;
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
}

export default function DepartmentTab({
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
}: DepartmentTabProps) {
  const handleEdit = (item: Department) => {
    setEditingId(item.HRMD_Id);
    setFormData({
      departmentName: item.HRMD_DepartmentName,
      internalTrainingHours: String(item.HRMD_InternalTrainingMinimumHrs ?? ""),
      order: item.HRMD_Order,
      isActive: item.HRMD_ActiveFlag,
    });
    setIsFormMinimized(false);
    toast.info("Editing mode enabled");
  };

  const handleDelete = (id: number) => {
    try {
      toast.info("Delete operation is not yet implemented in the API");
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await activateDeactivateMasterDepartment({
        HRMD_Id: id,
        HRMD_ActiveFlag: newStatus,
        roleId: 30,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the department record`
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

  const departmentColumns: ColumnDef<Department>[] = [
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
      accessorKey: "HRMD_Id",
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
      accessorKey: "HRMD_DepartmentName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMD_DepartmentName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMD_InternalTrainingMinimumHrs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Training Hours" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("HRMD_InternalTrainingMinimumHrs") as number;
        return <div>{value?.toFixed(2) || "0.00"}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMD_Order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMD_Order")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMD_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMD_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMD_ActiveFlag") ? "Active" : "Inactive"}
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
        const department = cell.getValue() as Department;
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
                  onClick={() => handleEdit(department)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleToggleActive(
                      department.HRMD_Id,
                      department.HRMD_ActiveFlag
                    )
                  }
                  className={`w-full justify-start ${
                    department.HRMD_ActiveFlag
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {department.HRMD_ActiveFlag ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(department.HRMD_Id)}
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
        columns={departmentColumns}
        data={data}
        totalItems={data.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
