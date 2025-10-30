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
  Power,
  X,
  Save,
  Database,
  RefreshCw,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getGroupDeptDessgMappingList,
  saveGroupDeptDessgMapping,
  activateDeactivateGroupDeptDessgMapping,
  testGroupDeptDessgMappingAPI,
} from "@/types/hrms/group-dept-dessg-mapping";
import type {
  GroupDeptDessgMappingDetail,
  GroupTypeDropdown,
  DepartmentDropdown,
  DesignationDropdown,
  GroupDeptDessgMappingInput,
} from "@/types/hrms/group-dept-dessg-mapping";

type GroupDeptDessgMappingForm = {
  hrmgT_Id: number;
  hrmD_Id: number;
  hrmdeS_Ids: number[];
};

export default function GroupDeptDessgMappingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mappings, setMappings] = useState<GroupDeptDessgMappingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId] = useState(4); // Default role ID
  const formRef = useRef<HTMLDivElement>(null);

  // Dropdown data
  const [groupTypes, setGroupTypes] = useState<GroupTypeDropdown[]>([]);
  const [departments, setDepartments] = useState<DepartmentDropdown[]>([]);
  const [designations, setDesignations] = useState<DesignationDropdown[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GroupDeptDessgMappingForm>({
    mode: "onChange",
    defaultValues: {
      hrmgT_Id: 0,
      hrmD_Id: 0,
      hrmdeS_Ids: [],
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadMappings();
  }, [roleId]);

  const loadMappings = async () => {
    try {
      setIsLoading(true);
      const response = await getGroupDeptDessgMappingList(roleId);
      if (response.success && response.data) {
        // Sort mappings by Group Type Order, then Department Order, then Designation Order
        const sortedMappings = (response.data.gridviewdata || []).sort(
          (a, b) => {
            // First sort by Group Type Order
            const groupTypeA = response.data.groupTypedropdown?.find(
              (gt) => gt.HRMGT_Id === a.HRMGT_Id
            );
            const groupTypeB = response.data.groupTypedropdown?.find(
              (gt) => gt.HRMGT_Id === b.HRMGT_Id
            );
            const groupTypeOrderA = groupTypeA?.HRMGT_Order || 0;
            const groupTypeOrderB = groupTypeB?.HRMGT_Order || 0;

            if (groupTypeOrderA !== groupTypeOrderB) {
              return groupTypeOrderA - groupTypeOrderB;
            }

            // Then sort by Department Order
            const deptA = response.data.departmentdropdown?.find(
              (d) => d.HRMD_Id === a.HRMD_Id
            );
            const deptB = response.data.departmentdropdown?.find(
              (d) => d.HRMD_Id === b.HRMD_Id
            );
            const deptOrderA = deptA?.HRMD_Order || 0;
            const deptOrderB = deptB?.HRMD_Order || 0;

            if (deptOrderA !== deptOrderB) {
              return deptOrderA - deptOrderB;
            }

            // Finally sort by Designation Order
            const desgA = response.data.designationdropdown?.find(
              (d) => d.HRMDES_Id === a.HRMDES_Id
            );
            const desgB = response.data.designationdropdown?.find(
              (d) => d.HRMDES_Id === b.HRMDES_Id
            );
            const desgOrderA = desgA?.HRMDES_Order || 0;
            const desgOrderB = desgB?.HRMDES_Order || 0;

            return desgOrderA - desgOrderB;
          }
        );

        setMappings(sortedMappings);
        setGroupTypes(response.data.groupTypedropdown || []);
        setDepartments(response.data.departmentdropdown || []);
        setDesignations(response.data.designationdropdown || []);
        toast.success(
          `Loaded ${sortedMappings.length} mappings (sorted by Group Type → Department → Designation order)`
        );
      } else {
        toast.error("Failed to load group department designation mappings");
        setMappings([]);
        setGroupTypes([]);
        setDepartments([]);
        setDesignations([]);
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
      toast.error("Failed to load group department designation mappings");
      setMappings([]);
      setGroupTypes([]);
      setDepartments([]);
      setDesignations([]);
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

  const onSubmit: SubmitHandler<GroupDeptDessgMappingForm> = async (
    data: GroupDeptDessgMappingForm
  ) => {
    try {
      if (!data.hrmgT_Id || data.hrmgT_Id === 0) {
        toast.error("Please select a group type");
        return;
      }
      if (!data.hrmD_Id || data.hrmD_Id === 0) {
        toast.error("Please select a department");
        return;
      }
      if (!data.hrmdeS_Ids || data.hrmdeS_Ids.length === 0) {
        toast.error("Please select at least one designation");
        return;
      }

      const inputData: GroupDeptDessgMappingInput = {
        hrgtddS_Id: editingId || 0,
        mI_Id: roleId,
        hrmgT_Id: data.hrmgT_Id,
        hrmD_Id: data.hrmD_Id,
        hrmdeS_Id: 0,
        hrgtddS_ActiveFlg: true, // Default to active for new records
        hrgtddS_CreatedBy: 0,
        hrgtddS_UpdatedBy: 0,
        hrgtddS_CreatedDate: "0001-01-01T00:00:00",
        hrgtddS_UpdatedDate: "0001-01-01T00:00:00",
        groupTypedropdown: null,
        departmentdropdown: null,
        designationdropdown: null,
        gridviewdata: null,
        editlist: null,
        designationids: data.hrmdeS_Ids,
        logInUserId: 13633,
        hrmgT_EmployeeGroupType: null,
        hrmD_DepartmentName: null,
        hrmdeS_DesignationName: null,
        returnval: false,
        msg: null,
      };

      const response = await saveGroupDeptDessgMapping(inputData);

      if (response.success) {
        toast.success(
          editingId
            ? "Group department designation mapping updated successfully"
            : "Group department designation mapping created successfully"
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

  const handleEdit = (item: GroupDeptDessgMappingDetail) => {
    setEditingId(item.HRGTDDS_Id);
    setValue("hrmgT_Id", item.HRMGT_Id);
    setValue("hrmD_Id", item.HRMD_Id);
    setValue("hrmdeS_Ids", [item.HRMDES_Id]);
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
      const response = await activateDeactivateGroupDeptDessgMapping({
        HRGTDDS_Id: id,
        HRGTDDS_ActiveFlg: newStatus,
        LogInUserId: 5,
      });

      if (response.success) {
        toast.success(
          `Successfully ${newStatus ? "activated" : "deactivated"} the mapping`
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

  const handleReset = () => {
    reset();
  };

  const handleTestAPI = async () => {
    try {
      setIsLoading(true);
      const response = await testGroupDeptDessgMappingAPI(roleId);
      if (response.success) {
        toast.success("API connection successful");
      } else {
        toast.error("API connection failed");
      }
    } catch (error) {
      console.error("API test error:", error);
      toast.error("API connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert designations to multiselect format
  const designationOptions = designations.map((d) => ({
    value: d.HRMDES_Id.toString(),
    label: d.HRMDES_DesignationName,
  }));

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Group Department Designation Mapping"
              description="Map group types to departments and their respective designations"
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
              Add Group Mapping
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Group Department Designation Mapping Details"
          description="View, search, and manage all group department designation mappings. Data is automatically sorted by Group Type Order → Department Order → Designation Order"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <GroupDeptDessgMappingTable
            mappings={mappings}
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
                  ? "Update Group Department Designation Mapping"
                  : "Group Department Designation Mapping"
              }
              description="Fill in the details below to create a new group department designation mapping"
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
                    <div className="grid grid-cols-1 gap-4">
                      {/* Group Type Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="hrmgT_Id">
                          Group Type{" "}
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="hrmgT_Id"
                          control={control}
                          rules={{
                            required: "Group type is required",
                            min: {
                              value: 1,
                              message: "Please select a group type",
                            },
                          }}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString() || ""}
                            >
                              <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="--Select Group Type--" />
                              </SelectTrigger>
                              <SelectContent>
                                {groupTypes.map((groupType) => (
                                  <SelectItem
                                    key={groupType.HRMGT_Id}
                                    value={groupType.HRMGT_Id.toString()}
                                  >
                                    {groupType.HRMGT_EmployeeGroupType}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.hrmgT_Id && (
                          <p className="text-sm text-destructive">
                            {errors.hrmgT_Id.message}
                          </p>
                        )}
                      </div>

                      {/* Department Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="hrmD_Id">
                          Department{" "}
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="hrmD_Id"
                          control={control}
                          rules={{
                            required: "Department is required",
                            min: {
                              value: 1,
                              message: "Please select a department",
                            },
                          }}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString() || ""}
                            >
                              <SelectTrigger className="transition-colors focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="--Select Department--" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((department) => (
                                  <SelectItem
                                    key={department.HRMD_Id}
                                    value={department.HRMD_Id.toString()}
                                  >
                                    {department.HRMD_DepartmentName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.hrmD_Id && (
                          <p className="text-sm text-destructive">
                            {errors.hrmD_Id.message}
                          </p>
                        )}
                      </div>

                      {/* Designation MultiSelect */}
                      <div className="space-y-2">
                        <Label htmlFor="hrmdeS_Ids">
                          Designation(s){" "}
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Controller
                          name="hrmdeS_Ids"
                          control={control}
                          rules={{
                            required: "At least one designation is required",
                          }}
                          render={({ field }) => (
                            <MultiSelect
                              options={designationOptions}
                              onValueChange={(values) =>
                                field.onChange(values.map((v) => parseInt(v)))
                              }
                              defaultValue={
                                field.value?.map((v) => v.toString()) || []
                              }
                              placeholder="--Select Designations--"
                              variant="default"
                              maxCount={3}
                            />
                          )}
                        />
                        {errors.hrmdeS_Ids && (
                          <p className="text-sm text-destructive">
                            {errors.hrmdeS_Ids.message}
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
                      isLoading={isSubmitting}
                      className="order-1 sm:order-2 transition-all duration-200 hover:scale-105 w-fit"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {editingId ? "Update Mapping" : "Save Mapping"}
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

interface GroupDeptDessgMappingTableProps {
  mappings: GroupDeptDessgMappingDetail[];
  isLoading: boolean;
  onEdit: (item: GroupDeptDessgMappingDetail) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

function GroupDeptDessgMappingTable({
  mappings,
  isLoading,
  onEdit,
  onToggleActive,
}: GroupDeptDessgMappingTableProps) {
  const columns: ColumnDef<GroupDeptDessgMappingDetail>[] = [
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
      accessorKey: "HRGTDDS_Id",
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
      accessorKey: "HRMGT_EmployeeGroupType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group Type" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMGT_EmployeeGroupType")}</div>,
      enableSorting: true,
      enableHiding: true,
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
      accessorKey: "HRMDES_DesignationName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Designation Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMDES_DesignationName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRGTDDS_ActiveFlg",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("HRGTDDS_ActiveFlg") as boolean;
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
        const item = cell.getValue() as GroupDeptDessgMappingDetail;
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
                    onToggleActive(item.HRGTDDS_Id, item.HRGTDDS_ActiveFlg)
                  }
                  className={`w-full justify-start ${
                    item.HRGTDDS_ActiveFlg
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.HRGTDDS_ActiveFlg ? "Deactivate" : "Activate"}
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
