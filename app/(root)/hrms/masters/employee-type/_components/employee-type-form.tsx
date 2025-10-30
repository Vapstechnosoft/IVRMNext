"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterEmployeeType } from "@/hooks/hrms/useMasterEmployeeType";
import { employeeTypeSchema } from "@/schemas/hrms/employee-category-schemas";
import type { EmployeeTypeDetail } from "@/types/hrms/master-employee-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type FormFields = z.infer<typeof employeeTypeSchema.addOrUpdate>;

interface EmployeeTypeFormProps {
  selectedRow?: EmployeeTypeDetail;
  onSuccess?: () => void;
  className?: string;
}

export default function EmployeeTypeForm({
  selectedRow,
  onSuccess,
  className = "",
}: EmployeeTypeFormProps) {
  const roleId = HRMS_MI_ID;
  const { saveMutation, refetchAll } = useMasterEmployeeType(roleId);
  const isEditMode = !!selectedRow;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(employeeTypeSchema.addOrUpdate),
    mode: "onChange",
    defaultValues: {
      MI_Id: roleId,
      HRMET_EmployeeType: "",
      HRMET_ActiveFlag: true,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      reset({
        HRMET_Id: selectedRow.HRMET_Id,
        MI_Id: selectedRow.MI_Id,
        HRMET_EmployeeType: selectedRow.HRMET_EmployeeType,
        HRMET_ActiveFlag: selectedRow.HRMET_ActiveFlag,
      });
    }
  }, [selectedRow, reset]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await saveMutation.mutateAsync(data);

      if (response?.success) {
        toast.success(
          response.message ||
            (isEditMode
              ? "Employee type updated successfully"
              : "Employee type saved successfully")
        );
        if (!isEditMode) reset();
        refetchAll();
        onSuccess?.();
      } else {
        toast.error(
          response?.message ||
            (isEditMode
              ? "Failed to update employee type"
              : "Failed to save employee type")
        );
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputText
              label="Employee Type"
              required
              id="HRMET_EmployeeType"
              placeholder="Enter employee type"
              {...register("HRMET_EmployeeType")}
              error={errors.HRMET_EmployeeType?.message}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {errors.root && <FormError>{errors.root.message}</FormError>}
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2"
            isLoading={isSubmitting}
            loadingText={isEditMode ? "Updating..." : "Saving..."}
          >
            <div className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? "Update Employee Type" : "Save Employee Type"}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}

