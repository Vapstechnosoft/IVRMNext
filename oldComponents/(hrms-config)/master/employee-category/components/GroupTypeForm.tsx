"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../../lib/localdb";
import { saveMasterGroupType } from "@/types/hrms/master-group-type";
import type { MasterGroupTypeInput } from "@/types/hrms/master-group-type";
import { GROUP_TYPE_VALIDATION } from "@/lib/validation/hrms-master-validation";

interface GroupType extends BaseEntity {
  groupType: string;
  groupCode: string;
  order: number;
  isActive: boolean;
}

type GroupTypeFormData = {
  groupType: string;
  groupCode: string;
  order: number;
  isActive: boolean;
};

interface GroupTypeFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialGroupType?: string;
  initialGroupCode?: string;
  initialOrder?: number;
  initialIsActive?: boolean;
}

export default function GroupTypeForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialGroupType = "",
  initialGroupCode = "",
  initialOrder = 1,
  initialIsActive = true,
}: GroupTypeFormProps) {
  const db = createLocalCrud<GroupType>("master:group-type");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupTypeFormData>({
    defaultValues: {
      groupType: initialGroupType,
      groupCode: initialGroupCode,
      order: initialOrder,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      groupType: initialGroupType,
      groupCode: initialGroupCode,
      order: initialOrder,
      isActive: initialIsActive,
    });
  }, [
    editingId,
    initialGroupType,
    initialGroupCode,
    initialOrder,
    initialIsActive,
    reset,
  ]);

  const onSubmit: SubmitHandler<GroupTypeFormData> = async (data) => {
    try {
      const apiData: MasterGroupTypeInput = {
        HRMGT_Id: editingId ?? 0,
        MI_Id: roleId,
        HRMGT_EmployeeGroupType: data.groupType,
        HRMGT_Code: data.groupCode,
        HRMGT_Order: data.order,
        HRMGT_ActiveFlag: true, // Always set to true by default
      };

      const response = await saveMasterGroupType(apiData);

      if (response.success) {
        toast.success("Group type saved successfully!");
        reset({ groupType: "", groupCode: "", order: 1, isActive: true });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to save group type");
      }
    } catch (error: any) {
      console.error("Error saving group type:", error);
      toast.error(error.message || "Failed to save group type");
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
            {/* Group Type Input */}
            <div className="space-y-2">
              <InputText
                label="Group Type"
                required
                id="groupType"
                placeholder="Enter group type (max 50 characters, letters only)"
                {...register("groupType", GROUP_TYPE_VALIDATION.groupType)}
                error={errors.groupType?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Group Code Input */}
            <div className="space-y-2">
              <InputText
                label="Group Code"
                required
                id="groupCode"
                placeholder="Enter group code (max 20 characters, alphanumeric)"
                {...register("groupCode", GROUP_TYPE_VALIDATION.groupCode)}
                error={errors.groupCode?.message}
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
                placeholder="Enter order (max 10 digits)"
                {...register("order", {
                  ...GROUP_TYPE_VALIDATION.order,
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
                {editingId ? "Update Group Type" : "Save Group Type"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
