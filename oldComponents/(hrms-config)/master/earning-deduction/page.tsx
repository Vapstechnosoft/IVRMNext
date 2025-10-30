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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Power,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getOnloadEarningsDeductionsDetails,
  saveMasterEarningsDeduction,
  activateDeactivateEarningsDeduction,
} from "@/types/hrms/master-earnings-deductions";
import { formatTextValue, formatNumericValue } from "@/lib/data-validation";

type Category = "Earning" | "Deduction" | "Arrear" | "Gross";
type AmountType = "Amount" | "Percentage";

interface EarningDeductionForm {
  name: string;
  type: string;
  roundingTo: string;
  category: Category;
  amountType: AmountType;
  value: string;
  revisedFlag: boolean;
  order: number;
  roleId: number;
}

export default function EarningDeductionMasterPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [earningDeductions, setEarningDeductions] = useState<
    EarningsDeductionDetail[]
  >([]);
  const [earDedTypes, setEarDedTypes] = useState<EarnDedType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId] = useState(4); // Default role ID
  const [filterType, setFilterType] = useState<
    "all" | "earning" | "deduction" | "arrear" | "gross"
  >("all");
  const formRef = useRef<HTMLDivElement>(null);

  // Order editing states
  const [isOrderEditing, setIsOrderEditing] = useState(false);
  const [orderValues, setOrderValues] = useState<Record<number, number>>({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EarningDeductionForm>({
    mode: "onChange",
    defaultValues: {
      roleId: 4,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadEarningDeductions();
  }, [roleId, filterType]);

  const loadEarningDeductions = async () => {
    try {
      setIsLoading(true);
      const response = await getOnloadEarningsDeductionsDetails(roleId);

      if (response.success && response.data) {
        let filteredData = response.data.earningdetectionList || [];

        // Apply filter based on selected type
        switch (filterType) {
          case "earning":
            filteredData = filteredData.filter(
              (item) => item.HRMED_EarnDedFlag === "Earning"
            );
            break;
          case "deduction":
            filteredData = filteredData.filter(
              (item) => item.HRMED_EarnDedFlag === "Deduction"
            );
            break;
          case "arrear":
            filteredData = filteredData.filter(
              (item) => item.HRMED_EarnDedFlag === "Arrear"
            );
            break;
          case "gross":
            filteredData = filteredData.filter(
              (item) => item.HRMED_EarnDedFlag === "Gross"
            );
            break;
          default:
            // Show all items
            break;
        }

        // Sort by order number in ascending order
        filteredData = filteredData.sort(
          (a, b) => (a.HRMED_Order || 0) - (b.HRMED_Order || 0)
        );

        setEarningDeductions(filteredData);
        setEarDedTypes(response.data.eardettypeDropdown || []);
        toast.success(`Loaded ${filteredData.length} items`);
      } else {
        toast.error(
          response.message || "Failed to load earnings and deductions"
        );
        setEarningDeductions([]);
        setEarDedTypes([]);
      }
    } catch (error) {
      console.error("Error loading earnings and deductions:", error);
      toast.error("Failed to load earnings and deductions");
      setEarningDeductions([]);
      setEarDedTypes([]);
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

  const onSubmit: SubmitHandler<EarningDeductionForm> = async (
    data: EarningDeductionForm
  ) => {
    try {
      // Prepare the data for the API
      const saveData = {
        HRMED_Id: editingId || 0,
        MI_Id: 30, // Default MI_Id
        HRMED_Name: data.name,
        HRMED_EDTypeFlag: data.type || "",
        HRMED_EarnDedFlag: data.category,
        HRMED_AmountPercentFlag: data.amountType,
        HRMED_AmountPercent: data.value,
        HRMED_ActiveFlag: true, // Default to active when creating
        HRMED_RoundOffFlag: data.roundingTo || "",
        earningdetectionList: [],
        retrunMsg: "",
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: "",
        HREED_Amount: null,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: [],
        HRMED_Order: data.order,
      };

      console.log(editingId ? "Editing" : "Saving", "data:", saveData);

      // Use unified save endpoint for both create and edit
      const response = await saveMasterEarningsDeduction(saveData);

      if (response.success) {
        toast.success(
          `Successfully ${
            editingId ? "updated" : "created"
          } earning/deduction: ${data.name}`
        );
        handleFormClose();
        // Reload the data to show the new/updated item
        loadEarningDeductions();
      } else {
        toast.error(response.message || "Failed to save earning/deduction");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save earning/deduction");
    }
  };

  const handleEdit = (item: EarningsDeductionDetail) => {
    setEditingId(item.HRMED_Id);
    setValue("name", item.HRMED_Name || "");
    setValue("type", item.HRMED_EDTypeFlag || "");
    setValue("roundingTo", item.HRMED_RoundOffFlag || "");
    setValue("category", (item.HRMED_EarnDedFlag as Category) || "Earning");
    setValue(
      "amountType",
      (item.HRMED_AmountPercentFlag as AmountType) || "Amount"
    );
    setValue("value", item.HRMED_AmountPercent || "0");
    setValue("revisedFlag", false); // Default value
    setValue("order", item.HRMED_Order || 1);
    setValue("roleId", roleId);
    setIsFormOpen(true);
    // Scroll to form after state update
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const handleToggleActive = async (item: EarningsDeductionDetail) => {
    try {
      const newStatus = !item.HRMED_ActiveFlag;

      const response = await activateDeactivateEarningsDeduction({
        HRMED_Id: item.HRMED_Id,
        HRMED_Name: item.HRMED_Name || "",
        HRMED_EDTypeFlag: item.HRMED_EDTypeFlag || "",
        HRMED_EarnDedFlag: item.HRMED_EarnDedFlag || "",
        HRMED_AmountPercentFlag: item.HRMED_AmountPercentFlag || "",
        HRMED_AmountPercent: item.HRMED_AmountPercent || "",
        HRMED_ActiveFlag: newStatus,
        HRMED_RoundOffFlag: item.HRMED_RoundOffFlag || "",
        earningdetectionList: [],
        retrunMsg: "",
        earningList: [],
        detectionList: [],
        eardettypelist: [],
        eardettypeDropdown: [],
        perc_OfDTO: [],
        selectedearningdetectionList: [],
        percentOff: "",
        HREED_Amount: null,
        arrearlist: [],
        grosslist: [],
        EarningsDeductionsDTO: [],
        HRMED_Order: item.HRMED_Order || null,
      });

      if (response.success) {
        toast.success(
          `Successfully ${newStatus ? "activated" : "deactivated"} the record`
        );
        // Reload the data to reflect the changes
        loadEarningDeductions();
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  // Order Management Functions
  const handleSetOrderClick = () => {
    if (isOrderEditing) {
      // Save the order changes
      handleSaveOrder();
    } else {
      // Start editing mode
      setIsOrderEditing(true);
      // Initialize order values with current values
      const initialOrderValues: Record<number, number> = {};
      earningDeductions.forEach((item) => {
        initialOrderValues[item.HRMED_Id] = item.HRMED_Order || 0;
      });
      setOrderValues(initialOrderValues);
      toast.info(
        "Order editing mode enabled. Click Set Order again to save changes."
      );
    }
  };

  const handleOrderChange = (id: number, value: number) => {
    setOrderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveOrder = async () => {
    try {
      setIsLoading(true);

      // Update each earning/deduction with new order
      const updatePromises = Object.entries(orderValues).map(
        async ([id, order]) => {
          const item = earningDeductions.find(
            (ed) => ed.HRMED_Id === parseInt(id)
          );
          if (item && item.HRMED_Order !== order) {
            const updateData = {
              HRMED_Id: item.HRMED_Id,
              MI_Id: roleId,
              HRMED_Name: item.HRMED_Name,
              HRMED_EDTypeFlag: item.HRMED_EDTypeFlag,
              HRMED_EarnDedFlag: item.HRMED_EarnDedFlag,
              HRMED_AmountPercentFlag: item.HRMED_AmountPercentFlag,
              HRMED_AmountPercent: item.HRMED_AmountPercent,
              HRMED_ActiveFlag: item.HRMED_ActiveFlag,
              HRMED_RoundOffFlag: item.HRMED_RoundOffFlag,
              earningdetectionList: [],
              retrunMsg: "",
              earningList: [],
              detectionList: [],
              eardettypelist: [],
              eardettypeDropdown: [],
              perc_OfDTO: [],
              selectedearningdetectionList: [],
              percentOff: "",
              HREED_Amount: null,
              arrearlist: [],
              grosslist: [],
              EarningsDeductionsDTO: [],
              HRMED_Order: order,
            };

            return saveMasterEarningsDeduction(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully updated order for ${successCount} earning/deduction items`
        );
        setIsOrderEditing(false);
        setOrderValues({});
        // Reload data to reflect changes
        loadEarningDeductions();
      } else {
        toast.info("No order changes detected");
        setIsOrderEditing(false);
        setOrderValues({});
      }
    } catch (error: any) {
      console.error("Save order error:", error);
      toast.error("Failed to save order changes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Master Earning & Deduction Management"
              description="Manage earning and deduction components for payroll from HRMS API"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={filterType}
              onValueChange={(value: any) => setFilterType(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="earning">Earnings</SelectItem>
                <SelectItem value="deduction">Deductions</SelectItem>
                <SelectItem value="arrear">Arrears</SelectItem>
                <SelectItem value="gross">Gross</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={handleSetOrderClick}
              variant={isOrderEditing ? "default" : "outline"}
              size="lg"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
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

            <Button
              type="button"
              onClick={handleAddClick}
              size="lg"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
            >
              <Plus className="h-4 w-4" />
              Add Earning/Deduction
            </Button>
          </div>
        </div>

        {/* Data Table Section */}
        <CollapsibleSection
          title="Earning & Deduction Data"
          description={`View, search, and manage all earning and deduction components (Role ID: ${roleId})`}
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <EarningDeductionTable
            earningDeductions={earningDeductions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            isOrderEditing={isOrderEditing}
            orderValues={orderValues}
            onOrderChange={handleOrderChange}
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
                  ? "Update Earning/Deduction"
                  : "Add New Earning/Deduction"
              }
              description="Fill in the details below to create a new earning or deduction component"
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
                        label="Name"
                        required
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        error={errors.name?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <InputText
                        label="Type"
                        required
                        id="type"
                        {...register("type", { required: "Type is required" })}
                        error={errors.type?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <Controller
                        name="roundingTo"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Rounding To
                            </label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Select Rounding" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RoundUp">
                                  Round Up
                                </SelectItem>
                                <SelectItem value="RoundDown">
                                  Round Down
                                </SelectItem>
                                <SelectItem value="HalfRoundUp">
                                  Half Round Up
                                </SelectItem>
                                <SelectItem value="HalfRoundDown">
                                  Half Round Down
                                </SelectItem>
                                <SelectItem value="Ceiling">Ceiling</SelectItem>
                                <SelectItem value="Floor">Floor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />
                      <Controller
                        name="category"
                        control={control}
                        rules={{ required: "Category is required" }}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Category *
                            </label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Earning">Earning</SelectItem>
                                <SelectItem value="Deduction">
                                  Deduction
                                </SelectItem>
                                <SelectItem value="Arrear">Arrear</SelectItem>
                                <SelectItem value="Gross">Gross</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.category && (
                              <p className="text-sm text-destructive">
                                {errors.category.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <Controller
                        name="amountType"
                        control={control}
                        rules={{ required: "Amount type is required" }}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Amount Type *
                            </label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Select Amount Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Amount">Amount</SelectItem>
                                <SelectItem value="Percentage">
                                  Percentage
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.amountType && (
                              <p className="text-sm text-destructive">
                                {errors.amountType.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                      <InputText
                        label="Value"
                        required
                        id="value"
                        {...register("value", {
                          required: "Value is required",
                        })}
                        error={errors.value?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <InputText
                        label="Order"
                        required
                        id="order"
                        type="number"
                        {...register("order", {
                          required: "Order is required",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Order must be at least 1",
                          },
                        })}
                        error={errors.order?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2 flex items-center">
                      <input
                        type="checkbox"
                        id="revisedFlag"
                        {...register("revisedFlag")}
                        className="text-primary focus:ring-primary border-border mr-2"
                      />
                      <label
                        htmlFor="revisedFlag"
                        className="text-sm font-medium text-foreground"
                      >
                        Revised Flag
                      </label>
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
                            ? "Update Earning/Deduction"
                            : "Save Earning/Deduction"}
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

interface EarningDeductionTableProps {
  earningDeductions: EarningsDeductionDetail[];
  isLoading: boolean;
  onEdit: (item: EarningsDeductionDetail) => void;
  onToggleActive: (item: EarningsDeductionDetail) => void;
  isOrderEditing: boolean;
  orderValues: Record<number, number>;
  onOrderChange: (id: number, value: number) => void;
}

function EarningDeductionTable({
  earningDeductions,
  isLoading,
  onEdit,
  onToggleActive,
  isOrderEditing,
  orderValues,
  onOrderChange,
}: EarningDeductionTableProps) {
  const columns: ColumnDef<EarningsDeductionDetail>[] = [
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
      accessorKey: "HRMED_Id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMED_Id")}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "HRMED_Name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("HRMED_Name") as string;
        return <div>{formatTextValue(name)}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMED_EDTypeFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("HRMED_EDTypeFlag") as string;
        return <div>{formatTextValue(type)}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMED_EarnDedFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const category = row.getValue("HRMED_EarnDedFlag") as string;
        let variant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | "success" = "default";

        switch (category) {
          case "Earning":
            variant = "success";
            break;
          case "Deduction":
            variant = "destructive";
            break;
          case "Arrear":
            variant = "secondary";
            break;
          case "Gross":
            variant = "outline";
            break;
          default:
            variant = "default";
        }

        return <Badge variant={variant}>{category || "-"}</Badge>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMED_AmountPercentFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount Type" />
      ),
      cell: ({ row }) => (
        <div>{row.getValue("HRMED_AmountPercentFlag") || "-"}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMED_AmountPercent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("HRMED_AmountPercent") as string | number;
        return <div>{formatNumericValue(value)}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMED_Order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => {
        const id = row.original.HRMED_Id;
        const currentOrder = row.getValue("HRMED_Order") as number;

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
      accessorKey: "HRMED_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMED_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMED_ActiveFlag") ? "Active" : "Inactive"}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMED_Order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMED_Order") || "-"}</div>,
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
        const item = cell.getValue() as EarningsDeductionDetail;
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
                  onClick={() => onToggleActive(item)}
                  className={`w-full justify-start ${
                    item.HRMED_ActiveFlag ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.HRMED_ActiveFlag ? "Deactivate" : "Activate"}
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
        data={earningDeductions}
        totalItems={earningDeductions.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
