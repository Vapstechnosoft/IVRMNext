"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../../lib/localdb";
import { saveMasterDepartment } from "@/types/hrms/master-department";
import type { MasterDepartmentInput } from "@/types/hrms/master-department";
import { DEPARTMENT_VALIDATION } from "@/lib/validation/hrms-master-validation";

interface Department extends BaseEntity {
  departmentName: string;
  internalTrainingHours: string;
  order: number;
  isActive: boolean;
}

type DepartmentFormData = {
  departmentName: string;
  internalTrainingHours: string;
  order: number;
  isActive: boolean;
};

interface DepartmentFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialDepartmentName?: string;
  initialInternalTrainingHours?: string;
  initialOrder?: number;
  initialIsActive?: boolean;
}

export default function DepartmentForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialDepartmentName = "",
  initialInternalTrainingHours = "",
  initialOrder = 1,
  initialIsActive = true,
}: DepartmentFormProps) {
  const db = createLocalCrud<Department>("master:department");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormData>({
    defaultValues: {
      departmentName: initialDepartmentName,
      internalTrainingHours: initialInternalTrainingHours,
      order: initialOrder,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      departmentName: initialDepartmentName,
      internalTrainingHours: initialInternalTrainingHours,
      order: initialOrder,
      isActive: initialIsActive,
    });
  }, [
    editingId,
    initialDepartmentName,
    initialInternalTrainingHours,
    initialOrder,
    initialIsActive,
    reset,
  ]);

  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    try {
      const apiData: MasterDepartmentInput = {
        HRMD_Id: editingId ?? 0,
        MI_Id: roleId,
        HRMD_DepartmentName: data.departmentName,
        HRMD_Order: data.order,
        HRMD_ActiveFlag: true, // Always set to true by default
        HRMD_InternalTrainingMinimumHrs:
          parseFloat(data.internalTrainingHours) || 0,
      };

      const response = await saveMasterDepartment(apiData);

      if (response.success) {
        toast.success("Department saved successfully!");
        reset({
          departmentName: "",
          internalTrainingHours: "",
          order: 1,
          isActive: true,
        });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to save department");
      }
    } catch (error: any) {
      console.error("Error saving department:", error);
      toast.error(error.message || "Failed to save department");
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Information Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Department Name Input */}
            <div className="space-y-2">
              <InputText
                label="Department Name"
                required
                id="departmentName"
                placeholder="Enter department name (max 50 characters, letters only)"
                {...register(
                  "departmentName",
                  DEPARTMENT_VALIDATION.departmentName
                )}
                error={errors.departmentName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Internal Training Hours Input */}
            <div className="space-y-2">
              <InputText
                label="Internal Training Hours"
                type="number"
                id="internalTrainingHours"
                placeholder="Enter training hours (max 2 digits)"
                {...register(
                  "internalTrainingHours",
                  DEPARTMENT_VALIDATION.internalTrainingHours
                )}
                error={errors.internalTrainingHours?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Order Input */}
            <div className="space-y-2">
              <InputText
                label="Order"
                type="number"
                required
                id="order"
                placeholder="Enter order (max 4 digits)"
                {...register("order", {
                  ...DEPARTMENT_VALIDATION.order,
                  valueAsNumber: true,
                })}
                error={errors.order?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Root Error */}
          {errors.root && <FormError>{errors.root.message}</FormError>}
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
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Update Department" : "Save Department"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
