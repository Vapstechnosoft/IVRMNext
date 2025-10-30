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
import type { DesignationDetail } from "@/types/hrms/master-designation";
import { activateDeactivateMasterDesignation } from "@/types/hrms/master-designation";

interface Designation extends DesignationDetail {}

interface DesignationTabProps {
  data: Designation[];
  formData: {
    designationName: string;
    basicAmount: string;
    sanctionedSeats: string;
    displaySanctionedSeats: boolean;
    order: number;
    isActive: boolean;
  };
  setFormData: (data: {
    designationName: string;
    basicAmount: string;
    sanctionedSeats: string;
    displaySanctionedSeats: boolean;
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

export default function DesignationTab({
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
}: DesignationTabProps) {
  const handleEdit = (item: Designation) => {
    setEditingId(item.HRMDES_Id);
    setFormData({
      designationName: item.HRMDES_DesignationName,
      basicAmount: String(item.HRMDES_BasicAmount ?? ""),
      sanctionedSeats: String(item.HRMDES_SanctionedSeats ?? ""),
      displaySanctionedSeats: Boolean(item.HRMDES_DisplaySanctionedSeatsFlag),
      order: item.HRMDES_Order,
      isActive: item.HRMDES_ActiveFlag,
    });
    setIsFormMinimized(false);
    toast.info("Editing mode enabled");
  };

  const handleDelete = (id: number) => {
    try {
      toast.info("Delete operation is not yet implemented in the API");
    } catch (error) {
      toast.error("Failed to delete designation");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await activateDeactivateMasterDesignation({
        HRMDES_Id: id,
        HRMDES_ActiveFlag: newStatus,
        roleId: 30,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the designation record`
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

  const designationColumns: ColumnDef<Designation>[] = [
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
      accessorKey: "HRMDES_Id",
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
      accessorKey: "HRMDES_DesignationName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Designation Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMDES_DesignationName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMDES_BasicAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Basic Amount" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("HRMDES_BasicAmount") as number;
        return <div>₹{value?.toFixed(2) || "0.00"}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMDES_SanctionedSeats",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sanctioned Seats" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMDES_SanctionedSeats")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMDES_DisplaySanctionedSeatsFlag",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Display Sanctioned Seats"
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("HRMDES_DisplaySanctionedSeatsFlag")
              ? "success"
              : "destructive"
          }
        >
          {row.getValue("HRMDES_DisplaySanctionedSeatsFlag") ? "Yes" : "No"}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMDES_Order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => {
        const id = row.original.HRMDES_Id;
        const currentOrder = row.getValue("HRMDES_Order") as number;

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
      accessorKey: "HRMDES_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("HRMDES_ActiveFlag") ? "success" : "destructive"
          }
        >
          {row.getValue("HRMDES_ActiveFlag") ? "Active" : "Inactive"}
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
        const designation = cell.getValue() as Designation;
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
                  onClick={() => handleEdit(designation)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleToggleActive(
                      designation.HRMDES_Id,
                      designation.HRMDES_ActiveFlag
                    )
                  }
                  className={`w-full justify-start ${
                    designation.HRMDES_ActiveFlag
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {designation.HRMDES_ActiveFlag ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(designation.HRMDES_Id)}
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
            <h3 className="text-lg font-semibold">Designations</h3>
            <p className="text-sm text-muted-foreground">
              Manage designations and their display order
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
        columns={designationColumns}
        data={data}
        totalItems={data.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
