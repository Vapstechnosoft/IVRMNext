"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { FormError, Label } from "@/components/ui/extension/field";
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
import { MultiSelect } from "@/components/ui/multi-select";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Database,
  Power,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getReligionCategoryMappingList,
  saveReligionCategoryMapping,
  editReligionCategoryMapping,
  activateDeactivateReligionCategoryMapping,
  testReligionCategoryMappingAPI,
} from "@/types/hrms/religion-category-mapping";
import type {
  ReligionCategoryMappingResponse,
  ReligionCategoryMappingDetail,
  ReligionCategoryMappingInput,
  ReligionItem,
  CasteItem,
  CastIdItem,
} from "@/types/hrms/religion-category-mapping";

interface ReligionCategoryMapping extends ReligionCategoryMappingDetail {
  // Extended from API response
}

type ReligionCategoryMappingForm = {
  IVRMMR_Id: number;
  IMCC_Ids: number[];
};

// Dropdown options are now loaded from API

export default function ReligionCategoryMappingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mappings, setMappings] = useState<ReligionCategoryMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId] = useState(4); // Default role ID
  const [religionOptions, setReligionOptions] = useState<ReligionItem[]>([]);
  const [casteOptions, setCasteOptions] = useState<CasteItem[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReligionCategoryMappingForm>({
    mode: "onChange",
    defaultValues: {
      IVRMMR_Id: 0,
      IMCC_Ids: [],
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadMappings();
  }, [roleId]);

  const loadMappings = async () => {
    try {
      setIsLoading(true);
      const response = await getReligionCategoryMappingList(0, 2);
      if (response.success && response.data) {
        // Set dropdown options
        setReligionOptions(response.data.religion_list || []);
        setCasteOptions(response.data.caste_list || []);

        // Set mappings data
        setMappings(response.data.get_masterlist || []);
        toast.success(
          `Loaded ${
            response.data.get_masterlist?.length || 0
          } religion category mappings`
        );
      } else {
        toast.error("Failed to load religion category mappings");
        setMappings([]);
        setReligionOptions([]);
        setCasteOptions([]);
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
      toast.error("Failed to load religion category mappings");
      setMappings([]);
      setReligionOptions([]);
      setCasteOptions([]);
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

  const onSubmit: SubmitHandler<ReligionCategoryMappingForm> = async (
    data: ReligionCategoryMappingForm
  ) => {
    try {
      if (!data.IVRMMR_Id || data.IVRMMR_Id === 0) {
        toast.error("Please select a religion");
        return;
      }
      if (!data.IMCC_Ids || data.IMCC_Ids.length === 0) {
        toast.error("Please select at least one caste category");
        return;
      }

      const inputData: ReligionCategoryMappingInput = {
        IRCC_Id: editingId || 0,
        MI_Id: 30,
        UserId: 0,
        IVRMMR_Id: data.IVRMMR_Id,
        IMCC_Id: data.IMCC_Ids[0] || 0,
        IRCC_ActiveFlg: true, // Default to active for new records
        IRCC_CreatedBy: 0,
        IRCC_UpdatedBy: 0,
        // Note: castid is not passed as API expects empty array
      };

      const response = await saveReligionCategoryMapping(inputData);

      if (response.success) {
        toast.success(
          editingId
            ? "Religion category mapping updated successfully"
            : "Religion category mapping created successfully"
        );
        loadMappings();
        handleFormClose();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving mapping:", error);
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (item: ReligionCategoryMapping) => {
    setEditingId(item.IRCC_Id);
    setValue("IVRMMR_Id", item.IVRMMR_Id);
    setValue("IMCC_Ids", [item.IMCC_Id]);
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
      const response = await activateDeactivateReligionCategoryMapping({
        IRCC_Id: id,
        IRCC_ActiveFlg: newStatus,
        UserId: 0,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the religion category mapping`
        );
        loadMappings();
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const handleTestAPI = async () => {
    try {
      const response = await testReligionCategoryMappingAPI(0, 2);
      if (response.success) {
        toast.success("API connection successful");
      } else {
        toast.error("API connection failed");
      }
    } catch (error) {
      console.error("API test error:", error);
      toast.error("API connection failed");
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Master Religion Category Mapping"
              description="Map religions to their respective caste categories"
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
              Add Religion Mapping
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Religion Cast Category Details"
          description="View, search, and manage all religion category mappings"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <ReligionCategoryMappingTable
            mappings={mappings}
            isLoading={isLoading}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            religionOptions={religionOptions}
            casteOptions={casteOptions}
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
                  ? "Update Religion Category Mapping"
                  : "Master Religion Category Mapping"
              }
              description="Fill in the details below to create a new religion category mapping"
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
                      {/* Religion Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="IVRMMR_Id">
                          Religion <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="IVRMMR_Id"
                          control={control}
                          rules={{ required: "Religion is required" }}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
                              value={field.value?.toString()}
                            >
                              <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="--search--" />
                              </SelectTrigger>
                              <SelectContent>
                                {religionOptions.map((religion) => (
                                  <SelectItem
                                    key={religion.IVRMMR_Id}
                                    value={religion.IVRMMR_Id.toString()}
                                  >
                                    {religion.IVRMMR_Name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.IVRMMR_Id && (
                          <p className="text-sm text-destructive">
                            {errors.IVRMMR_Id.message}
                          </p>
                        )}
                      </div>

                      {/* Caste Category Multi-Select */}
                      <div className="space-y-2">
                        <Label htmlFor="IMCC_Ids">
                          Caste Category{" "}
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="IMCC_Ids"
                          control={control}
                          rules={{
                            required: "At least one caste category is required",
                          }}
                          render={({ field }) => (
                            <MultiSelect
                              options={casteOptions.map((c) => ({
                                value: c.IMCC_Id.toString(),
                                label: c.IMCC_CategoryName,
                              }))}
                              onValueChange={(values) =>
                                field.onChange(values.map((v) => parseInt(v)))
                              }
                              defaultValue={
                                field.value?.map((v) => v.toString()) || []
                              }
                              placeholder="--Select Caste Categories--"
                              variant="default"
                              maxCount={3}
                            />
                          )}
                        />
                        {errors.IMCC_Ids && (
                          <p className="text-sm text-destructive">
                            {errors.IMCC_Ids.message}
                          </p>
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
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="order-2 sm:order-1 transition-all duration-200 hover:scale-105 w-fit"
                    >
                      Reset
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
                          {editingId ? "Update Mapping" : "Save Mapping"}
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

interface ReligionCategoryMappingTableProps {
  mappings: ReligionCategoryMapping[];
  isLoading: boolean;
  onEdit: (item: ReligionCategoryMapping) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  religionOptions: ReligionItem[];
  casteOptions: CasteItem[];
}

function ReligionCategoryMappingTable({
  mappings,
  isLoading,
  onEdit,
  onToggleActive,
  religionOptions,
  casteOptions,
}: ReligionCategoryMappingTableProps) {
  const columns: ColumnDef<ReligionCategoryMapping>[] = [
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
      accessorKey: "IRCC_Id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SL.No." />
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
      accessorKey: "IVRMMR_Name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Religion Name" />
      ),
      cell: ({ row }) => {
        const religionId = row.original.IVRMMR_Id;
        const religion = religionOptions.find(
          (r) => r.IVRMMR_Id === religionId
        );
        return (
          <div>{religion?.IVRMMR_Name || row.getValue("IVRMMR_Name")}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "IMCC_CategoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category Name" />
      ),
      cell: ({ row }) => {
        const casteId = row.original.IMCC_Id;
        const caste = casteOptions.find((c) => c.IMCC_Id === casteId);
        return (
          <div>
            {caste?.IMCC_CategoryName || row.getValue("IMCC_CategoryName")}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "IRCC_ActiveFlg",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("IRCC_ActiveFlg") as boolean;
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
      header: "Action",
      accessorFn: (row: any) => {
        return row;
      },
      enableSorting: false,
      cell: ({ cell }: { cell: any }) => {
        const item = cell.getValue() as ReligionCategoryMapping;
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
                    onToggleActive(item.IRCC_Id, item.IRCC_ActiveFlg)
                  }
                  className={`w-full justify-start ${
                    item.IRCC_ActiveFlg ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.IRCC_ActiveFlg ? "Deactivate" : "Activate"}
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
        data={mappings}
        totalItems={mappings.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
