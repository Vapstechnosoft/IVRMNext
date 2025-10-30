"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../../lib/localdb";
import { saveMasterGrade } from "@/types/hrms/master-grade";
import type { MasterGradeInput } from "@/types/hrms/master-grade";

interface Grade extends BaseEntity {
  gradeName: string;
  gradeDisplayName: string;
  payScaleFrom: string;
  incrementOf: string;
  payScaleTo: string;
  payScaleRange: string;
  order: number;
  isActive: boolean;
}

type GradeFormData = {
  gradeName: string;
  gradeDisplayName: string;
  payScaleFrom: string;
  incrementOf: string;
  payScaleTo: string;
  payScaleRange: string;
  order: number;
};

interface GradeFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialGradeName?: string;
  initialGradeDisplayName?: string;
  initialPayScaleFrom?: string;
  initialIncrementOf?: string;
  initialPayScaleTo?: string;
  initialPayScaleRange?: string;
  initialOrder?: number;
  initialIsActive?: boolean;
}

export default function GradeForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialGradeName = "",
  initialGradeDisplayName = "",
  initialPayScaleFrom = "",
  initialIncrementOf = "",
  initialPayScaleTo = "",
  initialPayScaleRange = "",
  initialOrder = 1,
  initialIsActive = true,
}: GradeFormProps) {
  const db = createLocalCrud<Grade>("master:grade");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GradeFormData>({
    defaultValues: {
      gradeName: initialGradeName,
      gradeDisplayName: initialGradeDisplayName,
      payScaleFrom: initialPayScaleFrom,
      incrementOf: initialIncrementOf,
      payScaleTo: initialPayScaleTo,
      payScaleRange: initialPayScaleRange,
      order: initialOrder,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      gradeName: initialGradeName,
      gradeDisplayName: initialGradeDisplayName,
      payScaleFrom: initialPayScaleFrom,
      incrementOf: initialIncrementOf,
      payScaleTo: initialPayScaleTo,
      payScaleRange: initialPayScaleRange,
      order: initialOrder,
    });
  }, [
    editingId,
    initialGradeName,
    initialGradeDisplayName,
    initialPayScaleFrom,
    initialIncrementOf,
    initialPayScaleTo,
    initialPayScaleRange,
    initialOrder,
    reset,
  ]);

  const onSubmit: SubmitHandler<GradeFormData> = async (data) => {
    try {
      const apiData: MasterGradeInput = {
        HRMG_Id: editingId ?? 0,
        MI_Id: roleId,
        HRMG_GradeName: data.gradeName,
        HRMG_GradeDisplayName: data.gradeDisplayName,
        HRMG_PayScaleFrom: parseFloat(data.payScaleFrom) || 0,
        HRMG_IncrementOf: parseFloat(data.incrementOf) || 0,
        HRMG_PayScaleTo: parseFloat(data.payScaleTo) || 0,
        HRMG_Order: data.order,
        HRMG_ActiveFlag: true, // Default to active for new records
      };

      const response = await saveMasterGrade(apiData);

      if (response.success) {
        toast.success("Grade saved successfully!");
        reset({
          gradeName: "",
          gradeDisplayName: "",
          payScaleFrom: "",
          incrementOf: "",
          payScaleTo: "",
          payScaleRange: "",
          order: 1,
        });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to save grade");
      }
    } catch (error: any) {
      console.error("Error saving grade:", error);
      toast.error(error.message || "Failed to save grade");
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
            {/* Grade Name Input */}
            <div className="space-y-2">
              <InputText
                label="Grade Name"
                required
                id="gradeName"
                {...register("gradeName", {
                  required: "Grade name is required",
                })}
                error={errors.gradeName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Grade Display Name Input */}
            <div className="space-y-2">
              <InputText
                label="Grade Display Name"
                required
                id="gradeDisplayName"
                {...register("gradeDisplayName", {
                  required: "Grade display name is required",
                })}
                error={errors.gradeDisplayName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Pay Scale From Input */}
            <div className="space-y-2">
              <InputText
                label="Pay Scale From"
                id="payScaleFrom"
                {...register("payScaleFrom")}
                error={errors.payScaleFrom?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Increment Of Input */}
            <div className="space-y-2">
              <InputText
                label="Increment Of"
                id="incrementOf"
                {...register("incrementOf")}
                error={errors.incrementOf?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Pay Scale To Input */}
            <div className="space-y-2">
              <InputText
                label="Pay Scale To"
                id="payScaleTo"
                {...register("payScaleTo")}
                error={errors.payScaleTo?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Pay Scale Range Input */}
            <div className="space-y-2">
              <InputText
                label="Pay Scale Range"
                id="payScaleRange"
                {...register("payScaleRange")}
                error={errors.payScaleRange?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Order Input */}
            <div className="space-y-2">
              <InputText
                label="Order"
                type="number"
                id="order"
                {...register("order", { valueAsNumber: true, min: 1 })}
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
                {editingId ? "Update Grade" : "Save Grade"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
