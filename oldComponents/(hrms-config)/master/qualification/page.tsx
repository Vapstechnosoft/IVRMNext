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
  getOnloadCourseDetails,
  saveMasterCourse,
  editMasterCourse,
  activateDeactivateMasterCourse,
  getCourseById,
} from "@/types/hrms/master-course";
import type {
  MasterCourseResponse,
  CourseDTO,
  MasterCourseInput,
} from "@/types/hrms/master-course";

interface Qualification extends CourseDTO {}

type QualificationForm = {
  qualificationName: string;
  qualificationDescription: string;
  specialization: string | boolean;
  defaultQualification: string | boolean;
  orderNumber: number;
  roleId: number;
};

export default function QualificationMasterPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId, setRoleId] = useState(2); // Default role ID
  const [isOrderEditing, setIsOrderEditing] = useState(false);
  const [orderValues, setOrderValues] = useState<Record<number, number>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QualificationForm>({
    mode: "onChange",
    defaultValues: {
      qualificationName: "",
      qualificationDescription: "",
      specialization: false,
      defaultQualification: false,
      orderNumber: 0,
      roleId: 2,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadQualifications();
  }, [roleId]);

  const loadQualifications = async () => {
    try {
      setIsLoading(true);
      const response = await getOnloadCourseDetails(roleId);

      if (response.success && response.data) {
        // Use CourseList array from the response and sort by order number
        const courses = (response.data.CourseList || []).sort(
          (a: Qualification, b: Qualification) =>
            (a.HRMC_Order || 0) - (b.HRMC_Order || 0)
        );
        setQualifications(courses);
        toast.success(`Loaded ${courses.length} qualifications`);
      } else {
        toast.error(response.message || "Failed to load qualifications");
        setQualifications([]);
      }
    } catch (error) {
      console.error("Error loading qualifications:", error);
      toast.error("Failed to load qualifications");
      setQualifications([]);
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

  const onSubmit: SubmitHandler<QualificationForm> = async (
    data: QualificationForm
  ) => {
    try {
      // Prepare the data for the API
      // Convert string "true"/"false" to actual booleans
      const defaultQualBool =
        data.defaultQualification === true ||
        data.defaultQualification === "true";
      const specializationBool =
        data.specialization === true || data.specialization === "true";

      const saveData: MasterCourseInput = {
        HRMC_Id: editingId || 0,
        MI_Id: data.roleId,
        HRMC_QulaificationName: data.qualificationName,
        HRMC_QualificationDesc: data.qualificationDescription,
        HRMC_DefaultQualFag: defaultQualBool,
        HRMC_SpecialisationFlag: specializationBool,
        HRMC_ActiveFlag: true, // Default to active when creating
        HRMC_Order: data.orderNumber || 0,
        roleId: data.roleId,
      };

      console.log("Form data before conversion:", {
        defaultQualification: data.defaultQualification,
        specialization: data.specialization,
        types: {
          defaultQual: typeof data.defaultQualification,
          specialization: typeof data.specialization,
        },
      });
      console.log("After boolean conversion:", {
        HRMC_DefaultQualFag: defaultQualBool,
        HRMC_SpecialisationFlag: specializationBool,
        types: {
          defaultQual: typeof defaultQualBool,
          specialization: typeof specializationBool,
        },
      });

      console.log(
        editingId ? "Updating" : "Creating",
        "qualification data:",
        saveData
      );

      // Both create and update use the same endpoint
      const response = await saveMasterCourse(saveData);

      if (response.success) {
        toast.success(
          `Successfully ${editingId ? "updated" : "created"} qualification: ${
            data.qualificationName
          }`
        );
        handleFormClose();
        // Reload the data to show the new/updated item
        loadQualifications();
      } else {
        toast.error(response.message || "Failed to save qualification");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save qualification");
    }
  };

  const handleEdit = (item: Qualification) => {
    setEditingId(item.HRMC_Id);
    setValue("qualificationName", item.HRMC_QulaificationName);
    setValue("qualificationDescription", item.HRMC_QualificationDesc);
    setValue("specialization", item.HRMC_SpecialisationFlag ? "true" : "false");
    setValue(
      "defaultQualification",
      item.HRMC_DefaultQualFag ? "true" : "false"
    );
    setValue("orderNumber", item.HRMC_Order);
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
      const response = await activateDeactivateMasterCourse({
        HRMC_Id: id,
        HRMC_ActiveFlag: newStatus,
        roleId: roleId,
      });

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the qualification record`
        );
        // Reload the data to reflect the changes
        loadQualifications();
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
      qualifications.forEach((qual) => {
        initialOrderValues[qual.HRMC_Id] = qual.HRMC_Order || 0;
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

      // Update each qualification with new order
      const updatePromises = Object.entries(orderValues).map(
        async ([id, order]) => {
          const qualification = qualifications.find(
            (q) => q.HRMC_Id === parseInt(id)
          );
          if (qualification && qualification.HRMC_Order !== order) {
            const updateData: MasterCourseInput = {
              HRMC_Id: qualification.HRMC_Id,
              MI_Id: qualification.MI_Id,
              HRMC_QulaificationName: qualification.HRMC_QulaificationName,
              HRMC_QualificationDesc: qualification.HRMC_QualificationDesc,
              HRMC_DefaultQualFag: qualification.HRMC_DefaultQualFag,
              HRMC_SpecialisationFlag: qualification.HRMC_SpecialisationFlag,
              HRMC_ActiveFlag: qualification.HRMC_ActiveFlag,
              HRMC_Order: order,
              roleId: qualification.MI_Id,
            };

            return saveMasterCourse(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully updated order for ${successCount} qualifications`
        );
        setIsOrderEditing(false);
        setOrderValues({});
        // Reload data to reflect changes
        loadQualifications();
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
              title="Master Course Management"
              description="Manage educational courses and qualifications"
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
              Add Course
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
          title="Qualifications Data"
          description="View, search, and manage all qualification options"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <QualificationTable
            qualifications={qualifications}
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
              title={editingId ? "Update Course" : "Add New Course"}
              description="Fill in the details below to create a new course"
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
                      <InputText
                        label="Course Name"
                        required
                        id="qualificationName"
                        placeholder="e.g., B.Sc, MBA, M.Sc"
                        {...register("qualificationName", {
                          required: "Course name is required",
                        })}
                        error={errors.qualificationName?.message}
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <InputText
                        label="Course Description"
                        required
                        id="qualificationDescription"
                        placeholder="e.g., Computer Science, Finance and HR"
                        {...register("qualificationDescription", {
                          required: "Course description is required",
                        })}
                        error={errors.qualificationDescription?.message}
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
                      {/* Specialization */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Specialization *
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="true"
                              {...register("specialization", {
                                required: "Specialization is required",
                              })}
                            />
                            YES
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="false"
                              {...register("specialization", {
                                required: "Specialization is required",
                              })}
                            />
                            NO
                          </label>
                        </div>
                        {errors.specialization && (
                          <p className="text-sm text-destructive">
                            {errors.specialization.message}
                          </p>
                        )}
                      </div>

                      {/* Default Qualification */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Default Qualification *
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="true"
                              {...register("defaultQualification", {
                                required: "Default qualification is required",
                              })}
                            />
                            YES
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="false"
                              {...register("defaultQualification", {
                                required: "Default qualification is required",
                              })}
                            />
                            NO
                          </label>
                        </div>
                        {errors.defaultQualification && (
                          <p className="text-sm text-destructive">
                            {errors.defaultQualification.message}
                          </p>
                        )}
                      </div>
                    </div>

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
                          {editingId ? "Update Course" : "Save Course"}
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

interface QualificationTableProps {
  qualifications: Qualification[];
  isLoading: boolean;
  onEdit: (item: Qualification) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  isOrderEditing: boolean;
  orderValues: Record<number, number>;
  onOrderChange: (id: number, value: number) => void;
}

function QualificationTable({
  qualifications,
  isLoading,
  onEdit,
  onToggleActive,
  isOrderEditing,
  orderValues,
  onOrderChange,
}: QualificationTableProps) {
  const columns: ColumnDef<Qualification>[] = [
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
      accessorKey: "HRMC_Id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SL NO" />
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
      accessorKey: "HRMC_Order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => {
        const id = row.original.HRMC_Id;
        const currentOrder = row.getValue("HRMC_Order") as number;

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
      accessorKey: "HRMC_QulaificationName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Course Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMC_QulaificationName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMC_QualificationDesc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Course Description" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRMC_QualificationDesc")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMC_DefaultQualFag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Default Qualification" />
      ),
      cell: ({ row }) => (
        <div>{row.getValue("HRMC_DefaultQualFag") ? "Yes" : "No"}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMC_SpecialisationFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Specialization" />
      ),
      cell: ({ row }) => (
        <div>{row.getValue("HRMC_SpecialisationFlag") ? "Yes" : "No"}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRMC_ActiveFlag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("HRMC_ActiveFlag") ? "success" : "destructive"}
        >
          {row.getValue("HRMC_ActiveFlag") ? "Active" : "Inactive"}
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
        const item = cell.getValue() as Qualification;
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
                    onToggleActive(item.HRMC_Id, item.HRMC_ActiveFlag)
                  }
                  className={`w-full justify-start ${
                    item.HRMC_ActiveFlag ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {item.HRMC_ActiveFlag ? "Deactivate" : "Activate"}
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
        data={qualifications}
        totalItems={qualifications.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
