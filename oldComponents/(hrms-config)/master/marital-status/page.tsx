"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save,
  Power,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { MARITAL_STATUS_VALIDATION } from "@/lib/validation/hrms-master-validation";
import {
  getOnloadMaritalStatusDetails,
  saveMasterMaritalStatus,
  activateDeactivateMasterMaritalStatus,
} from "@/types/hrms/master-marital-status";
import type {
  MasterMaritalStatusResponse,
  MaritalStatusDetail,
  MasterMaritalStatusInput,
} from "@/types/hrms/master-marital-status";

interface MaritalStatus extends MaritalStatusDetail {}

type MaritalStatusForm = {
  maritalStatus: string;
  isActive: boolean;
  roleId: number;
};

export default function MaritalStatusMasterPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId, setRoleId] = useState(2); // Default role ID
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MaritalStatusForm>({
    mode: "onChange",
    defaultValues: {
      maritalStatus: "",
      isActive: true,
      roleId: 2,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadMaritalStatuses();
  }, [roleId]);

  const loadMaritalStatuses = async () => {
    try {
      setIsLoading(true);
      const response = await getOnloadMaritalStatusDetails(roleId);

      if (response.success && response.data) {
        setMaritalStatuses(response.data.maritalstatusList);
        toast.success(
          `Loaded ${response.data.maritalstatusList.length} marital statuses`
        );
      } else {
        toast.error(response.message || "Failed to load marital statuses");
        setMaritalStatuses([]);
      }
    } catch (error) {
      console.error("Error loading marital statuses:", error);
      toast.error("Failed to load marital statuses");
      setMaritalStatuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    reset({ roleId });
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset({ roleId });
  };

  const onSubmit: SubmitHandler<MaritalStatusForm> = async (
    data: MaritalStatusForm
  ) => {
    try {
      // Prepare the data for the API
      const saveData: MasterMaritalStatusInput = {
        ivrmmmS_Id: editingId || undefined,
        mI_Id: data.roleId,
        ivrmmmS_MaritalStatus: data.maritalStatus,
        ivrmmmS_ActiveFlag: true, // Always set to true by default
      };

      console.log(
        editingId ? "Editing" : "Saving",
        "marital status data:",
        saveData
      );

      // Use the same endpoint for both create and update
      const response = await saveMasterMaritalStatus(saveData);

      if (response.success) {
        toast.success(
          `Successfully ${editingId ? "updated" : "created"} marital status: ${
            data.maritalStatus
          }`
        );
        handleFormClose();
        // Reload the data to show the new/updated item
        loadMaritalStatuses();
      } else {
        toast.error(response.message || "Failed to save marital status");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save marital status");
    }
  };

  const handleEdit = (item: MaritalStatus) => {
    setEditingId(item.IVRMMMS_Id);
    setValue("maritalStatus", item.IVRMMMS_MaritalStatus);
    setValue("isActive", item.IVRMMMS_ActiveFlag);
    setValue("roleId", item.MI_Id);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await activateDeactivateMasterMaritalStatus({
        IVRMMMS_Id: id,
        IVRMMMS_ActiveFlag: newStatus,
        roleId: roleId,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the marital status record`
        );
        // Reload the data to reflect the changes
        loadMaritalStatuses();
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Master Marital Status Management"
              description="Manage marital status options for the organization"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={handleAddClick}
              size="lg"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
            >
              <Plus className="h-4 w-4" />
              Add Marital Status
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Marital Statuses Data"
          description="View, search, and manage all marital status information in the system"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <MaritalStatusTable
            maritalStatuses={maritalStatuses}
            isLoading={isLoading}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        </CollapsibleSection>

        {/* Add Form Section - Conditionally Rendered */}
        {isFormOpen && (
          <div
            ref={formRef}
            className="slide-in-from-top-4 animate-in duration-300"
          >
            <CollapsibleSection
              title={
                editingId ? "Update Marital Status" : "Add New Marital Status"
              }
              description="Fill in the details below to create a new marital status record"
              defaultOpen={true}
              variant="outline"
              size="md"
              className="shadow-lg"
              headerClassName=""
            >
              <div className="relative">
                <Button
                  onClick={handleFormClose}
                  variant="ghost"
                  size="sm"
                  className="-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 text-destructive" /> Close
                </Button>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 max-w-full"
                >
                  {/* Primary Information Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="lg:col-span-1">
                        <InputText
                          label="Marital Status"
                          required
                          id="maritalStatus"
                          placeholder="Enter marital status (max 10 characters, letters only)"
                          {...register(
                            "maritalStatus",
                            MARITAL_STATUS_VALIDATION.maritalStatus
                          )}
                          error={errors.maritalStatus?.message}
                          className="transition-colors focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Empty divs to maintain grid structure */}
                      <div className="lg:col-span-2"></div>
                    </div>

                    {/* Root Error */}
                    {errors.root && (
                      <FormError>{errors.root.message}</FormError>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFormClose}
                      disabled={isSubmitting}
                      className="order-2 sm:order-1 transition-all duration-200 hover:scale-105 w-fit"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="order-1 sm:order-2 transition-all duration-200 hover:scale-105 w-fit"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          {editingId
                            ? "Update Marital Status"
                            : "Save Marital Status"}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}

interface MaritalStatusTableProps {
  maritalStatuses: MaritalStatus[];
  isLoading: boolean;
  onEdit: (item: MaritalStatus) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

function MaritalStatusTable({
  maritalStatuses,
  isLoading,
  onEdit,
  onToggleActive,
}: MaritalStatusTableProps) {
  const columns: ColumnDef<MaritalStatus>[] = [
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
      accessorKey: "IVRMMMS_Id",
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
      accessorKey: "IVRMMMS_MaritalStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Marital Status" />
      ),
      cell: ({ row }) => <div>{row.getValue("IVRMMMS_MaritalStatus")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "IVRMMMS_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("IVRMMMS_ActiveFlag") ? "success" : "destructive"
          }
        >
          {row.getValue("IVRMMMS_ActiveFlag") ? "Active" : "Inactive"}
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
        const item = cell.getValue() as MaritalStatus;
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
                  onClick={() => onEdit(item)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    onToggleActive(item.IVRMMMS_Id, item.IVRMMMS_ActiveFlag)
                  }
                  className={`w-full justify-start ${
                    item.IVRMMMS_ActiveFlag
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.IVRMMMS_ActiveFlag ? "Deactivate" : "Activate"}
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
        isLoading={isLoading}
        columns={columns}
        data={maritalStatuses}
        totalItems={maritalStatuses.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
