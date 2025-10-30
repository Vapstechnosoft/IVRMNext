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
  RefreshCw,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  getOnloadLoanDetails,
  saveMasterLoan,
  editMasterLoan,
  activateDeactivateMasterLoan,
} from "@/types/hrms/master-loan";
import type {
  MasterLoanResponse,
  MasterLoanDetail,
  MasterLoanInput,
} from "@/types/hrms/master-loan";

interface Loan extends MasterLoanDetail {
  // Extended from API response
}

type LoanForm = {
  HRML_LoanType: string;
  HRML_Max: number;
  HRMLN_ActiveFlag: boolean;
};

export default function LoanMasterPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId] = useState(4); // Default role ID
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoanForm>({
    mode: "onChange",
    defaultValues: {
      HRML_LoanType: "",
      HRML_Max: 0,
      HRMLN_ActiveFlag: true,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadLoans();
  }, [roleId]);

  const loadLoans = async () => {
    try {
      setIsLoading(true);
      const response = await getOnloadLoanDetails(roleId);
      if (response.success && response.data) {
        setLoans(response.data.gmasterloanList || []);
        toast.success(
          `Loaded ${response.data.gmasterloanList?.length || 0} loan types`
        );
      } else {
        toast.error("Failed to load loan types");
      }
    } catch (error) {
      console.error("Error loading loans:", error);
      toast.error("Failed to load loan types");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    reset();
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
    reset();
  };

  const onSubmit: SubmitHandler<LoanForm> = async (data: LoanForm) => {
    try {
      const inputData: MasterLoanInput = {
        hrmlN_Id: editingId || undefined,
        mI_Id: 30, // Set MI_Id to 30 as specified
        hrmL_LoanType: data.HRML_LoanType,
        hrmL_Max: data.HRML_Max,
        hrmlN_ActiveFlag: true, // Always set to true by default
      };

      const response = editingId
        ? await editMasterLoan(inputData)
        : await saveMasterLoan(inputData);

      if (response.success) {
        toast.success(
          editingId
            ? "Loan type updated successfully"
            : "Loan type created successfully"
        );
        loadLoans();
        handleFormClose();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving loan:", error);
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (item: Loan) => {
    setEditingId(item.HRMLN_Id);
    setValue("HRML_LoanType", item.HRML_LoanType);
    setValue("HRML_Max", item.HRML_Max);
    setValue("HRMLN_ActiveFlag", item.HRMLN_ActiveFlag);
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
      const response = await activateDeactivateMasterLoan({
        HRMLN_Id: id,
        HRMLN_ActiveFlag: newStatus,
        roleId: roleId,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the loan type`
        );
        loadLoans();
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
              title="Master Loan Management"
              description="Manage loan types and configurations for employees"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAddClick}
              size="lg"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
            >
              <Plus className="h-4 w-4" />
              Add Loan Type
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Loan Types Data"
          description="View, search, and manage all loan type configurations"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <LoanTable
            loans={loans}
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
              title={editingId ? "Update Loan Type" : "Add New Loan Type"}
              description="Fill in the details below to create a new loan type"
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
                        label="Loan Type"
                        required
                        id="HRML_LoanType"
                        placeholder="e.g., Personal Loan, Home Loan"
                        {...register("HRML_LoanType", {
                          required: "Loan type is required",
                        })}
                        error={errors.HRML_LoanType?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <InputText
                        label="Max Loan Amount"
                        type="number"
                        required
                        id="HRML_Max"
                        placeholder="e.g., 500000"
                        {...register("HRML_Max", {
                          required: "Max loan amount is required",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Max loan amount must be positive",
                          },
                        })}
                        error={errors.HRML_Max?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
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
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          {editingId ? "Update Loan Type" : "Save Loan Type"}
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

interface LoanTableProps {
  loans: Loan[];
  isLoading: boolean;
  onEdit: (item: Loan) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

function LoanTable({
  loans,
  isLoading,
  onEdit,
  onToggleActive,
}: LoanTableProps) {
  const columns: ColumnDef<Loan>[] = [
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
      accessorKey: "HRMLN_Id",
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
      accessorKey: "HRML_LoanType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loan Type" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRML_LoanType")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRML_Max",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Max Loan Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("HRML_Max") as number;
        // Handle null/undefined values to prevent toLocaleString errors
        const displayAmount = amount ?? 0;
        return <div>₹{displayAmount.toLocaleString("en-IN")}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMLN_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("HRMLN_ActiveFlag") as boolean;
        return (
          <Badge
            variant={isActive ? "success" : "destructive"}
            className="text-xs"
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
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
        const item = cell.getValue() as Loan;
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
                    onToggleActive(item.HRMLN_Id, item.HRMLN_ActiveFlag)
                  }
                  className={`w-full justify-start ${
                    item.HRMLN_ActiveFlag ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.HRMLN_ActiveFlag ? "Deactivate" : "Activate"}
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
        data={loans}
        totalItems={loans.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
