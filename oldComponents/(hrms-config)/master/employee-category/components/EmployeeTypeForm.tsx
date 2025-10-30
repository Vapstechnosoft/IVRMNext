"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../../lib/localdb";
import { saveMasterEmployeeType } from "@/types/hrms/master-employee-type";
import type { MasterEmployeeTypeInput } from "@/types/hrms/master-employee-type";
import { EMPLOYEE_TYPE_VALIDATION } from "@/lib/validation/hrms-master-validation";

type EmployeeTypeFormData = {
  employeeType: string;
  isActive: boolean;
};

interface EmployeeTypeFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialEmployeeType?: string;
  initialIsActive?: boolean;
}

export default function EmployeeTypeForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialEmployeeType = "",
  initialIsActive = true,
}: EmployeeTypeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeTypeFormData>({
    defaultValues: {
      employeeType: initialEmployeeType,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  // Sync form when editing selection changes
  useEffect(() => {
    reset({
      employeeType: initialEmployeeType,
      isActive: initialIsActive,
    });
  }, [editingId, initialEmployeeType, initialIsActive, reset]);

  const onSubmit: SubmitHandler<EmployeeTypeFormData> = async (data) => {
    try {
      const apiData: MasterEmployeeTypeInput = {
        HRMET_Id: editingId ?? 0,
        MI_Id: roleId,
        HRMET_EmployeeType: data.employeeType,
        HRMET_ActiveFlag: true, // Always set to true by default
      };

      const response = await saveMasterEmployeeType(apiData);

      if (response.success) {
        toast.success("Employee type saved successfully!");
        reset({ employeeType: "", isActive: true });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to save employee type");
      }
    } catch (error: any) {
      console.error("Error saving employee type:", error);
      toast.error(error.message || "Failed to save employee type");
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Employee Type Input */}
            <div className="space-y-2 lg:col-span-1">
              <InputText
                label="Employee Type"
                required
                id="employeeType"
                placeholder="Enter employee type (max 50 characters, letters only)"
                {...register(
                  "employeeType",
                  EMPLOYEE_TYPE_VALIDATION.employeeType
                )}
                error={errors.employeeType?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Empty divs to maintain grid structure */}
            <div className="lg:col-span-2"></div>
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
                {editingId ? "Update Employee Type" : "Save Employee Type"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
