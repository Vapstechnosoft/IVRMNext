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
  getOnloadBankDetails,
  saveMasterBank,
  activateDeactivateMasterBank,
} from "@/types/hrms/master-bank";
import type {
  MasterBankResponse,
  MasterBankInput,
} from "@/types/hrms/master-bank";

interface Bank {
  HRMBD_Id: number;
  MI_Id: number;
  HRMBD_BankName: string;
  HRMBD_BankAccountNo: string;
  HRMBD_BankAddress: string;
  HRMBD_BranchName: string;
  HRMBD_IFSCCode: string;
  HRMBD_ActiveFlag: boolean;
}

type BankForm = {
  bankName: string;
  accountNumber: string;
  bankAddress: string;
  branchName: string;
  ifscCode: string;
  roleId: number;
};

export default function BankPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId, setRoleId] = useState(2); // Default role ID
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BankForm>({
    mode: "onChange",
    defaultValues: {
      roleId: 2,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadBanks();
  }, [roleId]);

  const loadBanks = async () => {
    try {
      setIsLoading(true);

      // Use the onload get details endpoint
      const response = await getOnloadBankDetails(roleId);

      if (response.success && response.data) {
        // bankdetailList now contains bank objects with full details
        const bankList = response.data.bankdetailList || [];
        setBanks(bankList);
        toast.success(`Loaded ${bankList.length} banks`);
      } else {
        toast.error(response.message || "Failed to load banks");
        setBanks([]);
      }
    } catch (error) {
      console.error("Error loading banks:", error);
      toast.error("Failed to load banks");
      setBanks([]);
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

  const onSubmit: SubmitHandler<BankForm> = async (data: BankForm) => {
    try {
      // Prepare the data for the API
      const saveData: MasterBankInput = {
        HRMBD_Id: editingId || 0,
        MI_Id: data.roleId,
        HRMBD_BankName: data.bankName,
        HRMBD_BankAccountNo: data.accountNumber,
        HRMBD_BankAddress: data.bankAddress,
        HRMBD_BranchName: data.branchName,
        HRMBD_IFSCCode: data.ifscCode,
        HRMBD_ActiveFlag: true, // Default to active for new records
        roleId: data.roleId,
      };

      console.log(editingId ? "Updating" : "Creating", "bank data:", saveData);

      const response = await saveMasterBank(saveData);

      if (response.success) {
        toast.success(
          `Successfully ${editingId ? "updated" : "created"} bank: ${
            data.bankName
          }`
        );
        handleFormClose();
        // Reload the data to show the new/updated item
        loadBanks();
      } else {
        toast.error(response.message || "Failed to save bank");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save bank");
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingId(bank.HRMBD_Id);
    setValue("bankName", bank.HRMBD_BankName);
    setValue("accountNumber", bank.HRMBD_BankAccountNo);
    setValue("bankAddress", bank.HRMBD_BankAddress);
    setValue("branchName", bank.HRMBD_BranchName);
    setValue("ifscCode", bank.HRMBD_IFSCCode);
    setValue("roleId", bank.MI_Id);
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
      const response = await activateDeactivateMasterBank({
        HRMBD_Id: id,
        HRMBD_ActiveFlag: newStatus,
        roleId: roleId,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the bank record`
        );
        // Reload the data to reflect the changes
        loadBanks();
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
              title="Master Bank Management"
              description="Manage bank information for the organization"
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
              Add Master Bank
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Master Banks Data"
          description="View, search, and manage all bank information in the system"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <BankTable
            banks={banks}
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
              title={editingId ? "Update Master Bank" : "Add New Master Bank"}
              description="Fill in the details below to create a new bank record"
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
                        label="Bank Name"
                        required
                        id="bankName"
                        {...register("bankName", {
                          required: "Bank name is required",
                        })}
                        error={errors.bankName?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <InputText
                        label="Account Number"
                        required
                        id="accountNumber"
                        {...register("accountNumber", {
                          required: "Account number is required",
                        })}
                        error={errors.accountNumber?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <InputText
                        label="Bank Address"
                        required
                        id="bankAddress"
                        {...register("bankAddress", {
                          required: "Bank address is required",
                        })}
                        error={errors.bankAddress?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <InputText
                        label="Branch Name"
                        required
                        id="branchName"
                        {...register("branchName", {
                          required: "Branch name is required",
                        })}
                        error={errors.branchName?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <InputText
                        label="IFSC Code"
                        required
                        id="ifscCode"
                        {...register("ifscCode", {
                          required: "IFSC code is required",
                        })}
                        error={errors.ifscCode?.message}
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
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          {editingId
                            ? "Update Master Bank"
                            : "Save Master Bank"}
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

interface BankTableProps {
  banks: Bank[];
  isLoading: boolean;
  onEdit: (bank: Bank) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

function BankTable({
  banks,
  isLoading,
  onEdit,
  onToggleActive,
}: BankTableProps) {
  const bankColumns: ColumnDef<Bank>[] = [
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
      accessorKey: "HRMBD_Id",
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
      accessorKey: "HRMBD_BankName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMBD_BankName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMBD_BankAccountNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account Number" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMBD_BankAccountNo")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMBD_BankAddress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank Address" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMBD_BankAddress")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMBD_BranchName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMBD_BranchName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMBD_IFSCCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IFSC Code" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMBD_IFSCCode")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMBD_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMBD_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMBD_ActiveFlag") ? "Active" : "Inactive"}
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
        const bank = cell.getValue() as Bank;
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
                  onClick={() => onEdit(bank)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    onToggleActive(bank.HRMBD_Id, bank.HRMBD_ActiveFlag)
                  }
                  className={`w-full justify-start ${
                    bank.HRMBD_ActiveFlag ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {bank.HRMBD_ActiveFlag ? "Deactivate" : "Activate"}
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
        columns={bankColumns}
        data={banks}
        totalItems={banks.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
