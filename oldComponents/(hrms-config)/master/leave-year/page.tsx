"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { FormError, Label } from "@/components/ui/extension/field";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save,
  CalendarIcon,
  Power,
  RefreshCw,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getOnloadLeaveYearDetails,
  saveMasterLeaveYear,
  activateDeactivateMasterLeaveYear,
} from "@/types/hrms/master-leave-year";
import type {
  MasterLeaveYearResponse,
  LeaveYearDetail,
  MasterLeaveYearInput,
} from "@/types/hrms/master-leave-year";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface LeaveYear extends LeaveYearDetail {}

type LeaveYearForm = {
  leaveYear: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  orderNumber: number;
  roleId: number;
};

export default function LeaveYearMasterPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [leaveYears, setLeaveYears] = useState<LeaveYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId, setRoleId] = useState(30); // Default role ID
  const [isOrderEditing, setIsOrderEditing] = useState(false);
  const [orderValues, setOrderValues] = useState<Record<number, number>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LeaveYearForm>({
    mode: "onChange",
    defaultValues: {
      leaveYear: "",
      fromDate: undefined,
      toDate: undefined,
      orderNumber: 0,
      roleId: 30,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadLeaveYears();
  }, [roleId]);

  const loadLeaveYears = async () => {
    try {
      setIsLoading(true);
      const response = await getOnloadLeaveYearDetails(roleId);

      if (response.success && response.data) {
        // Sort by order number in ascending order
        const sortedLeaveYears = (response.data.leaveYearList || []).sort(
          (a: LeaveYear, b: LeaveYear) =>
            (a.HRMLY_LeaveYearOrder || 0) - (b.HRMLY_LeaveYearOrder || 0)
        );
        setLeaveYears(sortedLeaveYears);
        toast.success(`Loaded ${sortedLeaveYears.length} leave years`);
      } else {
        toast.error(response.message || "Failed to load leave years");
        setLeaveYears([]);
      }
    } catch (error) {
      console.error("Error loading leave years:", error);
      toast.error("Failed to load leave years");
      setLeaveYears([]);
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

  const onSubmit: SubmitHandler<LeaveYearForm> = async (
    data: LeaveYearForm
  ) => {
    try {
      // Prepare the data for the API
      const saveData: MasterLeaveYearInput = {
        HRMLY_Id: editingId || undefined,
        MI_Id: data.roleId,
        HRMLY_LeaveYear: data.leaveYear,
        HRMLY_FromDate: data.fromDate
          ? format(data.fromDate, "yyyy-MM-dd") + "T00:00:00"
          : "",
        HRMLY_ToDate: data.toDate
          ? format(data.toDate, "yyyy-MM-dd") + "T00:00:00"
          : "",
        HRMLY_ActiveFlag: true, // Default to active for new records
        HRMLY_LeaveYearOrder: data.orderNumber || 0,
      };

      console.log("Saving leave year data:", saveData);

      const response = await saveMasterLeaveYear(saveData);

      if (response.success) {
        toast.success(
          `Successfully ${editingId ? "updated" : "created"} leave year: ${
            data.leaveYear
          }`
        );
        handleFormClose();
        // Reload the data to show the new/updated item
        loadLeaveYears();
      } else {
        toast.error(response.message || "Failed to save leave year");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save leave year");
    }
  };

  const handleEdit = (item: LeaveYear) => {
    setEditingId(item.HRMLY_Id);
    setValue("leaveYear", item.HRMLY_LeaveYear);
    setValue(
      "fromDate",
      item.HRMLY_FromDate ? new Date(item.HRMLY_FromDate) : undefined
    );
    setValue(
      "toDate",
      item.HRMLY_ToDate ? new Date(item.HRMLY_ToDate) : undefined
    );
    setValue("orderNumber", item.HRMLY_LeaveYearOrder);
    setValue("roleId", item.MI_Id);
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
      const response = await activateDeactivateMasterLeaveYear({
        HRMLY_Id: id,
        HRMLY_ActiveFlag: newStatus,
        roleId: roleId,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the leave year record`
        );
        // Reload the data to reflect the changes
        loadLeaveYears();
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const handleSetOrderClick = () => {
    if (isOrderEditing) {
      // Save the order changes
      handleSaveOrder();
    } else {
      // Start editing mode
      setIsOrderEditing(true);
      // Initialize order values with current values
      const initialOrderValues: Record<number, number> = {};
      leaveYears.forEach((leaveYear) => {
        initialOrderValues[leaveYear.HRMLY_Id] =
          leaveYear.HRMLY_LeaveYearOrder || 0;
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

      // Update each leave year with new order
      const updatePromises = Object.entries(orderValues).map(
        async ([id, order]) => {
          const leaveYear = leaveYears.find(
            (ly) => ly.HRMLY_Id === parseInt(id)
          );
          if (leaveYear && leaveYear.HRMLY_LeaveYearOrder !== order) {
            const updateData: MasterLeaveYearInput = {
              HRMLY_Id: leaveYear.HRMLY_Id,
              MI_Id: leaveYear.MI_Id,
              HRMLY_LeaveYear: leaveYear.HRMLY_LeaveYear,
              HRMLY_FromDate: leaveYear.HRMLY_FromDate,
              HRMLY_ToDate: leaveYear.HRMLY_ToDate,
              HRMLY_ActiveFlag: leaveYear.HRMLY_ActiveFlag,
              HRMLY_LeaveYearOrder: order,
            };

            return saveMasterLeaveYear(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully updated order for ${successCount} leave years`
        );
        setIsOrderEditing(false);
        setOrderValues({});
        // Reload data to reflect changes
        loadLeaveYears();
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
              title="Master Leave Year Management"
              description="Manage leave years and periods for the organization"
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
              Add Leave Year
            </Button>
            <Button
              type="button"
              onClick={handleSetOrderClick}
              size="lg"
              variant="outline"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
            >
              <Save className="h-4 w-4" />
              {isOrderEditing ? "Save Order" : "Set Order"}
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Leave Years Data"
          description="View, search, and manage all leave year configurations"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <LeaveYearTable
            leaveYears={leaveYears}
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
              title={editingId ? "Update Leave Year" : "Add New Leave Year"}
              description="Fill in the details below to create a new leave year period"
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
                        label="Leave Year"
                        required
                        id="leaveYear"
                        placeholder="e.g., 2024-2025"
                        {...register("leaveYear", {
                          required: "Leave year is required",
                        })}
                        error={errors.leaveYear?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <InputText
                        label="Order Number"
                        required
                        id="orderNumber"
                        type="number"
                        placeholder="e.g., 1, 2, 3"
                        {...register("orderNumber", {
                          required: "Order number is required",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Order number must be at least 1",
                          },
                        })}
                        error={errors.orderNumber?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {/* From Date Calendar */}
                      <div className="space-y-2">
                        <Label htmlFor="fromDate">
                          From Date <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="fromDate"
                          control={control}
                          rules={{ required: "From date is required" }}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal transition-colors focus:ring-2 focus:ring-primary/20",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Select Date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors.fromDate && (
                          <FormError>{errors.fromDate.message}</FormError>
                        )}
                      </div>

                      {/* To Date Calendar */}
                      <div className="space-y-2">
                        <Label htmlFor="toDate">
                          To Date <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="toDate"
                          control={control}
                          rules={{ required: "To date is required" }}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal transition-colors focus:ring-2 focus:ring-primary/20",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Select Date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors.toDate && (
                          <FormError>{errors.toDate.message}</FormError>
                        )}
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
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          {editingId ? "Update Leave Year" : "Save Leave Year"}
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

interface LeaveYearTableProps {
  leaveYears: LeaveYear[];
  isLoading: boolean;
  onEdit: (item: LeaveYear) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  isOrderEditing: boolean;
  orderValues: Record<number, number>;
  onOrderChange: (id: number, value: number) => void;
}

function LeaveYearTable({
  leaveYears,
  isLoading,
  onEdit,
  onToggleActive,
  isOrderEditing,
  orderValues,
  onOrderChange,
}: LeaveYearTableProps) {
  const columns: ColumnDef<LeaveYear>[] = [
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
      accessorKey: "HRMLY_Id",
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
      accessorKey: "HRMLY_LeaveYearOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => {
        const id = row.original.HRMLY_Id;
        const currentOrder = row.getValue("HRMLY_LeaveYearOrder") as number;

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
      accessorKey: "HRMLY_LeaveYear",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Leave Year" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMLY_LeaveYear")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMLY_FromDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From Date" />
      ),
      cell: ({ row }) => {
        const fromDate = row.getValue("HRMLY_FromDate") as string;
        return (
          <div>{fromDate ? new Date(fromDate).toLocaleDateString() : "-"}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMLY_ToDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To Date" />
      ),
      cell: ({ row }) => {
        const toDate = row.getValue("HRMLY_ToDate") as string;
        return (
          <div>{toDate ? new Date(toDate).toLocaleDateString() : "-"}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMLY_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMLY_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMLY_ActiveFlag") ? "Active" : "Inactive"}
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
        const item = cell.getValue() as LeaveYear;
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
                    onToggleActive(item.HRMLY_Id, item.HRMLY_ActiveFlag)
                  }
                  className={`w-full justify-start ${
                    item.HRMLY_ActiveFlag ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.HRMLY_ActiveFlag ? "Deactivate" : "Activate"}
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
        data={leaveYears}
        totalItems={leaveYears.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
