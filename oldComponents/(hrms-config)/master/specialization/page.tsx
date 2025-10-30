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
import {
  getMasterSpecializationList,
  saveMasterSpecialization,
  editMasterSpecialization,
  activateDeactivateMasterSpecialization,
  testMasterSpecializationAPI,
  getOnloadDetails,
} from "@/types/hrms/master-specialization";
import type {
  MasterSpecializationResponse,
  SpecializationItem,
  MasterSpecializationInput,
} from "@/types/hrms/master-specialization";

interface Specialization extends SpecializationItem {}

type SpecializationForm = {
  specializationName: string;
  isActive: boolean;
  roleId: number;
};

export default function SpecializationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId, setRoleId] = useState(2); // Default role ID
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SpecializationForm>({
    mode: "onChange",
    defaultValues: {
      roleId: 2,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadSpecializations();
  }, [roleId]);

  const loadSpecializations = async () => {
    try {
      setIsLoading(true);

      // Use the new onload get details endpoint
      const response = await getOnloadDetails(roleId);

      if (response.success && response.data) {
        setSpecializations(response.data.alldata);
        toast.success(`Loaded ${response.data.alldata.length} specializations`);
      } else {
        toast.error(response.message || "Failed to load specializations");
        setSpecializations([]);
      }
    } catch (error) {
      console.error("Error loading specializations:", error);
      toast.error("Failed to load specializations");
      setSpecializations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    reset({ roleId });
    // Scroll to form after state update
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

  const onSubmit: SubmitHandler<SpecializationForm> = async (
    data: SpecializationForm
  ) => {
    try {
      // Prepare the data for the API
      const saveData: MasterSpecializationInput = {
        hrmspl_Id: editingId || undefined,
        mI_Id: data.roleId,
        hrmspl_SpecialisationName: data.specializationName,
        hrmspl_ActiveFlg: data.isActive,
      };

      console.log(
        editingId ? "Editing" : "Saving",
        "specialization data:",
        saveData
      );

      // Use different endpoints for create vs edit
      const response = editingId
        ? await editMasterSpecialization(saveData)
        : await saveMasterSpecialization(saveData);

      if (response.success) {
        toast.success(
          `Successfully ${editingId ? "updated" : "created"} specialization: ${
            data.specializationName
          }`
        );
        handleFormClose();
        // Reload the data to show the new/updated item
        loadSpecializations();
      } else {
        toast.error(response.message || "Failed to save specialization");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save specialization");
    }
  };

  const handleEdit = (specialization: Specialization) => {
    setEditingId(specialization.HRMSPL_Id);
    setValue("specializationName", specialization.HRMSPL_SpecialisationName);
    setValue("isActive", specialization.HRMSPL_ActiveFlg);
    setValue("roleId", specialization.MI_Id);
    setIsFormOpen(true);
    // Scroll to form after state update
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
      const response = await activateDeactivateMasterSpecialization({
        hrmspl_Id: id,
        hrmspl_ActiveFlg: newStatus,
        mI_Id: roleId,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the specialization record`
        );
        // Reload the data to reflect the changes
        loadSpecializations();
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
              title="Master Specialization Management"
              description="Manage specialization options for the organization"
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
              Add Master Specialization
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Master Specializations Data"
          description="View, search, and manage all specialization information in the system"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <SpecializationTable
            specializations={specializations}
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
                editingId
                  ? "Update Master Specialization"
                  : "Add New Master Specialization"
              }
              description="Fill in the details below to create a new specialization record"
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
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <InputText
                        label="Specialization Name"
                        required
                        id="specializationName"
                        {...register("specializationName", {
                          required: "Specialization name is required",
                        })}
                        error={errors.specializationName?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="space-y-2 flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="isActive"
                          {...register("isActive")}
                          className="text-primary focus:ring-primary border-border mr-2"
                        />
                        <label
                          htmlFor="isActive"
                          className="text-sm font-medium text-foreground"
                        >
                          Active
                        </label>
                      </div>
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
                            ? "Update Master Specialization"
                            : "Save Master Specialization"}
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

interface SpecializationTableProps {
  specializations: Specialization[];
  isLoading: boolean;
  onEdit: (specialization: Specialization) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

function SpecializationTable({
  specializations,
  isLoading,
  onEdit,
  onToggleActive,
}: SpecializationTableProps) {
  const specializationColumns: ColumnDef<Specialization>[] = [
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
      accessorKey: "HRMSPL_Id",
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
      accessorKey: "HRMSPL_SpecialisationName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Specialization Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMSPL_SpecialisationName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMSPL_ActiveFlg",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMSPL_ActiveFlg") ? "success" : "destructive"}
        >
          {row.getValue("HRMSPL_ActiveFlg") ? "Active" : "Inactive"}
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
        const specialization = cell.getValue() as Specialization;
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
                  onClick={() => onEdit(specialization)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    onToggleActive(
                      specialization.HRMSPL_Id,
                      specialization.HRMSPL_ActiveFlg
                    )
                  }
                  className={`w-full justify-start ${
                    specialization.HRMSPL_ActiveFlg
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {specialization.HRMSPL_ActiveFlg ? "Deactivate" : "Activate"}
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
        columns={specializationColumns}
        data={specializations}
        totalItems={specializations.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
